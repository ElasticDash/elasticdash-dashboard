import { uploadSqlDdl, submitDraftKbTable } from '@/services/knowledgeBaseService';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useRef, useEffect } from 'react';
import KnowledgeBaseTableDialog from './KnowledgeBaseTableDialog';
import Alert from '@mui/material/Alert';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { initSocket } from '@/services/socketService';

/**
 * The DataTableKnowledgeBaseHeader component.
 */

function DataTableKnowledgeBaseHeader({
	editTable,
	isChangesTab,
	onTableCreated
}: {
	editTable?: { tableName: string; description: string; tags: string[]; keys: any[] } | null;
	onEditClose?: () => void;
	isChangesTab?: boolean;
	onTableCreated?: () => void;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [tableList, setTableList] = useState<string[]>([]);
	const [uploadError, setUploadError] = useState('');
	const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isApplying, setIsApplying] = useState(false);

	// Socket event handlers for async Apply To Live
	useEffect(() => {
		let socket;
		try {
			socket = initSocket();
		} catch (error) {
			console.error('Socket initialization error:', error);
		}

		function showSuccessNotification(msg: string) {
			// TODO: Replace with your notification system
			alert(msg);
		}

		function showErrorNotification(msg: string) {
			// TODO: Replace with your notification system
			alert(msg);
		}

		if (socket) {
			socket.on('kb:submit-table:complete', (data: any) => {
				setIsApplying(false);
				showSuccessNotification('Table RAG build completed!');

				if (onTableCreated) onTableCreated();
			});
			socket.on('kb:submit-table:error', (data: any) => {
				setIsApplying(false);
				showErrorNotification('Table RAG build failed: ' + (data?.error || 'Unknown error'));
			});
		}

		return () => {
			if (socket) {
				socket.off('kb:submit-table:complete');
				socket.off('kb:submit-table:error');
			}
		};
	}, [onTableCreated]);

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
		setTableList([]);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	const handleDialogSubmit = () => {
		// TODO: handle submit logic
		setDialogOpen(false);
	};
	const dragRef = useRef<HTMLDivElement>(null);
	const [dragActive, setDragActive] = useState(false);
	const handleFile = (f: File | null) => {
		setFile(f);
		setTableList([]);
		setUploadError('');

		if (f) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				try {
					const text = ev.target?.result as string;

					// Find CREATE TABLE statements
					const matches = [...text.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`\w]+)/gi)];
					const tables = matches.map((m) => m[1]);

					if (tables.length === 0) throw new Error('No CREATE TABLE statements found.');

					setTableList(tables);
				} catch (_err: any) {
					setUploadError('File does not contain any CREATE TABLE statement.');
				}
			};
			reader.onerror = () => setUploadError('Failed to read file');
			reader.readAsText(f);
		}
	};
	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	return (
		<div className="flex flex-auto flex-col px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<div className="flex min-w-0 flex-col">
						<Typography className="truncate text-xl leading-7 font-semibold tracking-tight md:text-3xl md:leading-[1.375]">
							Data Table Knowledge Base
						</Typography>
						<div className="flex items-center gap-1">
							<FuseSvgIcon color="action">lucide:database</FuseSvgIcon>
							<Typography
								className="text-md truncate"
								color="text.secondary"
							>
								Manage and explore your data tables
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
							disabled={isApplying}
							onClick={async () => {
								setIsApplying(true);
								try {
									const token =
										typeof window !== 'undefined'
											? localStorage.getItem('token') || undefined
											: undefined;
									await submitDraftKbTable(0, token);

									if (onTableCreated) onTableCreated();
								} catch (err) {
									alert('Failed to submit draft KB Table.');
								} finally {
									setIsApplying(false);
								}
							}}
						>
							{isApplying ? (
								<CircularProgress
									size={20}
									sx={{ mr: 1 }}
								/>
							) : null}
							{isApplying ? 'Applying...' : 'Apply To Live'}
						</Button>
					</div>
				)}
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
					{tableList.length === 0 ? (
						<div
							ref={dragRef}
							onDragEnter={handleDrag}
							onDragOver={handleDrag}
							onDragLeave={handleDrag}
							onDrop={handleDrop}
							style={{
								border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
								borderRadius: 8,
								padding: 32,
								textAlign: 'center',
								background: dragActive ? '#e3f2fd' : '#fafafa',
								cursor: 'pointer',
								marginTop: 16,
								marginBottom: 8
							}}
							onClick={() => {
								const input = document.createElement('input');
								input.type = 'file';
								input.accept = '.sql';
								input.onchange = (e: any) => {
									handleFile(e.target.files?.[0] || null);
								};
								input.click();
							}}
						>
							{file ? (
								<Typography variant="subtitle1">Selected file: {file.name}</Typography>
							) : (
								<Typography
									variant="subtitle1"
									color="text.secondary"
								>
									Drag & drop your file here, or click to select
								</Typography>
							)}
						</div>
					) : (
						<>
							<Alert
								severity="success"
								sx={{ mt: 2 }}
							>
								<Typography variant="subtitle2">{tableList.length} tables detected</Typography>
							</Alert>
							<div
								style={{
									maxHeight: 320,
									overflowY: 'auto',
									border: '1px solid #eee',
									borderRadius: 6,
									marginTop: 8
								}}
							>
								<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
									<thead style={{ position: 'sticky', top: 0, background: '#fafafa', zIndex: 1 }}>
										<tr style={{ height: 48, borderBottom: '2px solid #e0e0e0' }}>
											<th
												align="left"
												style={{
													padding: '12px 16px',
													borderBottom: '2px solid #e0e0e0',
													fontWeight: 600
												}}
											>
												Table Name
											</th>
										</tr>
									</thead>
									<tbody>
										{tableList.map((table, idx) => (
											<tr
												key={idx}
												style={{ height: 44, borderBottom: '1px solid #eee' }}
											>
												<td style={{ padding: '10px 16px', borderBottom: '1px solid #eee' }}>
													{table}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<Button
								variant="outlined"
								color="primary"
								sx={{ mt: 2 }}
								onClick={() => {
									setFile(null);
									setTableList([]);
									setUploadError('');
								}}
							>
								Replace File
							</Button>
						</>
					)}
					{uploadError && (
						<Alert
							severity="error"
							sx={{ mt: 2 }}
						>
							{uploadError}
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleUploadClose}>Cancel</Button>
					<Button
						variant="contained"
						color="primary"
						disabled={!file || !!uploadError || tableList.length === 0 || isUploading}
						onClick={async () => {
							setIsUploading(true);
							try {
								const token =
									typeof window !== 'undefined'
										? localStorage.getItem('token') || undefined
										: undefined;
								await uploadSqlDdl({
									projectId: 0,
									databaseId: 1,
									ddlText: await file!.text(),
									token
								});
								setUploadDialogOpen(false);
								setFile(null);
								setTableList([]);
							} catch (_err) {
								setUploadError('Failed to upload SQL file.');
							} finally {
								setIsUploading(false);
							}
						}}
					>
						{isUploading ? (
							<CircularProgress
								size={20}
								sx={{ mr: 1 }}
							/>
						) : null}
						{isUploading ? 'Uploading...' : 'Upload'}
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

export default DataTableKnowledgeBaseHeader;
// Export edit dialog handler for parent
export { DataTableKnowledgeBaseHeader };
