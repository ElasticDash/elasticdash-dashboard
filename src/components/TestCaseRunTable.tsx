'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import {
	fetchTestCaseRunRecords,
	fetchTestCaseRunRecordDetail,
	TestCaseRunRecord,
	getMockPromptDriftData
} from '@/services/testCaseRunRecordService';
import { Paper, Typography, Button, Chip, Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import TestCaseRunRecordDetailDialog from './TestCaseRunRecordDetailDialog';

const TestCaseRunTable: React.FC = () => {
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
		setLoading(true);
		fetchTestCaseRunRecords()
			.then((res) => {
				// Add mock prompt drift record at the beginning
				const mockRecord: TestCaseRunRecord = {
					id: 999,
					testCaseIds: [1],
					times: 1,
					status: 'suspicious',
					totalRuns: 1,
					successfulRuns: 1,
					failedRuns: 0,
					pendingRuns: 0,
					runningRuns: 0,
					createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
				};
				setRecords([mockRecord, ...res]);
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
			let res;

			if (recordId === 999) {
				res = getMockPromptDriftData();
			} else {
				res = await fetchTestCaseRunRecordDetail(recordId);
			}

			setRecordDetail(res);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch test case run record detail');
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
				.then((res) => {
					// Add mock prompt drift record at the beginning
					const mockRecord: TestCaseRunRecord = {
						id: 999,
						testCaseIds: [1],
						times: 1,
						status: 'suspicious',
						totalRuns: 1,
						successfulRuns: 1,
						failedRuns: 0,
						pendingRuns: 0,
						runningRuns: 0,
						createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
						startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
						completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
					};
					setRecords([mockRecord, ...res]);
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
			.then((res) => {
				// Add mock prompt drift record at the beginning
				const mockRecord: TestCaseRunRecord = {
					id: 999,
					testCaseIds: [1],
					times: 1,
					status: 'suspicious',
					totalRuns: 1,
					successfulRuns: 1,
					failedRuns: 0,
					pendingRuns: 0,
					runningRuns: 0,
					createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
					completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
				};
				setRecords([mockRecord, ...res]);
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
			// {
			// 	accessorKey: 'testCaseIds',
			// 	header: 'Test Cases',
			// 	Cell: ({ row }) => <Typography>{row.original.testCaseIds.length} test case(s)</Typography>
			// },
			// {
			// 	accessorKey: 'times',
			// 	header: 'Runs Per Case',
			// 	Cell: ({ row }) => <Typography>{row.original.times}×</Typography>
			// },
			{
				accessorKey: 'status',
				header: 'Status',
				Cell: ({ row }) => {
					const colors = getProgressColor(
						row.original.successfulRuns,
						row.original.totalRuns,
						row.original.status
					);
					const progressText = `${row.original.successfulRuns}/${row.original.totalRuns} successful`;
					const failedText = row.original.failedRuns > 0 ? ` (${row.original.failedRuns} failed)` : '';

					return (
						<Chip
							label={progressText + failedText}
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
					{/* <TextField
						label="Name contains"
						value={name}
						onChange={(e) => setName(e.target.value)}
						size="small"
						sx={{ minWidth: 200 }}
						placeholder="e.g. chat"
					/> */}
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
					{/* <Button
						variant="contained"
						onClick={handleApplyFilter}
					>
						Apply Filter
					</Button> */}
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
				className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
			>
				<DataTable
					data={records}
					columns={columns}
					state={{
						isLoading: loading
					}}
					renderRowActions={({ row }) => (
						<div style={{ display: 'flex', gap: 8 }}>
							<Button
								size="small"
								variant="outlined"
								color="primary"
								onClick={() => handleOpenDialog(row.original.id)}
							>
								View Details
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
			<TestCaseRunRecordDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				recordDetail={recordDetail}
				loading={detailLoading}
				error={detailError}
			/>
		</>
	);
};

export default TestCaseRunTable;
