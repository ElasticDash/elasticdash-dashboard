import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import KnowledgeBaseTableDialog from './KnowledgeBaseTableDialog';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

/**
 * The ApiKnowledgeBaseHeader component.
 */

function ApiKnowledgeBaseHeader({
	editTable,
	isChangesTab
}: {
	editTable?: { name: string; shortDesc: string; keys: any[] } | null;
	onEditClose?: () => void;
	isChangesTab?: boolean;
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTable, setDeleteTable] = useState<any>(null);
	const handleDelete = (row: any) => {
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
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};
	const handleUploadClick = () => {
		setUploadDialogOpen(true);
		handleMenuClose();
	};
	const handleManualClick = () => {
		setDialogMode('add');
		setDialogOpen(true);
		handleMenuClose();
	};
	const handleUploadClose = () => {
		setUploadDialogOpen(false);
		setFile(null);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	const handleDialogSubmit = () => {
		// TODO: handle submit logic
		setDialogOpen(false);
	};
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	return (
		<div className="flex flex-auto flex-col px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<div className="flex min-w-0 flex-col">
						<Typography className="truncate text-xl leading-7 font-semibold tracking-tight md:text-3xl md:leading-[1.375]">
							API Knowledge Base
						</Typography>
						<div className="flex items-center gap-1">
							<FuseSvgIcon color="action">lucide:book-open</FuseSvgIcon>
							<Typography
								className="text-md truncate"
								color="text.secondary"
							>
								Manage and explore your API knowledge base
							</Typography>
						</div>
					</div>
				</div>
				{isChangesTab && (
					<div className="flex items-center gap-2">
						<Button
							className="whitespace-nowrap"
							variant="contained"
							color="primary"
							startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
							onClick={handleMenuOpen}
						>
							Add Table
						</Button>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem onClick={handleUploadClick}>
								<FuseSvgIcon className="mr-2">lucide:upload</FuseSvgIcon>
								Upload File
							</MenuItem>
							<MenuItem onClick={handleManualClick}>
								<FuseSvgIcon className="mr-2">lucide:pencil</FuseSvgIcon>
								Add Manually
							</MenuItem>
						</Menu>
						<Button
							className="whitespace-nowrap"
							variant="contained"
							color="secondary"
							startIcon={<FuseSvgIcon>lucide:rocket</FuseSvgIcon>}
						>
							Apply To Live
						</Button>
					</div>
				)}
				{/* Confirmation Dialog for Delete (to be triggered from table row actions) */}
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
			</div>
			{/* Upload File Dialog remains unchanged */}
			<Dialog
				open={uploadDialogOpen}
				onClose={handleUploadClose}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>Upload Table File</DialogTitle>
				<DialogContent>
					<input
						type="file"
						accept=".csv,.xlsx,.json"
						onChange={handleFileChange}
						style={{ marginTop: 16 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleUploadClose}>Cancel</Button>
					<Button
						variant="contained"
						color="primary"
						disabled={!file}
						onClick={handleUploadClose}
					>
						Upload
					</Button>
				</DialogActions>
			</Dialog>
			{/* Reusable Add/Edit Dialog */}
			<KnowledgeBaseTableDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				onSubmit={handleDialogSubmit}
				initialData={dialogMode === 'edit' && editTable ? editTable : undefined}
				mode={dialogMode}
			/>
		</div>
	);
}

export default ApiKnowledgeBaseHeader;
// Export edit dialog handler for parent
export { ApiKnowledgeBaseHeader };
