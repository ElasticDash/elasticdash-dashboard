import { useMemo, useState, useEffect } from 'react';
import { fetchActiveTables, fetchDraftTables } from '@/services/knowledgeBaseService';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import KnowledgeBaseTableDialog from '../KnowledgeBaseTableDialog';

interface Tables {
	id: number;
	tableName: string;
	tags: string[];
}

interface KnowledgeBaseTableProps {
	live?: boolean;
}

function KnowledgeBaseTable({ live = false }: KnowledgeBaseTableProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editTable, setEditTable] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTable, setDeleteTable] = useState(null);
	const [data, setData] = useState<Tables[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const columns = useMemo<MRT_ColumnDef<Tables>[]>(
		() => [
			{
				accessorKey: 'tableName',
				header: 'Table Name',
				Cell: ({ row }) => <Typography fontWeight={600}>{row.original.tableName}</Typography>
			},
			{
				accessorKey: 'tags',
				header: 'Tags',
				Cell: ({ row }) => (
					<div style={{ display: 'flex', gap: 4 }}>
						{row.original?.tags?.map((tag: string) => (
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

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError('');
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
				const fetchFn = live ? fetchActiveTables : fetchDraftTables;
				const result = await fetchFn(token, 0);
				setData(Array.isArray(result.result) ? result.result : []);
			} catch (e) {
				setError('Failed to load data table knowledge base.');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Handler to open edit dialog with row data
	const handleEdit = (row) => {
		setEditTable({
			name: row.original.tableName,
			shortDesc: row.original.shortDesc || '',
			keys: row.original.schemaJson?.columns || []
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
			className="shadow-1 w-full overflow-hidden rounded-t-lg rounded-b-none"
			elevation={0}
		>
			{error && (
				<Typography
					color="error"
					sx={{ p: 2 }}
				>
					{error}
				</Typography>
			)}
			{loading && <Typography sx={{ p: 2 }}>Loading...</Typography>}
			<DataTable
				data={data}
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
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteClose}
				maxWidth="xs"
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete <b>{deleteTable?.tableName}</b>?
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteClose}>Cancel</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
}

export default KnowledgeBaseTable;
