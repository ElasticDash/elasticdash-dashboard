'use client';

import { useMemo } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Chip, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';

interface Ticket {
	id: string;
	name: string;
	status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

// Mock data for demonstration
const mockTickets: Ticket[] = [
	{ id: 'TKT-001', name: 'Login Issue', status: 'open' },
	{ id: 'TKT-002', name: 'Payment Gateway Error', status: 'in-progress' },
	{ id: 'TKT-003', name: 'Data Export Request', status: 'resolved' },
	{ id: 'TKT-004', name: 'API Rate Limit Exceeded', status: 'open' },
	{ id: 'TKT-005', name: 'UI Bug in Dashboard', status: 'closed' },
	{ id: 'TKT-006', name: 'Email Notification Not Working', status: 'in-progress' },
	{ id: 'TKT-007', name: 'Database Connection Timeout', status: 'open' }
];

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

// Helper function to format status label
const formatStatus = (status: Ticket['status']) => {
	return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function TicketsTable() {
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
				accessorKey: 'name',
				header: 'Ticket Name',
				Cell: ({ row }) => <Typography>{row.original.name}</Typography>
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

	const handleWithdraw = (ticket: Ticket) => {
		console.log('Withdrawing ticket:', ticket.id);
		// TODO: Implement withdraw logic
	};

	return (
		<Paper
			className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
			elevation={0}
		>
			<DataTable
				data={mockTickets}
				columns={columns}
				renderRowActions={({ row }) => (
					<div style={{ display: 'flex', gap: 8 }}>
						<Button
							size="small"
							variant="outlined"
							color="error"
							startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							onClick={() => handleWithdraw(row.original)}
						>
							Withdraw
						</Button>
					</div>
				)}
			/>
		</Paper>
	);
}

export default TicketsTable;
