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

	const getProgressColor = (successfulRuns: number, totalRuns: number) => {
		if (totalRuns === 0) return { bgcolor: '#9e9e9e', color: '#fff' }; // Gray for no data
		const successRate = (successfulRuns / totalRuns) * 100;

		if (successfulRuns === 0) {
			// Red bg + white text: no success cases
			return { bgcolor: '#d32f2f', color: '#fff' };
		} else if (successRate < 80) {
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
					const colors = getProgressColor(row.original.successfulRuns, row.original.totalRuns);
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
