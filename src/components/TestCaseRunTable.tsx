'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import {
	fetchTestCaseRunRecords,
	fetchTestCaseRunRecordDetail,
	TestCaseRunRecord
} from '@/services/testCaseRunRecordService';
import { Paper, Typography, Button, Chip } from '@mui/material';
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

	useEffect(() => {
		setLoading(true);
		fetchTestCaseRunRecords()
			.then((res) => {
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
			const res = await fetchTestCaseRunRecordDetail(recordId);
			setRecordDetail(res);
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

	const columns = useMemo<MRT_ColumnDef<TestCaseRunRecord>[]>(
		() => [
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
				accessorKey: 'test_case_ids',
				header: 'Test Cases',
				Cell: ({ row }) => <Typography>{row.original.testCaseIds.length} test case(s)</Typography>
			},
			{
				accessorKey: 'times',
				header: 'Runs Per Case',
				Cell: ({ row }) => <Typography>{row.original.times}×</Typography>
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
				accessorKey: 'total_runs',
				header: 'Progress',
				Cell: ({ row }) => (
					<Typography>
						{row.original.successfulRuns}/{row.original.totalRuns} successful
						{row.original.failedRuns > 0 && ` (${row.original.failedRuns} failed)`}
					</Typography>
				)
			},
			{
				accessorKey: 'startedAt',
				header: 'Started At',
				Cell: ({ row }) => <Typography>{new Date(row.original.startedAt).toLocaleString()}</Typography>
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

	return (
		<>
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
