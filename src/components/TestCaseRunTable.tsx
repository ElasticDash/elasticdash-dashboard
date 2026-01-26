'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchTestCaseRuns, fetchTestCaseRunDetail, TestCaseRun } from '@/services/testCaseRunService';
import { Paper, Typography, Button, Chip } from '@mui/material';
import TestCaseRunDetailDialog from './TestCaseRunDetailDialog';

const TestCaseRunTable: React.FC = () => {
	const [runs, setRuns] = useState<TestCaseRun[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
	const [runDetail, setRunDetail] = useState<any | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		fetchTestCaseRuns()
			.then((res) => {
				setRuns(res);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch test case runs');
			})
			.finally(() => setLoading(false));
	}, []);

	const handleOpenDialog = async (runId: number) => {
		setSelectedRunId(runId);
		setDialogOpen(true);
		setRunDetail(null);
		setDetailError(null);
		setDetailLoading(true);

		try {
			const res = await fetchTestCaseRunDetail(runId);
			setRunDetail(res);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch test case run detail');
		} finally {
			setDetailLoading(false);
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedRunId(null);
		setRunDetail(null);
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

	const columns = useMemo<MRT_ColumnDef<TestCaseRun>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'Run ID',
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
				accessorKey: 'test_case_name',
				header: 'Test Case',
				Cell: ({ row }) => (
					<Typography>{row.original.test_case_name || `ID: ${row.original.test_case_id}`}</Typography>
				)
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
				accessorKey: 'started_at',
				header: 'Started At',
				Cell: ({ row }) => (
					<Typography>{new Date(row.original.started_at).toLocaleString()}</Typography>
				)
			},
			{
				accessorKey: 'completed_at',
				header: 'Completed At',
				Cell: ({ row }) => (
					<Typography>
						{row.original.completed_at ? new Date(row.original.completed_at).toLocaleString() : '-'}
					</Typography>
				)
			}
		],
		[]
	);

	return (
		<>
			<Paper
				className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
				elevation={0}
			>
				<DataTable
					data={runs}
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
			<TestCaseRunDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				runDetail={runDetail}
				loading={detailLoading}
				error={detailError}
			/>
		</>
	);
};

export default TestCaseRunTable;
