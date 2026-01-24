'use client';
import React, { useEffect, useState } from 'react';
import { fetchTestCases, TestCase } from '@/services/testCaseService';
import { fetchTestCaseDetail } from '@/services/testCaseDetailService';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	CircularProgress,
	Button,
	Dialog
} from '@mui/material';
import TestCaseDetailDialog from './TestCaseDetailDialog';
import AiCallDialog from './AiCallDialog';
import { updateTestCase, deleteTestCase } from '@/services/testCaseMutationService';

const TestCaseTable: React.FC = () => {
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<TestCase | null>(null);
	const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
	const [aiCalls, setAiCalls] = useState<any[]>([]);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [aiDialogOpen, setAiDialogOpen] = useState(false);

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

	const handleOpenAiDialog = async (tc: TestCase) => {
		try {
			const res = await fetchTestCaseDetail(tc.id);
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

	const handleOpenDetail = async (tc: TestCase) => {
		setDetailLoading(true);
		setDetailError(null);
		try {
			const res = await fetchTestCaseDetail(tc.id);
            console.log('Fetched test case detail:', res);
			setSelected(res.testCase);
			setSelectedDetail(res);
			setViewDialogOpen(true);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch test case detail');
		} finally {
			setDetailLoading(false);
		}
	};

	const handleCloseDialog = () => {
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

	return (
		<Paper sx={{ p: 2 }}>
			<Typography
				variant="h6"
				gutterBottom
			>
				Test Cases
			</Typography>
			{loading ? (
				<CircularProgress />
			) : error ? (
				<Typography color="error">{error}</Typography>
			) : (
				<>
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{testCases.map((tc) => (
									<TableRow key={tc.id}>
										<TableCell>{tc.id}</TableCell>
										<TableCell>{tc.name}</TableCell>
										<TableCell>{tc.description}</TableCell>
										<TableCell>
											<Button
												size="small"
												variant="contained"
												color="primary"
												onClick={() => {
													setSelected(tc);
													setEditDialogOpen(true);
												}}
												sx={{ mr: 1 }}
											>
												Edit
											</Button>
											<Button
												size="small"
												variant="outlined"
												color="secondary"
												onClick={() => {
													handleOpenAiDialog(tc);
												}}
											>
												AI Calls
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					{/* View Dialog */}
					{selected && (
						<Dialog
							open={viewDialogOpen}
							onClose={handleCloseView}
							maxWidth="sm"
							fullWidth
						>
							<div style={{ padding: 24 }}>
								<h2>Test Case Detail</h2>
								<div>
									<b>ID:</b> {selected.id}
								</div>
								<div>
									<b>Name:</b> {selected.name}
								</div>
								<div>
									<b>Description:</b> {selected.description}
								</div>
								<div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
									<Button
										variant="contained"
										onClick={handleOpenEdit}
									>
										Edit
									</Button>
									<Button
										variant="outlined"
										onClick={() => handleOpenAiDialog(selected)}
									>
										AI Calls
									</Button>
									<Button onClick={handleCloseView}>Close</Button>
								</div>
							</div>
						</Dialog>
					)}
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
		</Paper>
	);
};

export default TestCaseTable;
