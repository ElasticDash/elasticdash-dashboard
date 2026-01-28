'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import {
	fetchTestCaseRunRecords,
	fetchTestCaseRunRecordDetail,
	TestCaseRunRecord,
	TestCaseRunInRecord
} from '@/services/testCaseRunRecordService';
import {
	Paper,
	Typography,
	Button,
	Chip,
	CircularProgress,
	Box,
	Select,
	MenuItem,
	FormControl,
	InputLabel
} from '@mui/material';
import TestCaseRunRecordDetailDialog from './TestCaseRunRecordDetailDialog';

const TestCaseRecordTable: React.FC = () => {
	const [records, setRecords] = useState<TestCaseRunRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Auto-refresh state
	const [autoRefresh, setAutoRefresh] = useState<'off' | '60000'>('off');
	const [refreshKey, setRefreshKey] = useState(0);

	// Selected record state
	const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
	const [runs, setRuns] = useState<TestCaseRunInRecord[]>([]);
	const [runsLoading, setRunsLoading] = useState(false);
	const [runsError, setRunsError] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [recordDetail, setRecordDetail] = useState<any | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);

	// Fetch all records function
	const loadRecords = useCallback(() => {
		setLoading(true);
		fetchTestCaseRunRecords()
			.then((res) => {
				console.log('res: ', res);
				setRecords(res);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch test case run records');
			})
			.finally(() => setLoading(false));
	}, []);

	// Fetch records when dependencies change
	useEffect(() => {
		loadRecords();
	}, [loadRecords, refreshKey]);

	// Auto-refresh interval
	useEffect(() => {
		if (autoRefresh === 'off') return;

		const interval = setInterval(() => {
			loadRecords();
		}, parseInt(autoRefresh));

		return () => clearInterval(interval);
	}, [autoRefresh, loadRecords]);

	// Manual refresh handler
	const handleManualRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	// Fetch runs when a record is selected
	useEffect(() => {
		if (!selectedRecordId) {
			setRuns([]);
			return;
		}

		setRunsLoading(true);
		setRunsError(null);
		fetchTestCaseRunRecordDetail(selectedRecordId)
			.then((res) => {
				setRuns(res.runs || []);
				setRunsError(null);
			})
			.catch((err) => {
				setRunsError(err.message || 'Failed to fetch test case runs for this record');
			})
			.finally(() => setRunsLoading(false));
	}, [selectedRecordId]);

	const handleOpenDialog = async (recordId: number) => {
		setSelectedRecordId(recordId);
		setDialogOpen(true);
		setRecordDetail(null);
		setDetailError(null);
		setDetailLoading(true);

		try {
			const detail = await fetchTestCaseRunRecordDetail(recordId);
			setRecordDetail(detail);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch test case run record detail');
		} finally {
			setDetailLoading(false);
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedRecordId(null);
		setRecordDetail(null);
		setDetailError(null);
		setDetailLoading(false);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
			case 'success':
				return 'success';
			case 'pending':
			case 'running':
				return 'warning';
			case 'failed':
			case 'error':
				return 'error';
			default:
				return 'default';
		}
	};

	const columns = useMemo<MRT_ColumnDef<TestCaseRunInRecord>[]>(
		() => [
			{
				accessorKey: 'startedAt',
				header: 'Timestamp',
				Cell: ({ row }) => (
					<Typography>
						{row.original.startedAt ? new Date(row.original.startedAt).toLocaleString() : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'testCaseName',
				header: 'Test Case',
				Cell: ({ row }) => (
					<Typography>{row.original.testCaseName || `ID: ${row.original.testCaseId}`}</Typography>
				)
			},
			{
				header: 'Environment',
				Cell: () => <Typography>Development</Typography>
			},
			{
				accessorKey: 'status',
				header: 'Status',
				Cell: ({ row }) => (
					<Chip
						label={row.original.status}
						color={getStatusColor(row.original.status)}
						size="small"
					/>
				)
			},
			{
				accessorKey: 'completedAt',
				header: 'Completed At',
				Cell: ({ row }) => (
					<Typography>
						{row.original.completedAt ? new Date(row.original.completedAt).toLocaleString() : '-'}
					</Typography>
				)
			}
		],
		[]
	);

	if (loading) return <CircularProgress />;

	if (error) return <Typography color="error">{error}</Typography>;

	return (
		<div
			className="flex h-full min-h-0 w-full flex-col p-0"
			style={{ height: '100vh', minHeight: 0 }}
		>
			{/* Filter UI */}
			<Paper sx={{ mb: 2, p: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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

			<div style={{ display: 'flex', height: '100%' }}>
				{/* Sidebar for run records */}
				<div style={{ width: 280, borderRight: '1px solid #eee', padding: 16, background: '#fafafa' }}>
					<h3 style={{ marginTop: 0 }}>Run Records</h3>
					{records.length === 0 ? (
						<div style={{ color: '#888', fontStyle: 'italic' }}>No run records found</div>
					) : (
						<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
							{records.map((record) => (
								<li
									key={record.id}
									style={{ marginBottom: 12 }}
								>
									<div
										style={{
											background: selectedRecordId === record.id ? '#e0e7ff' : 'white',
											border: '1px solid #ddd',
											borderRadius: 6,
											padding: '12px',
											cursor: 'pointer'
										}}
										onClick={() => setSelectedRecordId(record.id)}
									>
										<div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>
											Record #{record.id}
										</div>
										<div style={{ fontSize: '12px', color: '#666', marginBottom: 6 }}>
											{record.testCaseIds.length} test case(s) × {record.times} run(s)
										</div>
										<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
											<Chip
												label={record.status}
												color={getStatusColor(record.status)}
												size="small"
												sx={{ fontSize: '10px', height: 20 }}
											/>
											<Chip
												label={`${record.successfulRuns}/${record.totalRuns}`}
												color="success"
												variant="outlined"
												size="small"
												sx={{ fontSize: '10px', height: 20 }}
											/>
										</div>
										<div style={{ fontSize: '11px', color: '#999', marginBottom: 8 }}>
											{new Date(record.createdAt).toLocaleDateString()}
										</div>
										<Button
											size="small"
											variant="outlined"
											fullWidth
											onClick={(e) => {
												e.stopPropagation();
												handleOpenDialog(record.id);
											}}
											sx={{ fontSize: '11px', py: 0.5 }}
										>
											View Details
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Main runs table area */}
				<div style={{ flex: 1, padding: 24 }}>
					{!selectedRecordId ? (
						<div style={{ color: '#888', fontStyle: 'italic' }}>
							Select a run record to view its test case runs.
						</div>
					) : runsLoading ? (
						<CircularProgress />
					) : runsError ? (
						<Typography color="error">{runsError}</Typography>
					) : (
						<Paper
							className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
							elevation={0}
						>
							<DataTable
								data={runs}
								columns={columns}
								state={{
									isLoading: runsLoading
								}}
							/>
						</Paper>
					)}
				</div>
			</div>

			<TestCaseRunRecordDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				recordDetail={recordDetail}
				loading={detailLoading}
				error={detailError}
			/>
		</div>
	);
};

export default TestCaseRecordTable;
