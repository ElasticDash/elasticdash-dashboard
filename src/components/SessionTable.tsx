'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { fetchSessions, SessionListItem } from '@/services/sessionService';
import { fetchSessionDetail } from '@/services/sessionDetailService';
import SessionDetailDialog from './SessionDetailDialog';
import { Paper, Typography, Button, CircularProgress } from '@mui/material';

const SessionTable: React.FC = () => {
	const [sessions, setSessions] = useState<SessionListItem[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Pagination state
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 13
	});

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
	const [detail, setDetail] = useState<any | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		const offset = pagination.pageIndex * pagination.pageSize;
		fetchSessions({ limit: pagination.pageSize, offset, filter: null })
			.then((res) => {
				setSessions(res.data);
				setCount(res.total);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch sessions');
			})
			.finally(() => setLoading(false));
	}, [pagination.pageIndex, pagination.pageSize]);

	const handleOpenDialog = async (sessionId: string) => {
		setSelectedSessionId(sessionId);
		setDialogOpen(true);
		setDetail(null);
		setDetailError(null);
		setDetailLoading(true);
		try {
			const res = await fetchSessionDetail({ sessionId });
			setDetail(res);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch session detail');
		} finally {
			setDetailLoading(false);
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedSessionId(null);
		setDetail(null);
		setDetailError(null);
		setDetailLoading(false);
	};

	const columns = useMemo<MRT_ColumnDef<SessionListItem>[]>(
		() => [
			{
				accessorKey: 'session_id',
				header: 'Session ID',
				Cell: ({ row }) => (
					<Typography
						fontWeight={600}
						className="font-mono"
					>
						{row.original.session_id}
					</Typography>
				)
			},
			{
				accessorKey: 'count',
				header: 'Count',
				Cell: ({ row }) => <Typography>{row.original.count}</Typography>
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
					data={sessions}
					columns={columns}
					manualPagination
					rowCount={count}
					state={{
						isLoading: loading,
						pagination
					}}
					onPaginationChange={setPagination}
					renderRowActions={({ row }) => (
						<div style={{ display: 'flex', gap: 8 }}>
							<Button
								size="small"
								variant="outlined"
								color="primary"
								onClick={() => handleOpenDialog(row.original.session_id)}
							>
								View Detail
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
			<SessionDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				sessionId={selectedSessionId}
				detail={detail}
				loading={detailLoading}
				error={detailError}
			/>
		</>
	);
};

export default SessionTable;
