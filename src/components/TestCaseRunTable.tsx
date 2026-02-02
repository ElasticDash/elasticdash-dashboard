'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCaseRunRecords, fetchTestCaseRunRecordDetail, TestCaseRunRecord } from '@/services/testCaseService';
import { Paper, Typography, Chip, Box, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';
import TestCaseRunRecordDetailDialog from './TestCaseRunRecordDetailDialog';
import { useSearchParams } from 'next/navigation';

const TestCaseRunTable: React.FC = () => {
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams.toString());
	const [records, setRecords] = useState<TestCaseRunRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

	const [recordDetail, setRecordDetail] = useState<any | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [autoRefresh, setAutoRefresh] = useState<'off' | '60000'>('off');

	useEffect(() => {
		console.log('init is triggered');
		const paramTestCaseId = params.get('testCaseId');
		console.log('paramTestCaseId:', paramTestCaseId);

		if (paramTestCaseId && !isNaN(parseInt(paramTestCaseId)) && parseInt(paramTestCaseId) !== selectedRecordId) {
			handleOpenDialog(parseInt(paramTestCaseId));
		}

		setLoading(true);
		fetchTestCaseRunRecords()
			.then((res: any) => {
				// Add mock prompt drift record at the beginning
				// const mockRecord: TestCaseRunRecord = {
				// 	id: 999,
				// 	testCaseIds: [1],
				// 	times: 1,
				// 	status: 'suspicious',
				// 	totalRuns: 1,
				// 	successfulRuns: 1,
				// 	failedRuns: 0,
				// 	pendingRuns: 0,
				// 	runningRuns: 0,
				// 	createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				// 	startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				// 	completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
				// };
				// setRecords([...res]);
				setRecords(res);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch test case run records');
			})
			.finally(() => setLoading(false));
	}, []);

	const handleOpenDialog = async (recordId: number) => {
		setSelectedRecordId(recordId);
		setDialogOpen(true);
		setRecordDetail(null);
		setDetailError(null);
		setDetailLoading(true);

		try {
			// Use mock data for the prompt drift example (ID 999)
			const res = await fetchTestCaseRunRecordDetail(recordId);
			params.set('testCaseId', recordId.toString());
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

			setRecordDetail(res);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch test case run record detail');
			setRecordDetail(null);
			setDialogOpen(false);
			setSelectedRecordId(null);
			params.delete('testCaseId');
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
		} finally {
			setDetailLoading(false);
		}
	};

	// Auto-refresh interval
	useEffect(() => {
		if (autoRefresh === 'off') return;

		const interval = setInterval(() => {
			setLoading(true);
			fetchTestCaseRunRecords()
				.then((res: any) => {
					// Add mock prompt drift record at the beginning
					// const mockRecord: TestCaseRunRecord = {
					// 	id: 999,
					// 	testCaseIds: [1],
					// 	times: 1,
					// 	status: 'suspicious',
					// 	totalRuns: 1,
					// 	successfulRuns: 1,
					// 	failedRuns: 0,
					// 	pendingRuns: 0,
					// 	runningRuns: 0,
					// 	createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					// 	startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					// 	completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
					// };
					setRecords([...res]);

					if (selectedRecordId) {
						handleOpenDialog(selectedRecordId);
					}

					setError(null);
				})
				.catch((err) => {
					setError(err.message || 'Failed to fetch test case run records');
				})
				.finally(() => setLoading(false));
		}, parseInt(autoRefresh));

		return () => clearInterval(interval);
	}, [autoRefresh]);

	// Manual refresh handler
	const handleManualRefresh = () => {
		setLoading(true);
		fetchTestCaseRunRecords()
			.then((res: any) => {
				// Add mock prompt drift record at the beginning
				// const mockRecord: TestCaseRunRecord = {
				// 	id: 999,
				// 	testCaseIds: [1],
				// 	times: 1,
				// 	status: 'suspicious',
				// 	totalRuns: 1,
				// 	successfulRuns: 1,
				// 	failedRuns: 0,
				// 	pendingRuns: 0,
				// 	runningRuns: 0,
				// 	createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				// 	startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				// 	completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
				// };
				setRecords([...res]);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch test case run records');
			})
			.finally(() => setLoading(false));
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedRecordId(null);
		setRecordDetail(null);
		setDetailError(null);
		setDetailLoading(false);
		params.delete('testCaseId');
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const getProgressColor = (successfulRuns: number, totalRuns: number, status: string) => {
		console.log('Calculating progress color:', { successfulRuns, totalRuns, status });

		if (totalRuns === 0) return { bgcolor: '#9e9e9e', color: '#fff' }; // Gray for no data

		const successRate = (successfulRuns / totalRuns) * 100;

		if (successfulRuns === 0) {
			// Red bg + white text: no success cases
			return { bgcolor: '#d32f2f', color: '#fff' };
		} else if (successRate < 80 || status === 'suspicious') {
			// Yellow bg + black text: some success but less than 80%
			return { bgcolor: '#ffc107', color: '#000' };
		} else {
			// Green bg + white text: 80% or more success
			return { bgcolor: '#388e3c', color: '#fff' };
		}
	};

	const columns = useMemo<MRT_ColumnDef<TestCaseRunRecord>[]>(
		() => [
			{
				accessorKey: 'createdAt',
				header: 'Timestamp',
				Cell: ({ row }) => <Typography>{new Date(row.original.createdAt).toLocaleString()}</Typography>
			},
			{
				accessorKey: 'id',
				header: 'Record ID',
				Cell: ({ row }) => (
					<Typography
						fontWeight={600}
						className="font-mono"
					>
						#{row.original.id}
					</Typography>
				)
			},
			{
				accessorKey: 'status',
				header: 'Status',
				Cell: ({ row }) => {
					const colors = getProgressColor(
						row.original.successfulAiCalls,
						row.original.totalAiCalls,
						row.original.status
					);
					const progressText =
						row.original.status.toLowerCase() !== 'running'
							? `${row.original.successfulAiCalls}/${row.original.totalAiCalls} successful`
							: 'In Progress';

					return (
						<Chip
							label={progressText}
							size="small"
							sx={{
								backgroundColor: colors.bgcolor,
								color: colors.color,
								fontWeight: 600,
								'& .MuiChip-label': {
									color: colors.color
								}
							}}
						/>
					);
				}
			},
			{
				accessorKey: 'duration',
				header: 'Duration',
				Cell: ({ row }) => {
					const { startedAt, completedAt } = row.original;

					if (!startedAt) return <Typography>-</Typography>;

					const start = new Date(startedAt).getTime();
					const end = completedAt ? new Date(completedAt).getTime() : Date.now();
					const durationMs = end - start;

					// Convert to human-readable format
					const seconds = Math.floor(durationMs / 1000);
					const minutes = Math.floor(seconds / 60);
					const hours = Math.floor(minutes / 60);
					const days = Math.floor(hours / 24);

					let durationText = '';

					if (days > 0) {
						durationText = `${days}d ${hours % 24}h ${minutes % 60}m`;
					} else if (hours > 0) {
						durationText = `${hours}h ${minutes % 60}m`;
					} else if (minutes > 0) {
						durationText = `${minutes}m ${seconds % 60}s`;
					} else {
						durationText = `${seconds}s`;
					}

					return <Typography>{durationText}</Typography>;
				}
			}
		],
		[]
	);

	return (
		<>
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
			<Paper
				className="shadow-1 flex w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
				style={{ minHeight: 0, position: 'relative', height: 'calc(100vh - 175px)', overflow: 'auto' }}
			>
				<DataTable
					data={records}
					columns={columns}
					enableGlobalFilter={false}
					enableColumnFilters={false}
					state={{
						isLoading: loading
					}}
					onRowClick={(row) => handleOpenDialog(row.original.id)}
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

			{/* 
			<Paper
				className="shadow-1 flex w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
				style={{ minHeight: 0, position: 'relative', maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}
			>
				<div className="flex min-h-0 flex-auto flex-col" style={{ height: '100%' }}>
					<DataTable
						data={records}
						columns={columns}
						rowCount={total}
						manualPagination
						state={{
							isLoading: loading,
							pagination
						}}
						onPaginationChange={setPagination}
						onRowClick={(row) => handleOpenDialog(row.original.id)}
					/>
				</div>
			</Paper>

			*/}
			<TestCaseRunRecordDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				onRefresh={() => handleOpenDialog(recordDetail?.record?.id)}
				recordDetail={recordDetail}
				loading={detailLoading}
				error={detailError}
			/>
		</>
	);
};

export default TestCaseRunTable;
