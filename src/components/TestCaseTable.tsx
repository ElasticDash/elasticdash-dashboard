'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCases, TestCase } from '@/services/testCaseService';
import { fetchTestCaseDetail } from '@/services/testCaseDetailService';
import { Paper, Typography, CircularProgress, Button } from '@mui/material';
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
		<>
			<Paper
				className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
			>
				<DataTable
					data={testCases}
					columns={columns}
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
									handleOpenAiDialog(row.original);
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
		</>
	);
};

export default TestCaseTable;
