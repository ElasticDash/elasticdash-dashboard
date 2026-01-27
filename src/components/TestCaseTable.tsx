'use client';

import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { type MRT_ColumnDef, type MRT_RowSelectionState } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCaseDetailWithAiCalls, fetchTestCases, TestCase } from '@/services/testCaseService';
// import { fetchTestCaseDetail } from '@/services/testCaseDetailService';
import { Paper, Typography, CircularProgress, Button, TextField, Box, Alert } from '@mui/material';
import TestCaseDetailDialog from './TestCaseDetailDialog';
import AiCallDialog from './AiCallDialog';
import { updateTestCase, deleteTestCase } from '@/services/testCaseMutationService';
import { runTestCase } from '@/services/testCaseRunService';
import { createTestCaseRunRecord } from '@/services/testCaseRunRecordService';

const TestCaseTable: React.FC = () => {
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<TestCase | null>(null);
	const [aiCalls, setAiCalls] = useState<any[]>([]);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [aiDialogOpen, setAiDialogOpen] = useState(false);
	const [runLoading, setRunLoading] = useState(false);
	const [runError, setRunError] = useState<string | null>(null);

	// Bulk run state
	const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
	const [bulkRunTimes, setBulkRunTimes] = useState<number>(5);
	const [bulkRunLoading, setBulkRunLoading] = useState(false);
	const [bulkRunSuccess, setBulkRunSuccess] = useState<string | null>(null);
	const [bulkRunError, setBulkRunError] = useState<string | null>(null);

	// Feature sidebar state
	const [features, setFeatures] = useState<{ id: number; featureName: string }[]>([]);
	const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
	const [featuresLoading, setFeaturesLoading] = useState(false);
	const [featuresError, setFeaturesError] = useState<string | null>(null);

	const test_project_id = 1; // TODO: Replace with actual project id source

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
				setFeatures(res.data?.result || []);
			} catch (err: any) {
				setFeaturesError(err?.message || 'Failed to fetch features');
			} finally {
				setFeaturesLoading(false);
			}
		};
		fetchFeatures();
	}, [test_project_id]);

	useEffect(() => {
		fetchTestCases()
			.then(setTestCases)
			.catch((err) => setError(err.message || 'Failed to fetch test cases'))
			.finally(() => setLoading(false));
	}, []);

	const handleOpenView = (tc: TestCase) => {
		setSelected(tc);
		setViewDialogOpen(true);
	};

	const handleCloseView = () => {
		setViewDialogOpen(false);
		setSelected(null);
	};

	const handleOpenEdit = () => {
		setEditDialogOpen(true);
		setViewDialogOpen(false);
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
			setDetailError(err.message || 'Failed to fetch test case detail');
		} finally {
			setDetailLoading(false);
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
			setViewDialogOpen(false);
		} catch (err: any) {
			alert(err.message || 'Failed to delete test case');
		}
	};

	const handleTestCaseRun = async (tc: TestCase) => {
		setRunLoading(true);
		setRunError(null);
		try {
			await runTestCase(tc.id);
			// Optionally show a success message or refresh runs
			alert(`Test case ${tc.id} run triggered successfully!`);
		} catch (err: any) {
			setRunError(err.message || 'Failed to run test case');
			alert(err.message || 'Failed to run test case');
		} finally {
			setRunLoading(false);
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
				`Successfully created run record for ${selectedIds.length} test case(s), ${bulkRunTimes} time(s) each. Total runs: ${result.total_runs || selectedIds.length * bulkRunTimes}`
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
										background: selectedFeatureId === feature.id ? '#e0e7ff' : 'transparent',
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
				{/* Example: Show message if no feature selected */}
				{!selectedFeatureId ? (
					<div style={{ color: '#888', fontStyle: 'italic' }}>Select a feature to view its trace items.</div>
				) : (
					<>
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
									rowSelection
								}}
								onRowSelectionChange={setRowSelection}
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
										<Button
											size="small"
											variant="outlined"
											onClick={() => {
												handleTestCaseRun(row.original);
											}}
										>
											Run
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
					</>
				)}
			</div>
		</div>
	);
};

export default TestCaseTable;
