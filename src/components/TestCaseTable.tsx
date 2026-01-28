'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef, type MRT_RowSelectionState } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCaseDetailWithAiCalls, fetchTestCasesPaged, TestCase } from '@/services/testCaseService';
// import { fetchTestCaseDetail } from '@/services/testCaseDetailService';
import { Paper, Typography, CircularProgress, Button, TextField, Box, Alert } from '@mui/material';
import TestCaseDetailDialog from './TestCaseDetailDialog';
import AiCallDialog from './AiCallDialog';
import { updateTestCase, deleteTestCase } from '@/services/testCaseMutationService';
// import { runTestCase } from '@/services/testCaseRunService';
import { createTestCaseRunRecord } from '@/services/testCaseRunRecordService';
import { resetTestCases } from '@/services/testCaseResetService';

const TestCaseTable: React.FC = () => {
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<TestCase | null>(null);
	const [aiCalls, setAiCalls] = useState<any[]>([]);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [aiDialogOpen, setAiDialogOpen] = useState(false);

	// Bulk run state
	const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
	const [bulkRunTimes, setBulkRunTimes] = useState<number>(5);
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
			setRowSelection({});
			setTimeout(() => setResetSuccess(null), 5000);
		} catch (err: any) {
			setResetError(err.message || 'Failed to reset test case(s)');
		} finally {
			setResetLoading(false);
		}
	};

	// Pagination state
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	useEffect(() => {
		const fetchCases = async () => {
			setLoading(true);
			setError(null);
			try {
				const { testCases } = await fetchTestCasesPaged({
					limit: pagination.pageSize,
					offset: pagination.pageIndex * pagination.pageSize,
					filter: '',
					search: ''
				});
				setTestCases(testCases);
			} catch (err: any) {
				setError(err?.message || 'Failed to fetch test cases');
			} finally {
				setLoading(false);
			}
		};
		fetchCases();
	}, [pagination.pageIndex, pagination.pageSize]);

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
		if (!selected) return;

		try {
			await deleteTestCase(selected.id);
			setTestCases((prev) => prev.filter((tc) => tc.id !== selected.id));
			handleCloseEdit();
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
			setRowSelection({});

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

	const columns = useMemo<MRT_ColumnDef<TestCase>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				Cell: ({ row }) => (
					<Typography
						fontWeight={600}
						className="font-mono"
					>
						{row.original.id}
					</Typography>
				)
			},
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => <Typography>{row.original.name}</Typography>
			},
			{
				accessorKey: 'description',
				header: 'Description',
				Cell: ({ row }) => <Typography>{row.original.description}</Typography>
			}
		],
		[]
	);

	if (loading) return <CircularProgress />;

	if (error) return <Typography color="error">{error}</Typography>;

	return (
		<div style={{ padding: 24 }}>
			{/* Bulk Run Controls */}
			<Box className="mb-4 flex items-center gap-3">
							<TextField
								type="number"
								label="Number of Runs"
								value={bulkRunTimes}
								onChange={(e) => setBulkRunTimes(parseInt(e.target.value) || 1)}
								slotProps={{
									htmlInput: { min: 1, max: 100 }
								}}
								size="small"
								sx={{ width: 150 }}
							/>
							<Button
								variant="contained"
								color="primary"
								onClick={handleBulkRun}
								disabled={
									bulkRunLoading ||
									Object.keys(rowSelection).filter((key) => rowSelection[key]).length === 0
								}
							>
								{bulkRunLoading ? 'Running...' : 'Bulk Run'}
								{Object.keys(rowSelection).filter((key) => rowSelection[key]).length > 0 &&
									` (${Object.keys(rowSelection).filter((key) => rowSelection[key]).length})`}
							</Button>
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
								disabled={
									resetLoading ||
									Object.keys(rowSelection).filter((key) => rowSelection[key]).length === 0
								}
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

						{/* ...existing table UI, filtered by selectedFeatureId... */}
						<Paper
							className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
							elevation={0}
						>
							<DataTable
								data={testCases}
								columns={columns}
								state={{
									rowSelection,
									pagination
								}}
								onRowSelectionChange={setRowSelection}
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
											AI Calls
										</Button>
									</div>
								)}
							/>
						</Paper>
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
		</div>
	);
};

export default TestCaseTable;
