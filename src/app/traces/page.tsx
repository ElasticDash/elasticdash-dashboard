'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import TraceDetailDialog from '@/components/TraceDetailDialog';
import TracesHeader from '@/components/TracesHeader';
import { useSearchParams } from 'next/navigation';
import { createTestCaseFromTrace, fetchTraces } from '@/services/traceService';
import { fetchFeatures, deleteFeature, updateFeature } from '@/services/featureService';
import DeleteFeatureDialog from '@/components/DeleteFeatureDialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import RenameFeatureDialog from '@/components/RenameFeatureDialog';

interface Trace {
	id: string;
	timestamp: string;
	name: string;
	project_id: string;
	user_id: string;
	steps: number;
}

export default function TraceListPage() {
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams.toString());
	const [traces, setTraces] = useState<Trace[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [filter, setFilter] = useState('');

	// Auto-refresh state
	const [autoRefresh, setAutoRefresh] = useState<'off' | '60000'>('off');
	const [refreshKey, setRefreshKey] = useState(0);

	// Feature sidebar state
	const [features, setFeatures] = useState<{ id: number; featureName: string; displayedName?: string }[]>([]);
	// Rename feature dialog state
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [featureToRename, setFeatureToRename] = useState<{ id: number; displayedName?: string } | null>(null);
	const [renameLoading, setRenameLoading] = useState(false);
	const [renameError, setRenameError] = useState<string | null>(null);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [menuFeatureId, setMenuFeatureId] = useState<number | null>(null);
	const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
	const [featuresLoading, setFeaturesLoading] = useState(false);
	const [featuresError, setFeaturesError] = useState<string | null>(null);

	const testProjectId = 1; // TODO: Replace with actual project id source

	// Pagination state
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 13
	});

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
	const [testCaseLoading, setTestCaseLoading] = useState(false);
	const [testCaseError, setTestCaseError] = useState<string | null>(null);
	const [testCaseSuccess, setTestCaseSuccess] = useState<string | null>(null);

	// Delete feature dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [featureToDelete, setFeatureToDelete] = useState<{ id: number; featureName: string } | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		console.log('init is triggered');
		const paramTraceId = params.get('traceId');
		const paramFeatureId = params.get('featureId');
		console.log('paramTraceId:', paramTraceId);
		console.log('paramFeatureId:', paramFeatureId);

		if (paramFeatureId && parseInt(paramFeatureId, 10) !== selectedFeatureId) {
			setSelectedFeatureId(parseInt(paramFeatureId, 10));
		}

		if (paramTraceId && paramTraceId !== selectedTraceId) {
			setSelectedTraceId(paramTraceId);
			setDialogOpen(true);
		}
	}, []);

	// Fetch features for sidebar
	const fetchFeaturesHandler = async () => {
		setFeaturesLoading(true);
		setFeaturesError(null);
		try {
			const res = await fetchFeatures();
			const featureList = res || [];
			setFeatures(featureList);
			const params = new URLSearchParams(searchParams.toString());
			const paramFeatureId = params.get('featureId');

			if (featureList.length > 0) {
				if (paramFeatureId && featureList.some((f) => f.id.toString() === paramFeatureId)) {
					setSelectedFeatureId(parseInt(paramFeatureId, 10));
				} else {
					setSelectedFeatureId(featureList[0].id);
					params.set('featureId', featureList[0].id.toString());
					window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
				}
			} else {
				setSelectedFeatureId(null);
			}
		} catch (err: any) {
			setFeaturesError(err?.message || 'Failed to fetch features');
		} finally {
			setFeaturesLoading(false);
		}
	};

	useEffect(() => {
		fetchFeaturesHandler();
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
			.then((res: any) => {
				setTraces(res.result.data.data || []);
				setCount(res.result.total || 0);
			})
			.catch((err) => setError(err.message || 'Failed to fetch traces'))
			.finally(() => setLoading(false));
	}, [filter, pagination.pageIndex, pagination.pageSize, selectedFeatureId]);

	// Fetch traces when dependencies change
	useEffect(() => {
		loadTraces();

		if (selectedFeatureId && params.get('featureId') !== selectedFeatureId.toString()) {
			params.set('featureId', selectedFeatureId.toString());
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
		}
	}, [loadTraces, refreshKey]);

	useEffect(() => {
		const paramTraceId = params.get('traceId');

		if (selectedTraceId && (!paramTraceId || paramTraceId !== selectedTraceId)) {
			params.set('traceId', selectedTraceId);
		}
	}, [selectedTraceId]);

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

	const handleCreateTestCase = async (traceId: string) => {
		if (!traceId) return;

		setTestCaseLoading(true);
		setTestCaseError(null);
		setTestCaseSuccess(null);
		try {
			const res = await createTestCaseFromTrace({ traceId });

			if (!res.success) {
				setTestCaseError(res.error || 'Failed to create test case from trace');
			} else {
				setTestCaseSuccess('Test case created successfully!');
			}
		} catch (err: any) {
			setTestCaseError(err.message || 'Failed to create test case from trace');
		} finally {
			setTestCaseLoading(false);
		}
	};

	const handleOpenDialog = (traceId: string) => {
		setSelectedTraceId(traceId);
		setDialogOpen(true);
		params.set('traceId', traceId);
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedTraceId(null);
		params.delete('traceId');
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
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
				<div className="flex h-full min-h-0 w-full flex-col p-0">
					{/* Filter UI */}
					<Paper
						sx={{ p: 2, borderRadius: 0 }}
						elevation={1}
						className="border-b-2 border-gray-300"
					>
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderRadius: 0 }}>
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
													className={
														'list-item' +
														(selectedFeatureId === feature.id ? ' active' : '')
													}
													style={{
														display: 'flex',
														alignItems: 'center',
														position: 'relative'
													}}
												>
													<button
														className={'detail-btn'}
														onClick={() => setSelectedFeatureId(feature.id)}
														style={{
															flex: 1,
															textAlign: 'left',
															padding: '10px 12px',
															border: 'none',
															borderRadius: 6,
															cursor: 'pointer',
															fontWeight: 400,
															transition: 'all 0.2s ease'
														}}
													>
														{feature.displayedName || feature.featureName}
													</button>
													<Button
														size="small"
														style={{ minWidth: 0, padding: 4 }}
														onClick={(e) => {
															setMenuAnchorEl(e.currentTarget);
															setMenuFeatureId(feature.id);
														}}
													>
														<MoreVertIcon />
													</Button>
												</li>
											))}
										</ul>
									)}
									<Menu
										anchorEl={menuAnchorEl}
										open={Boolean(menuAnchorEl)}
										onClose={() => {
											setMenuAnchorEl(null);
											setMenuFeatureId(null);
										}}
									>
										<MenuItem
											onClick={() => {
												const feature = features.find((f) => f.id === menuFeatureId);
												setFeatureToRename(
													feature
														? {
																id: feature.id,
																displayedName:
																	feature.displayedName || feature.featureName
															}
														: null
												);
												setRenameDialogOpen(true);
												setMenuAnchorEl(null);
												setMenuFeatureId(null);
											}}
										>
											Rename
										</MenuItem>
										<MenuItem
											onClick={() => {
												const feature = features.find((f) => f.id === menuFeatureId);
												setFeatureToDelete(feature || null);
												setDeleteDialogOpen(true);
												setMenuAnchorEl(null);
												setMenuFeatureId(null);
											}}
											style={{ color: '#d32f2f' }}
										>
											Delete
										</MenuItem>
									</Menu>
								</div>
								<RenameFeatureDialog
									open={renameDialogOpen}
									initialName={featureToRename?.displayedName || ''}
									onClose={() => {
										setRenameDialogOpen(false);
										setFeatureToRename(null);
										setRenameError(null);
									}}
									onConfirm={async (newName) => {
										if (!featureToRename) return;

										setRenameLoading(true);
										setRenameError(null);
										try {
											await updateFeature(featureToRename.id.toString(), newName);
											setRenameDialogOpen(false);
											setFeatureToRename(null);
											setRenameError(null);
											await fetchFeaturesHandler();
										} catch (err: any) {
											setRenameError(err.message || 'Failed to rename feature');
										} finally {
											setRenameLoading(false);
										}
									}}
									loading={renameLoading}
									error={renameError}
								/>
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
										enableGlobalFilter={false}
										enableColumnFilters={false}
										onPaginationChange={setPagination}
										onRowClick={(row, event) => {
											// Only trigger if not clicking on a button or inside a button
											if (
												event.target instanceof HTMLElement &&
												!event.target.closest('button')
											) {
												handleOpenDialog(row.original.id);
											}
										}}
										renderRowActions={({ row }) => (
											<div style={{ display: 'flex', gap: 8 }}>
												<Button
													size="small"
													variant="contained"
													color="success"
													disabled={testCaseLoading}
													onClick={() => handleCreateTestCase(row.original.id)}
												>
													{testCaseLoading ? 'Creating...' : 'Create Test Case'}
												</Button>
											</div>
										)}
									/>
									{testCaseError && (
										<Typography
											color="error"
											className="p-4"
										>
											{testCaseError}
										</Typography>
									)}
									{testCaseSuccess && (
										<Typography
											color="success.main"
											className="p-4"
										>
											{testCaseSuccess}
										</Typography>
									)}
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
							<DeleteFeatureDialog
								open={deleteDialogOpen}
								onClose={() => {
									setDeleteDialogOpen(false);
									setFeatureToDelete(null);
									setDeleteError(null);
								}}
								onConfirm={async () => {
									if (!featureToDelete) return;

									setDeleteLoading(true);
									setDeleteError(null);
									try {
										await deleteFeature(featureToDelete.id.toString());
										setDeleteDialogOpen(false);
										setFeatureToDelete(null);
										setDeleteError(null);
										await fetchFeaturesHandler();

										// If the deleted feature was selected, select the first feature if available
										if (features.length > 0 && selectedFeatureId === featureToDelete.id) {
											setSelectedFeatureId(features[0].id);
										} else if (features.length === 0) {
											setSelectedFeatureId(null);
										}

										// Refresh traces
										setRefreshKey((prev) => prev + 1);
									} catch (err: any) {
										setDeleteError(err.message || 'Failed to delete feature');
									} finally {
										setDeleteLoading(false);
									}
								}}
								featureName={featureToDelete?.featureName}
							/>
							{deleteError && (
								<Typography
									color="error"
									className="p-4"
								>
									{deleteError}
								</Typography>
							)}
						</>
					)}
				</div>
			}
		/>
	);
}
