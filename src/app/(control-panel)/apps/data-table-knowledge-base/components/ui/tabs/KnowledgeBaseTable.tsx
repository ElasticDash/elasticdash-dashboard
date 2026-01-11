import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import KnowledgeBaseTableDialog from '../KnowledgeBaseTableDialog';

interface Tables {
	id: number;
	name: string;
	tags: string[];
}

// Mock data for demonstration
const mockTables = [
	{ id: 1, name: 'Users', tags: ['auth', 'core'] },
	{ id: 2, name: 'Orders', tags: ['e-commerce'] },
	{ id: 3, name: 'Products', tags: ['e-commerce', 'catalog'] },
	{ id: 4, name: 'Sessions', tags: ['auth'] },
	{ id: 5, name: 'Logs', tags: ['system'] }
];

function KnowledgeBaseTable() {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editTable, setEditTable] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTable, setDeleteTable] = useState(null);
	const columns = useMemo<MRT_ColumnDef<Tables>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Table Name',
				Cell: ({ row }) => <Typography fontWeight={600}>{row.original.name}</Typography>
			},
			{
				accessorKey: 'tags',
				header: 'Tags',
				Cell: ({ row }) => (
					<div style={{ display: 'flex', gap: 4 }}>
						{row.original.tags.map((tag: string) => (
							<Chip
								key={tag}
								label={tag}
								size="small"
							/>
						))}
					</div>
				)
			}
		],
		[]
	);

	// Handler to open edit dialog with row data
	const handleEdit = (row) => {
		setEditTable({
			name: row.original.name,
			shortDesc: row.original.shortDesc || '',
			keys: row.original.keys || []
		});
		setEditDialogOpen(true);
	};
	const handleEditClose = () => {
		setEditDialogOpen(false);
		setEditTable(null);
	};
	const handleDelete = (row) => {
		setDeleteTable(row.original);
		setDeleteDialogOpen(true);
	};
	const handleDeleteClose = () => {
		setDeleteDialogOpen(false);
		setDeleteTable(null);
	};
	const handleDeleteConfirm = () => {
		// TODO: handle actual delete logic
		setDeleteDialogOpen(false);
		setDeleteTable(null);
	};
	return (
		<Paper
			className="shadow-1 flex h-full w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
			elevation={0}
		>
			<DataTable
				data={mockTables}
				columns={columns}
				renderRowActions={({ row }) => (
					<div style={{ display: 'flex', gap: 8 }}>
						<Button
							size="small"
							variant="outlined"
							color="primary"
							startIcon={<FuseSvgIcon>lucide:pencil</FuseSvgIcon>}
							onClick={() => handleEdit(row)}
						>
							Edit
						</Button>
						<Button
							size="small"
							variant="outlined"
							color="error"
							startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							onClick={() => handleDelete(row)}
						>
							Delete
						</Button>
					</div>
				)}
			/>
			<KnowledgeBaseTableDialog
				open={editDialogOpen}
				onClose={handleEditClose}
				onSubmit={() => {
					console.log('submit successful');
				}}
				initialData={editTable}
				mode="edit"
			/>
			<Dialog open={deleteDialogOpen} onClose={handleDeleteClose} maxWidth="xs">
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete <b>{deleteTable?.name}</b>?
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteClose}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
}

export default KnowledgeBaseTable;
