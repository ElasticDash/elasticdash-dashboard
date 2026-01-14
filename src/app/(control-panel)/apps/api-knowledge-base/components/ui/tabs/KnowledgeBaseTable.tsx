import { useMemo, useState, useEffect } from 'react';
import {
	fetchDraftApis,
	fetchActiveApis,
	updateDraftApi,
	deleteDraftApi,
	createDraftTable
} from '@/services/knowledgeBaseService';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import { Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import KnowledgeBaseApiDialog from '../KnowledgeBaseApiDialog';

interface Tables {
	id: number;
	name: string;
	description: string;
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
	const columns = useMemo<MRT_ColumnDef<any>[]>(
		() => [
			{
				accessorKey: 'tags',
				header: 'Tags',
				Cell: ({ cell }) => (
					<div style={{ display: 'flex', gap: 4 }}>
						{Array.isArray(cell.getValue()) &&
							(cell.getValue() as string[])?.map((tag: string) => (
								<Chip
									key={tag}
									label={tag}
									size="small"
								/>
							))}
					</div>
				)
			},
			{
				accessorKey: 'apiMethod',
				header: 'API Method',
				Cell: ({ cell }) => <Typography fontWeight={600}>{String(cell.getValue())}</Typography>
			},
			{
				accessorKey: 'apiPath',
				header: 'API Path',
				Cell: ({ cell }) => <Typography fontWeight={600}>{String(cell.getValue())}</Typography>
			},
			{
				accessorKey: 'description',
				header: 'Description',
				Cell: ({ cell }) => <Typography>{String(cell.getValue() || '')}</Typography>
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
				const fetchFn = live ? fetchActiveApis : fetchDraftApis;
				const result = await fetchFn(token, 0);
				setData(Array.isArray(result.result) ? result.result : []);
			} catch (e) {
				setError('Failed to load API knowledge base.');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [live]);

	// Handler to open edit dialog with row data
	const handleEdit = (row) => {
		setEditTable({
			id: row.original.id,
			apiPath: row.original.apiPath,
			apiMethod: row.original.apiMethod,
			description: row.original.description || '',
			tags: row.original.tags || [],
			keys: row.original.keys || [],
			openapiOperation: row.original.openapiOperation || undefined
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
	const handleDeleteConfirm = async () => {
		if (!deleteTable?.id) return;

		setLoading(true);
		setError('');
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
			await deleteDraftApi(deleteTable.id, token);
			// Refresh data
			const fetchFn = live ? fetchActiveApis : fetchDraftApis;
			const result = await fetchFn(token, 0);
			setData(Array.isArray(result.result) ? result.result : []);
		} catch (e) {
			setError('Failed to delete API.');
		} finally {
			setLoading(false);
			setDeleteDialogOpen(false);
			setDeleteTable(null);
		}
	};
	return (
		<Paper
			className="shadow-1 flex w-full flex-auto flex-col overflow-hidden rounded-t-lg rounded-b-none"
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
			<KnowledgeBaseApiDialog
				open={editDialogOpen}
				onClose={handleEditClose}
				onSubmit={async (formData) => {
					setLoading(true);
					setError('');
					console.log('Submitted data: ', formData);
					try {
						const token =
							typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;

						if (editTable?.id) {
							// Edit mode
							await updateDraftApi(editTable.id, formData, token);
						} else {
							// Add mode
							await createDraftTable(formData, token);
						}

						// Refresh data
						const fetchFn = live ? fetchActiveApis : fetchDraftApis;
						const result = await fetchFn(token, 0);
						setData(Array.isArray(result.result) ? result.result : []);
						setEditDialogOpen(false);
						setEditTable(null);
					} catch (e) {
						setError(editTable?.id ? 'Failed to update API.' : 'Failed to create API.');
					} finally {
						setLoading(false);
					}
				}}
				initialData={editTable}
				mode={editTable?.id ? 'edit' : 'add'}
			/>
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteClose}
				maxWidth="xs"
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete <b>{deleteTable?.name}</b>?
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
