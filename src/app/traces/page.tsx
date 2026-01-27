'use client';

import { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, TextField, Button, Typography, Box } from '@mui/material';
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

	// Feature sidebar state
	const [features, setFeatures] = useState<{ id: number; featureName: string }[]>([]);
	const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
	const [featuresLoading, setFeaturesLoading] = useState(false);
	const [featuresError, setFeaturesError] = useState<string | null>(null);

	const test_project_id = 1; // TODO: Replace with actual project id source

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
					params: { test_project_id },
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token') || ''}`
					}
				});
				console.log('Fetched features:', res.data);
				setFeatures(res.data?.result || []);
			} catch (err: any) {
				setFeaturesError(err?.message || 'Failed to fetch features');
			} finally {
				setFeaturesLoading(false);
			}
		};
		fetchFeatures();
	}, [test_project_id]);

	// Fetch traces only when a feature is selected
	useEffect(() => {
		if (!selectedFeatureId) return;

		setLoading(true);
		setError('');
		const offset = pagination.pageIndex * pagination.pageSize;
		// Add feature_id to filter
		// const featureFilter = filter
		// 	? `${filter} AND metadata['feature_id'] = ${selectedFeatureId}`
		// 	: `metadata['feature_id'] = ${selectedFeatureId}`;
		const featureFilter = '';
		fetchTraces({ limit: pagination.pageSize, offset, filter: featureFilter })
			.then((res) => {
				setTraces(res.result.data.data || []);
				setCount(res.result.total || 0);
			})
			.catch((err) => setError(err.message || 'Failed to fetch traces'))
			.finally(() => setLoading(false));
	}, [filter, pagination.pageIndex, pagination.pageSize, selectedFeatureId]);

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
						{row.original.timestamp ? new Date(row.original.timestamp).toLocaleString() : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => <Typography>{row.original.name ?? ''}</Typography>
			},
			{
				accessorKey: 'project_id',
				header: 'Project ID',
				Cell: ({ row }) => <Typography>{row.original.project_id ?? ''}</Typography>
			},
			{
				accessorKey: 'user_id',
				header: 'User ID',
				Cell: ({ row }) => <Typography>{row.original.user_id ?? ''}</Typography>
			}
		],
		[]
	);

	return (
		<FusePageSimple
			header={<TracesHeader />}
			content={
				<div style={{ display: 'flex', height: '100%' }}>
					{/* Sidebar for features */}
					<div style={{ width: 240, borderRight: '1px solid #eee', padding: 16, background: '#fafafa' }}>
						<h3 style={{ marginTop: 0 }}>Features</h3>
						{featuresLoading ? (
							<div>Loading...</div>
						) : featuresError ? (
							<div style={{ color: 'red' }}>{featuresError}</div>
						) : (
							<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
								{features.map((feature) => (
									<li key={feature.id}>
										<button
											style={{
												width: '100%',
												textAlign: 'left',
												padding: '8px 12px',
												background:
													selectedFeatureId === feature.id ? '#e0e7ff' : 'transparent',
												border: 'none',
												borderRadius: 4,
												cursor: 'pointer',
												fontWeight: selectedFeatureId === feature.id ? 600 : 400
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
					{/* Main trace table area */}
					<div style={{ flex: 1, padding: 24 }}>
						{/* Filter UI */}
						<Paper sx={{ mb: 2, p: 2 }}>
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
								<TextField
									label="Name contains"
									value={name}
									onChange={(e) => setName(e.target.value)}
									size="small"
									sx={{ minWidth: 200 }}
									placeholder="e.g. chat"
								/>
								<TextField
									label="Start date"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									size="small"
									sx={{ minWidth: 160 }}
									InputLabelProps={{ shrink: true }}
								/>
								<TextField
									label="End date"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									size="small"
									sx={{ minWidth: 160 }}
									InputLabelProps={{ shrink: true }}
								/>
								<Button
									variant="contained"
									onClick={handleApplyFilter}
								>
									Apply Filter
								</Button>
							</Box>
						</Paper>
						{/* Only show table if a feature is selected */}
						{!selectedFeatureId ? (
							<div style={{ color: '#888', fontStyle: 'italic' }}>
								Select a feature to view its traces.
							</div>
						) : (
							<>
								<Paper
									className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
									elevation={0}
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
											<div style={{ display: 'flex', gap: 8 }}>
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
								</Paper>
								<TraceDetailDialog
									open={dialogOpen}
									onClose={handleCloseDialog}
									traceId={selectedTraceId}
								/>
							</>
						)}
					</div>
				</div>
			}
		/>
	);
}
