import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useRef, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import KnowledgeBaseApiDialog from './KnowledgeBaseApiDialog';
import { uploadOpenApi, createDraftApi, submitDraftKbApi } from '@/services/knowledgeBaseService';
import { initSocket } from '@/services/socketService';

/**
 * The ApiKnowledgeBaseHeader component.
 */

function ApiKnowledgeBaseHeader({
	editApi,
	isChangesTab,
	onApiCreated
}: {
	editApi?: { apiPath: string; apiMethod: string; description: string; tags: string[]; openapiOperation: any } | null;
	onEditClose?: () => void;
	isChangesTab?: boolean;
	onApiCreated?: () => void;
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTable, setDeleteTable] = useState<any>(null);
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
			socket.on('kb:submit-api:complete', (data: any) => {
				setIsApplying(false);
				showSuccessNotification('API RAG build completed!');
				if (onApiCreated) onApiCreated();
			});
			socket.on('kb:submit-api:error', (data: any) => {
				setIsApplying(false);
				showErrorNotification('API RAG build failed: ' + (data?.error || 'Unknown error'));
			});
		}
		return () => {
			if (socket) {
				socket.off('kb:submit-api:complete');
				socket.off('kb:submit-api:error');
			}
		};
	}, [onApiCreated]);
	// const handleDelete = (row: any) => {
	//     setDeleteTable(row.original);
	//     setDeleteDialogOpen(true);
	// };
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
	type ApiItem = { apiMethod: string; apiPath: string };
	const [apiList, setApiList] = useState<ApiItem[]>([]);
	const [uploadError, setUploadError] = useState('');
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
		setApiList([]);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	const handleDialogSubmit = async (formData: any) => {
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
			await createDraftApi(formData, token);
			setDialogOpen(false);

			if (onApiCreated) onApiCreated();
		} catch (err) {
			alert('Failed to create API.');
		}
	};
	const dragRef = useRef<HTMLDivElement>(null);
	const [dragActive, setDragActive] = useState(false);
	const handleFile = (f: File | null) => {
		setFile(f);
		setApiList([]);
		setUploadError('');

		if (f) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				try {
					const text = ev.target?.result as string;
					const json = JSON.parse(text);

					if (json.openapi && json.paths && typeof json.paths === 'object') {
						// Extract method/path pairs
						const apis: ApiItem[] = [];
						Object.entries(json.paths).forEach(([path, methods]) => {
							if (typeof methods === 'object') {
								Object.keys(methods).forEach((method) => {
									apis.push({ apiMethod: method.toUpperCase(), apiPath: path });
								});
							}
						});

						if (apis.length === 0) throw new Error('No API paths found in OpenAPI doc.');

						setApiList(apis);
					} else {
						throw new Error('Not a valid OpenAPI document.');
					}
				} catch (_err: any) {
					setUploadError('File is not a valid OpenAPI (swagger) JSON.');
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
							Add API
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
									await submitDraftKbApi(0, token);

									if (onApiCreated) onApiCreated();
								} catch (err) {
									alert('Failed to submit draft KB API.');
								} finally {
									setIsApplying(false);
								}
							}}
						>
							{isApplying ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
							{isApplying ? 'Applying...' : 'Apply To Live'}
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
				<DialogTitle>Upload API File</DialogTitle>
				<DialogContent>
					{apiList.length === 0 ? (
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
								input.accept = '.json';
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
								<Typography variant="subtitle2">{apiList.length} APIs detected</Typography>
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
												Method
											</th>
											<th
												align="left"
												style={{
													padding: '12px 16px',
													borderBottom: '2px solid #e0e0e0',
													fontWeight: 600
												}}
											>
												Path
											</th>
										</tr>
									</thead>
									<tbody>
										{apiList.map((api, idx) => (
											<tr
												key={idx}
												style={{ height: 44, borderBottom: '1px solid #eee' }}
											>
												<td style={{ padding: '10px 16px', borderBottom: '1px solid #eee' }}>
													<b>{api.apiMethod}</b>
												</td>
												<td style={{ padding: '10px 16px', borderBottom: '1px solid #eee' }}>
													{api.apiPath}
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
									setApiList([]);
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
						disabled={!file || !!uploadError || apiList.length === 0 || isUploading}
						onClick={async () => {
							setIsUploading(true);
							try {
								const token =
									typeof window !== 'undefined'
										? localStorage.getItem('token') || undefined
										: undefined;
								const fileContent = await file.text();
								const fileJson = JSON.parse(fileContent);
								await uploadOpenApi({ projectId: 0, file: fileJson, token });
								setUploadDialogOpen(false);
								setFile(null);
								setApiList([]);
							} catch (_err) {
								setUploadError('Failed to upload OpenAPI file.');
							} finally {
								setIsUploading(false);
							}
						}}
					>
						{isUploading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
						{isUploading ? 'Uploading...' : 'Upload'}
					</Button>
				</DialogActions>
			</Dialog>
			{/* Reusable Add/Edit Dialog */}
			<KnowledgeBaseApiDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				onSubmit={handleDialogSubmit}
				initialData={dialogMode === 'edit' && editApi ? editApi : undefined}
				mode={dialogMode}
			/>
		</div>
	);
}

export default ApiKnowledgeBaseHeader;
// Export edit dialog handler for parent
export { ApiKnowledgeBaseHeader };
