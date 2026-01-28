'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { type MRT_ColumnDef, type MRT_RowSelectionState } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCaseDetailWithAiCalls, fetchTestCasesPaged, TestCase } from '@/services/testCaseService';
// import { fetchTestCaseDetail } from '@/services/testCaseDetailService';
import {
	Paper,
	Typography,
	CircularProgress,
	Button,
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel
} from '@mui/material';
import TestCaseDetailDialog from './TestCaseDetailDialog';
import AiCallDialog from './AiCallDialog';
import { updateTestCase, deleteTestCase } from '@/services/testCaseMutationService';
// import { runTestCase } from '@/services/testCaseRunService';
import { createTestCaseRunRecord } from '@/services/testCaseRunRecordService';
import { resetTestCases } from '@/services/testCaseResetService';

interface TestCaseTableProps {
	rowSelection: MRT_RowSelectionState;
	onRowSelectionChange: (selection: MRT_RowSelectionState) => void;
	bulkRunTrigger: number;
	bulkRunTimes: number;
}

const TestCaseTable: React.FC<TestCaseTableProps> = ({
	rowSelection,
	onRowSelectionChange,
	bulkRunTrigger,
	bulkRunTimes
}) => {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<TestCase | null>(null);
	const [fetchNeeded, setFetchNeeded] = useState(true);
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<TestCase | null>(null);
	const [aiCalls, setAiCalls] = useState<any[]>([]);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [aiDialogOpen, setAiDialogOpen] = useState(false);

	// Bulk run state
	const [bulkRunLoading, setBulkRunLoading] = useState(false);
	const [bulkRunSuccess, setBulkRunSuccess] = useState<string | null>(null);
	const [bulkRunError, setBulkRunError] = useState<string | null>(null);
	const [resetLoading, setResetLoading] = useState(false);
	const [resetSuccess, setResetSuccess] = useState<string | null>(null);
	const [resetError, setResetError] = useState<string | null>(null);
	const handleReset = async () => {
		const selectedIds = Object.keys(rowSelection)
			.filter((key) => rowSelection[key])
			.map((key) => testCases[parseInt(key)].id);

		if (selectedIds.length === 0) return;

		setResetLoading(true);
		setResetError(null);
		setResetSuccess(null);
		try {
			await resetTestCases(selectedIds);
			setResetSuccess(`Successfully reset ${selectedIds.length} test case(s).`);
			onRowSelectionChange({});
			setTimeout(() => setResetSuccess(null), 5000);
		} catch (err: any) {
			setResetError(err.message || 'Failed to reset test case(s)');
		} finally {
			setResetLoading(false);
		}
	};

	// Pagination state
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
	const [total, setTotal] = useState(0);

	// Search and refresh state
	const [searchName, setSearchName] = useState('');
	const [autoRefresh, setAutoRefresh] = useState<'off' | '60000'>('off');
	const [refreshKey, setRefreshKey] = useState(0);

	// Fetch test cases function
	const loadTestCases = useCallback(() => {
		const fetchCases = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetchTestCasesPaged({
					limit: pagination.pageSize,
					offset: pagination.pageIndex * pagination.pageSize,
					filter: '',
					search: searchName
				});
				console.log('Fetched test cases paged:', res);
				const { testCases, total } = res;
				setTestCases(testCases);
				setTotal(total);
			} catch (err: any) {
				setError(err?.message || 'Failed to fetch test cases');
			} finally {
				setLoading(false);
				setFetchNeeded(false);
			}
		};
		fetchCases();
	}, [pagination.pageIndex, pagination.pageSize, searchName, fetchNeeded]);

	// Fetch test cases when dependencies change
	useEffect(() => {
		loadTestCases();
	}, [loadTestCases, refreshKey]);

	// Auto-refresh interval
	useEffect(() => {
		if (autoRefresh === 'off') return;

		const interval = setInterval(() => {
			loadTestCases();
		}, parseInt(autoRefresh));

		return () => clearInterval(interval);
	}, [autoRefresh, loadTestCases]);

	// Manual refresh handler
	const handleManualRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	// Search handler
	const handleSearch = () => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
		setFetchNeeded(true);
	};

	const handleCloseEdit = () => {
		setEditDialogOpen(false);
		setSelected(null);
	};

	const handleAiCallDialog = async (tc: TestCase) => {
		try {
			const res = await fetchTestCaseDetailWithAiCalls(tc.id);
			console.log('Fetched test case detail:', res);
			setAiCalls(res.aiCalls || []);
			setAiDialogOpen(true);
		} catch (err: any) {
			console.error('Failed to fetch test case detail:', err);
		}
	};

	const handleCloseAiDialog = () => {
		setAiDialogOpen(false);
		setSelected(null);
	};

	const handleSave = async (updated: Partial<TestCase>) => {
		if (!selected) return;

		try {
			await updateTestCase(selected.id, updated);
			setTestCases((prev) => prev.map((tc) => (tc.id === selected.id ? { ...tc, ...updated } : tc)));
			handleCloseEdit();
		} catch (err: any) {
			alert(err.message || 'Failed to update test case');
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;

		try {
			await deleteTestCase(deleteTarget.id);
			setFetchNeeded(true);
			setDeleteDialogOpen(false);
			setDeleteTarget(null);

			if (selected && selected.id === deleteTarget.id) {
				handleCloseEdit();
			}
		} catch (err: any) {
			alert(err.message || 'Failed to delete test case');
		}
	};

	const handleBulkRun = async () => {
		// Get selected test case IDs
		const selectedIds = Object.keys(rowSelection)
			.filter((key) => rowSelection[key])
			.map((key) => testCases[parseInt(key)].id);

		if (selectedIds.length === 0) {
			setBulkRunError('Please select at least one test case');
			return;
		}

		// Validate times
		if (bulkRunTimes < 1 || bulkRunTimes > 100) {
			setBulkRunError('Number of runs must be between 1 and 100');
			return;
		}

		setBulkRunLoading(true);
		setBulkRunError(null);
		setBulkRunSuccess(null);

		try {
			const result = await createTestCaseRunRecord({
				testCaseIds: selectedIds,
				times: bulkRunTimes
			});

			setBulkRunSuccess(
				`Successfully created run record for ${selectedIds.length} test case(s), ${bulkRunTimes} time(s) each. Total runs: ${result.totalRuns || selectedIds.length * bulkRunTimes}`
			);

			// Clear selection after successful bulk run
			onRowSelectionChange({});

			// Auto-dismiss success message after 5 seconds
			setTimeout(() => {
				setBulkRunSuccess(null);
			}, 5000);
		} catch (err: any) {
			setBulkRunError(err.message || 'Failed to create test case run record');
		} finally {
			setBulkRunLoading(false);
		}
	};

	// Trigger bulk run when button clicked in header
	useEffect(() => {
		if (bulkRunTrigger > 0) {
			handleBulkRun();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bulkRunTrigger]);

	const columns = useMemo<MRT_ColumnDef<TestCase>[]>(
		() => [
			{
				accessorKey: 'createdAt',
				header: 'Timestamp',
				Cell: ({ row }) => (
					<Typography>
						{row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => <Typography>{row.original.name}</Typography>
			}
		],
		[]
	);

	if (loading) return <CircularProgress />;

	if (error) return <Typography color="error">{error}</Typography>;

	return (
		<>
			{/* Status Messages and Controls */}
			{/* <Paper
				sx={{ p: 2, borderRadius: 0 }}
				elevation={1}
				className="border-b-2 border-gray-300"
			>
				<Box className="flex items-center gap-3">
					{bulkRunSuccess && (
						<Alert
							severity="success"
							onClose={() => setBulkRunSuccess(null)}
							sx={{ flex: 1 }}
						>
							{bulkRunSuccess}
						</Alert>
					)}
					{bulkRunError && (
						<Alert
							severity="error"
							onClose={() => setBulkRunError(null)}
							sx={{ flex: 1 }}
						>
							{bulkRunError}
						</Alert>
					)}
					<Button
						variant="outlined"
						color="secondary"
						onClick={handleReset}
						disabled={resetLoading || Object.keys(rowSelection).filter((key) => rowSelection[key]).length === 0}
					>
						{resetLoading ? 'Resetting...' : 'Reset Selected'}
					</Button>
					{resetSuccess && (
						<Alert
							severity="success"
							onClose={() => setResetSuccess(null)}
							sx={{ flex: 1 }}
						>
							{resetSuccess}
						</Alert>
					)}
					{resetError && (
						<Alert
							severity="error"
							onClose={() => setResetError(null)}
							sx={{ flex: 1 }}
						>
							{resetError}
						</Alert>
					)}
				</Box>
			</Paper> */}
			{/* Filter UI */}
			<Paper
				sx={{ p: 2, borderRadius: 0 }}
				elevation={1}
				className="border-b-2 border-gray-300"
			>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderRadius: 0 }}>
					<TextField
						label="Name contains"
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						size="small"
						sx={{ minWidth: 200 }}
						placeholder="e.g. chat"
					/>
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
						onClick={handleSearch}
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

			{/* ...existing table UI, filtered by selectedFeatureId... */}
			<Paper
				className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
				style={{ minHeight: 0 }}
			>
				<div className="flex h-full min-h-0 flex-auto flex-col">
					<DataTable
						data={testCases}
						columns={columns}
						rowCount={total}
						state={{
							rowSelection,
							pagination
						}}
						onRowSelectionChange={onRowSelectionChange}
						onPaginationChange={setPagination}
						manualPagination
						renderRowActions={({ row }) => (
							<div style={{ display: 'flex', gap: 8 }}>
								<Button
									size="small"
									variant="contained"
									color="primary"
									onClick={() => {
										setSelected(row.original);
										setEditDialogOpen(true);
									}}
								>
									Edit
								</Button>
								<Button
									size="small"
									variant="outlined"
									color="secondary"
									onClick={() => {
										handleAiCallDialog(row.original);
									}}
								>
									Detail
								</Button>
								<Button
									size="small"
									variant="outlined"
									color="error"
									onClick={() => {
										setDeleteTarget(row.original);
										setDeleteDialogOpen(true);
									}}
								>
									Delete
								</Button>
							</div>
						)}
					/>
				</div>
			</Paper>
			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeleteTarget(null);
				}}
			>
				<DialogTitle>Delete Test Case</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this test case? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setDeleteDialogOpen(false);
							setDeleteTarget(null);
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDelete}
						color="error"
						variant="contained"
						autoFocus
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
			{/* Edit Dialog */}
			<TestCaseDetailDialog
				open={editDialogOpen}
				onClose={handleCloseEdit}
				testCase={selected}
				onSave={handleSave}
				onDelete={handleDelete}
			/>
			{/* AI Calls Dialog */}
			<AiCallDialog
				open={aiDialogOpen}
				onClose={handleCloseAiDialog}
				aiCalls={aiCalls}
			/>
		</>
	);
};

export default TestCaseTable;
