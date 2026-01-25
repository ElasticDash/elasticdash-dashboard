'use client';

import { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, TextField, Button, Typography, Box } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { fetchTraces } from '@/services/traceListService';
import TraceDetailDialog from '@/components/TraceDetailDialog';
import TracesHeader from '@/components/TracesHeader';

interface Trace {
	id: string;
	timestamp: string;
	name: string;
	project_id: string;
	user_id: string;
}

export default function TraceListPage() {
	const [traces, setTraces] = useState<Trace[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [name, setName] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [filter, setFilter] = useState('');

	// Pagination state
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10
	});

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError('');
		const offset = pagination.pageIndex * pagination.pageSize;
		fetchTraces({ limit: pagination.pageSize, offset, filter })
			.then((res) => {
				console.log('res', res);
				setTraces(res.result.data.data || []);
				setCount(res.result.total || 0);
			})
			.catch((err) => setError(err.message || 'Failed to fetch traces'))
			.finally(() => setLoading(false));
	}, [filter, pagination.pageIndex, pagination.pageSize]);

	const handleApplyFilter = () => {
		const filterParts = [];

		if (name) filterParts.push(`name LIKE '%${name.replace(/'/g, "''")}%'`);

		if (startDate) filterParts.push(`timestamp >= '${startDate}'`);

		if (endDate) filterParts.push(`timestamp <= '${endDate}'`);

		setFilter(filterParts.join(' AND '));
		// Reset to first page when filters change
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const handleOpenDialog = (traceId: string) => {
		setSelectedTraceId(traceId);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedTraceId(null);
	};

	const columns = useMemo<MRT_ColumnDef<Trace>[]>(
		() => [
			{
				accessorKey: 'timestamp',
				header: 'Timestamp',
				Cell: ({ row }) => (
					<Typography>
						{row.original.timestamp ? new Date(row.original.timestamp).toLocaleString() : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => <Typography>{row.original.name ?? ''}</Typography>
			},
			{
				accessorKey: 'project_id',
				header: 'Project ID',
				Cell: ({ row }) => <Typography>{row.original.project_id ?? ''}</Typography>
			},
			{
				accessorKey: 'user_id',
				header: 'User ID',
				Cell: ({ row }) => <Typography>{row.original.user_id ?? ''}</Typography>
			}
		],
		[]
	);

	return (
		<FusePageSimple
			header={<TracesHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<Paper sx={{ mb: 2, p: 2 }}>
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
							<TextField
								label="Name contains"
								value={name}
								onChange={(e) => setName(e.target.value)}
								size="small"
								sx={{ minWidth: 200 }}
								placeholder="e.g. chat"
							/>
							<TextField
								label="Start date"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								size="small"
								sx={{ minWidth: 160 }}
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="End date"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								size="small"
								sx={{ minWidth: 160 }}
								InputLabelProps={{ shrink: true }}
							/>
							<Button
								variant="contained"
								onClick={handleApplyFilter}
							>
								Apply Filter
							</Button>
						</Box>
					</Paper>
					<Paper
						className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
						elevation={0}
					>
						<DataTable
							data={traces}
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
										onClick={() => handleOpenDialog(row.original.id)}
									>
										Detail
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
					<TraceDetailDialog
						open={dialogOpen}
						onClose={handleCloseDialog}
						traceId={selectedTraceId}
					/>
				</div>
			}
		/>
	);
}
