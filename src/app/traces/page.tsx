'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { fetchTraces } from '@/services/traceListService';
import TraceDetailDialog from '@/components/TraceDetailDialog';
import TracesHeader from '@/components/TracesHeader';

interface Trace {
	id: string;
	timestamp: string;
	name: string;
	project_id: string;
	user_id: string;
	steps: number;
}

export default function TraceListPage() {
	const [traces, setTraces] = useState<Trace[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [name, setName] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [filter, setFilter] = useState('');

	// Auto-refresh state
	const [autoRefresh, setAutoRefresh] = useState<'off' | '60000'>('off');
	const [refreshKey, setRefreshKey] = useState(0);

	// Feature sidebar state
	const [features, setFeatures] = useState<{ id: number; featureName: string }[]>([]);
	const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
	const [featuresLoading, setFeaturesLoading] = useState(false);
	const [featuresError, setFeaturesError] = useState<string | null>(null);

	const testProjectId = 1; // TODO: Replace with actual project id source

	// Pagination state
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10
	});

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

	// Fetch features for sidebar
	useEffect(() => {
		const fetchFeatures = async () => {
			setFeaturesLoading(true);
			setFeaturesError(null);
			try {
				const res = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/features/list', {
					params: { testProjectId },
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token') || ''}`
					}
				});
				console.log('Fetched features:', res.data);
				const featureList = res.data?.result || [];
				setFeatures(featureList);

				if (featureList.length > 0) {
					setSelectedFeatureId(featureList[0].id);
				}
			} catch (err: any) {
				setFeaturesError(err?.message || 'Failed to fetch features');
			} finally {
				setFeaturesLoading(false);
			}
		};
		fetchFeatures();
	}, [testProjectId]);

	// Fetch traces function
	const loadTraces = useCallback(() => {
		if (!selectedFeatureId) return;

		setLoading(true);
		setError('');
		const offset = pagination.pageIndex * pagination.pageSize;
		const featureFilter = filter
			? `${filter} AND metadata['feature_id'] = '${selectedFeatureId}'`
			: `metadata['feature_id'] = '${selectedFeatureId}'`;

		fetchTraces({ limit: pagination.pageSize, offset, filter: featureFilter })
			.then((res) => {
				setTraces(res.result.data.data || []);
				setCount(res.result.total || 0);
			})
			.catch((err) => setError(err.message || 'Failed to fetch traces'))
			.finally(() => setLoading(false));
	}, [filter, pagination.pageIndex, pagination.pageSize, selectedFeatureId]);

	// Fetch traces when dependencies change
	useEffect(() => {
		loadTraces();
	}, [loadTraces, refreshKey]);

	// Auto-refresh interval
	useEffect(() => {
		if (autoRefresh === 'off') return;

		const interval = setInterval(() => {
			loadTraces();
		}, parseInt(autoRefresh));

		return () => clearInterval(interval);
	}, [autoRefresh, loadTraces]);

	// Manual refresh handler
	const handleManualRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	useEffect(() => {
		console.log('Current features:', features);
	}, [features]);

	const handleApplyFilter = () => {
		const filterParts = [];

		if (name) filterParts.push(`name LIKE '%${name.replace(/'/g, "''")}%'`);

		if (startDate) filterParts.push(`timestamp >= '${startDate}'`);

		if (endDate) filterParts.push(`timestamp <= '${endDate}'`);

		setFilter(filterParts.join(' AND '));
		// Reset to first page when filters change
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const handleOpenDialog = (traceId: string) => {
		setSelectedTraceId(traceId);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedTraceId(null);
	};

	const columns = useMemo<MRT_ColumnDef<Trace>[]>(
		() => [
			{
				accessorKey: 'timestamp',
				header: 'Timestamp',
				Cell: ({ row }) => (
					<Typography>
						{row.original.timestamp ? new Date(row.original.timestamp + 'Z').toLocaleString() : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => <Typography>{row.original.name ?? ''}</Typography>
			},
			{
				header: 'Environment',
				Cell: () => <Typography>Development</Typography>
			},
			{
				header: 'Steps',
				Cell: ({ row }) => <Typography>{row.original.steps ?? 0}</Typography>
			}
			// {
			// 	accessorKey: 'project_id',
			// 	header: 'Project ID',
			// 	Cell: ({ row }) => <Typography>{row.original.project_id ?? ''}</Typography>
			// },
			// {
			// 	accessorKey: 'user_id',
			// 	header: 'User ID',
			// 	Cell: ({ row }) => <Typography>{row.original.user_id ?? ''}</Typography>
			// }
		],
		[]
	);

	return (
		<FusePageSimple
			header={<TracesHeader />}
			content={
				<div
					className="flex h-full min-h-0 w-full flex-col p-0"
					style={{ height: '100vh', minHeight: 0 }}
				>
					{/* Filter UI */}
					<Paper
						sx={{ p: 2, borderRadius: 0 }}
						elevation={1}
						className="border-b-2 border-gray-300"
					>
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderRadius: 0 }}>
							<TextField
								label="Name contains"
								value={name}
								onChange={(e) => setName(e.target.value)}
								size="small"
								sx={{ minWidth: 200 }}
								placeholder="e.g. chat"
							/>
							{/* <TextField
								label="Start date"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								size="small"
								sx={{ minWidth: 160 }}
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								label="End date"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								size="small"
								sx={{ minWidth: 160 }}
								slotProps={{ inputLabel: { shrink: true } }}
							/> */}
							<FormControl
								size="small"
								sx={{ minWidth: 160 }}
							>
								<InputLabel>Environment</InputLabel>
								<Select
									label="Environment"
									defaultValue="development"
									sx={{ minWidth: 160 }}
								>
									<MenuItem value="development">Development</MenuItem>
								</Select>
							</FormControl>
							<Button
								variant="contained"
								onClick={handleApplyFilter}
							>
								Apply Filter
							</Button>
							<FormControl
								size="small"
								sx={{ minWidth: 160 }}
							>
								<InputLabel>Auto Refresh</InputLabel>
								<Select
									value={autoRefresh}
									label="Auto Refresh"
									onChange={(e) => setAutoRefresh(e.target.value as 'off' | '60000')}
								>
									<MenuItem value="off">Off</MenuItem>
									<MenuItem value="60000">Once per minute</MenuItem>
								</Select>
							</FormControl>
							<Button
								variant="outlined"
								onClick={handleManualRefresh}
							>
								Refresh
							</Button>
						</Box>
					</Paper>
					{/* Only show table if a feature is selected */}
					{!selectedFeatureId ? (
						<div style={{ color: '#888', fontStyle: 'italic' }}>Select a feature to view its traces.</div>
					) : (
						<>
							<Paper
								className="shadow-1 flex h-full w-full flex-auto flex-row overflow-hidden rounded-t-lg rounded-b-none"
								elevation={0}
								style={{ minHeight: 0 }}
							>
								<div
									style={{
										width: '300px',
										minWidth: '300px',
										maxWidth: '300px',
										height: '100%',
										padding: 16,
										background: '#fafafa'
									}}
								>
									<h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>
										Features
									</h3>
									{featuresLoading ? (
										<div>Loading...</div>
									) : featuresError ? (
										<div style={{ color: 'red' }}>{featuresError}</div>
									) : (
										<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
											{features.map((feature) => (
												<li
													key={feature.id}
													style={{ marginBottom: 4 }}
												>
													<button
														style={{
															width: '100%',
															textAlign: 'left',
															padding: '10px 12px',
															background:
																selectedFeatureId === feature.id
																	? '#e0e7ff'
																	: 'transparent',
															border: 'none',
															borderRadius: 6,
															cursor: 'pointer',
															fontWeight: 400,
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															if (selectedFeatureId !== feature.id) {
																e.currentTarget.style.background = '#f5f5f5';
															}
														}}
														onMouseLeave={(e) => {
															if (selectedFeatureId !== feature.id) {
																e.currentTarget.style.background = 'transparent';
															}
														}}
														onClick={() => setSelectedFeatureId(feature.id)}
													>
														{feature.featureName}
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
								<div
									className="flex h-full min-h-0 flex-auto flex-col"
									style={{ height: '100%', minHeight: 0, overflow: 'auto' }}
								>
									<DataTable
										data={traces}
										columns={columns}
										manualPagination
										rowCount={count}
										state={{
											isLoading: loading,
											pagination
										}}
										onPaginationChange={setPagination}
										renderRowActions={({ row }) => (
											<div
												style={{
													display: 'flex',
													gap: 8,
													flexGrow: 1,
													justifyContent: 'flex-end'
												}}
											>
												<Button
													size="small"
													variant="outlined"
													onClick={() => handleOpenDialog(row.original.id)}
												>
													Detail
												</Button>
											</div>
										)}
									/>
									{error && (
										<Typography
											color="error"
											className="p-4"
										>
											{error}
										</Typography>
									)}
								</div>
							</Paper>
							<TraceDetailDialog
								open={dialogOpen}
								onClose={handleCloseDialog}
								traceId={selectedTraceId}
							/>
						</>
					)}
				</div>
			}
		/>
	);
}
