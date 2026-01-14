import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface KeyRow {
	name: string;
	category: string;
	type: string;
	description: string;
}

interface KnowledgeBaseTableDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: { tableName: string; description: string; tags: string[]; keys: KeyRow[] }) => void;
	initialData?: {
		tableName: string;
		description: string;
		tags: string[];
		keys: KeyRow[];
		schemaJson?: { columns?: { name: string; type: string; nullable: boolean }[] };
	};
	mode: 'add' | 'edit';
}

const KnowledgeBaseTableDialog: React.FC<KnowledgeBaseTableDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	mode
}) => {
	const [tableName, setTableName] = React.useState(initialData?.tableName || '');
	const [description, setDescription] = React.useState(initialData?.description || '');
	const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
	const [keys, setKeys] = React.useState<KeyRow[]>(initialData?.keys || []);
	const [formTouched, setFormTouched] = React.useState(false);
	const [isUploading, setIsUploading] = React.useState(false);

	const categoryOptions = ['Primary Key', 'Foreign Key', 'Others'];

	React.useEffect(() => {
		setTableName(initialData?.tableName || '');
		setDescription(initialData?.description || '');
		setTags(initialData?.tags || []);
		setKeys(initialData?.keys || []);
		setFormTouched(false);
		console.log('initialData', initialData);
	}, [initialData, open]);

	React.useEffect(() => {
		console.log('keys: ', keys);
	}, [keys]);

	const handleAddKey = () => {
		setKeys([...keys, { name: '', category: '', type: '', description: '' }]);
	};
	const handleDeleteKey = (idx: number) => {
		setKeys(keys.filter((_, i) => i !== idx));
	};
	const handleKeyChange = (idx: number, field: string, value: string) => {
		setKeys(keys.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
	};
	const hasPrimaryKey = keys.some((k) => k.category === 'Primary Key');
	const allKeysValid = keys.length > 0 && keys.every((k) => k.name && k.category && k.type);
	const handleSubmit = async () => {
		setFormTouched(true);

		console.log('keys: ', keys);

		if (tableName.trim() && description.trim() && hasPrimaryKey && allKeysValid) {
			setIsUploading(true);
			try {
				await Promise.resolve(onSubmit({ tableName, description, tags, keys }));
			} finally {
				setIsUploading(false);
			}
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{mode === 'add' ? 'Add Table Manually' : 'Edit Table'}</DialogTitle>
			<DialogContent>
				<TextField
					label="Table Name"
					value={tableName}
					onChange={(e) => setTableName(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !tableName.trim()}
					helperText={formTouched && !tableName.trim() ? 'Table Name is required' : ''}
				/>
				<TextField
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !description.trim()}
					helperText={formTouched && !description.trim() ? 'Description is required' : ''}
				/>
				<TextField
					label="Tags (comma separated)"
					value={tags.join(', ')}
					onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()))}
					fullWidth
					margin="normal"
				/>
				<Typography
					variant="subtitle1"
					sx={{ mt: 2, mb: 1 }}
				>
					Keys
				</Typography>
				<TableContainer style={{ maxHeight: 150 }}>
					<Table
						size="small"
						stickyHeader
					>
						<TableHead>
							<TableRow>
								<TableCell>Key</TableCell>
								<TableCell>Category</TableCell>
								<TableCell>Type</TableCell>
								<TableCell>Short Description</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody className="max-h-60 overflow-y-auto">
							{keys.map((row, idx) => (
								<TableRow key={idx}>
									<TableCell sx={{ width: '20%' }}>
										<TextField
											value={row.name}
											onChange={(e) => handleKeyChange(idx, 'key', e.target.value)}
											size="small"
											required
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
											error={formTouched && !row.name}
											helperText={formTouched && !row.name ? 'Required' : ''}
										/>
									</TableCell>
									<TableCell sx={{ width: '20%' }}>
										<FormControl
											size="small"
											required
											fullWidth
											error={formTouched && !row.category}
										>
											<InputLabel>Category</InputLabel>
											<Select
												value={row.category}
												defaultValue={'Others'}
												label="Category"
												onChange={(e) => handleKeyChange(idx, 'category', e.target.value)}
											>
												{categoryOptions.map((opt) => (
													<MenuItem
														key={opt}
														value={opt}
													>
														{opt}
													</MenuItem>
												))}
											</Select>
											{formTouched && !row.category && <FormHelperText>Required</FormHelperText>}
										</FormControl>
									</TableCell>
									<TableCell sx={{ width: '20%' }}>
										<TextField
											value={row.type}
											onChange={(e) => handleKeyChange(idx, 'type', e.target.value)}
											size="small"
											required
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
											error={formTouched && !row.type}
											helperText={formTouched && !row.type ? 'Required' : ''}
										/>
									</TableCell>
									<TableCell sx={{ width: '30%' }}>
										<TextField
											value={row.description}
											onChange={(e) => handleKeyChange(idx, 'description', e.target.value)}
											size="small"
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
										/>
									</TableCell>
									<TableCell>
										<IconButton
											onClick={() => handleDeleteKey(idx)}
											size="small"
											color="error"
										>
											<FuseSvgIcon>lucide:trash</FuseSvgIcon>
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							<TableRow>
								<TableCell
									colSpan={5}
									align="center"
								>
									<Button
										variant="outlined"
										size="small"
										startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
										onClick={handleAddKey}
									>
										Add Key
									</Button>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
				{formTouched && !hasPrimaryKey && (
					<FormHelperText
						error
						sx={{ mt: 1 }}
					>
						At least one Primary Key is required.
					</FormHelperText>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isUploading}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					disabled={isUploading}
				>
					{isUploading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
					{isUploading ? 'Uploading...' : mode === 'add' ? 'Add' : 'Save'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default KnowledgeBaseTableDialog;
