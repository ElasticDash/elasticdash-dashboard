'use client';

import { useMemo, useEffect, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Chip, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import { getUnhelpfulFeedbacks, withdrawFeedback } from '../../api';

interface Ticket {
	id: number;
	message_id: number;
	conversation_id: number;
	feedback_type: string;
	is_helpful: boolean;
	status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'withdrawn';
	created_at: string;
	updated_at: string;
	reason_category?: string;
	description?: string;
	expectedResponse?: string;
}

// Helper function to get status color
const getStatusColor = (status: Ticket['status']) => {
	switch (status) {
		case 'open':
			return 'error';
		case 'in-progress':
			return 'warning';
		case 'resolved':
			return 'success';
		case 'closed':
			return 'default';
		default:
			return 'default';
	}
};

const formatStatus = (status: Ticket['status']) => {
	return status
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

function TicketsTable() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchTickets = () => {
		setLoading(true);
		getUnhelpfulFeedbacks()
			.then((res) => {
				setTickets(Array.isArray(res) ? res : res?.result || []);
				setError('');
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch tickets');
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchTickets();
	}, []);

	const columns = useMemo<MRT_ColumnDef<Ticket>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'Ticket ID',
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
				accessorKey: 'message',
				header: 'Message',
				Cell: ({ row }) => <Typography>{row.original.description}</Typography>
			},
			{
				accessorKey: 'expected_response',
				header: 'Expected Response',
				Cell: ({ row }) => <Typography>{row.original.expectedResponse || 'N/A'}</Typography>
			},
			{
				accessorKey: 'created_at',
				header: 'Timestamp',
				Cell: ({ row }) => <Typography>{new Date(row.original.created_at).toLocaleString()}</Typography>
			},
			{
				accessorKey: 'status',
				header: 'Status',
				Cell: ({ row }) => (
					<Chip
						label={formatStatus(row.original.status)}
						color={getStatusColor(row.original.status)}
						size="small"
					/>
				)
			}
		],
		[]
	);

	const handleWithdraw = async (ticket: Ticket) => {
		if (ticket.status === 'withdrawn') return;

		setLoading(true);
		try {
			await withdrawFeedback(ticket.id);
			fetchTickets();
		} catch (err: any) {
			setError(err.message || 'Failed to withdraw ticket');
			setLoading(false);
		}
	};

	return (
		<Paper
			className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
			elevation={0}
		>
			<DataTable
				data={tickets}
				columns={columns}
				renderRowActions={({ row }) => (
					<div style={{ display: 'flex', gap: 8 }}>
						{row.original.status === 'withdrawn' ? (
							<Button
								size="small"
								variant="outlined"
								color="inherit"
								disabled
							>
								Withdrawn
							</Button>
						) : (
							<Button
								size="small"
								variant="outlined"
								color="error"
								startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
								onClick={() => handleWithdraw(row.original)}
								disabled={loading}
							>
								Withdraw
							</Button>
						)}
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
	);
}

export default TicketsTable;
