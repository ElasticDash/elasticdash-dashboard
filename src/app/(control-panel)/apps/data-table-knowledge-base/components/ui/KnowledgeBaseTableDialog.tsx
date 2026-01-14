import React from 'react';
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
	shortDesc: string;
}

interface KnowledgeBaseTableDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: { name: string; shortDesc: string; keys: KeyRow[] }) => void;
	initialData?: {
		name: string;
		shortDesc: string;
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
	const [name, setName] = React.useState(initialData?.name || '');
	const [shortDesc, setShortDesc] = React.useState(initialData?.shortDesc || '');
	const [keys, setKeys] = React.useState<KeyRow[]>(initialData?.keys || []);
	const [formTouched, setFormTouched] = React.useState(false);

	const typeOptions = ['SERIAL', 'INT', 'BOOLEAN', 'FLOAT', 'DATE', 'TEXT', 'VARCHAR', 'CHAR', 'TIMESTAMP'];
	const categoryOptions = ['Primary Key', 'Foreign Key', 'Others'];

	React.useEffect(() => {
		setName(initialData?.name || '');
		setShortDesc(initialData?.shortDesc || '');
		setKeys(initialData?.keys || []);
		setFormTouched(false);
		console.log('initialData', initialData);
	}, [initialData, open]);

	React.useEffect(() => {
		console.log('keys: ', keys);
	}, [keys]);

	const handleAddKey = () => {
		setKeys([...keys, { name: '', category: '', type: '', shortDesc: '' }]);
	};
	const handleDeleteKey = (idx: number) => {
		setKeys(keys.filter((_, i) => i !== idx));
	};
	const handleKeyChange = (idx: number, field: string, value: string) => {
		setKeys(keys.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
	};
	const hasPrimaryKey = keys.some((k) => k.category === 'Primary Key');
	const allKeysValid = keys.length > 0 && keys.every((k) => k.name && k.category && k.type && k.shortDesc);
	const handleSubmit = () => {
		setFormTouched(true);

		if (name.trim() && shortDesc.trim() && hasPrimaryKey && allKeysValid) {
			onSubmit({ name, shortDesc, keys });
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
					label="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !name.trim()}
					helperText={formTouched && !name.trim() ? 'Name is required' : ''}
				/>
				<TextField
					label="Short Description"
					value={shortDesc}
					onChange={(e) => setShortDesc(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !shortDesc.trim()}
					helperText={formTouched && !shortDesc.trim() ? 'Short Description is required' : ''}
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
											value={row.shortDesc}
											onChange={(e) => handleKeyChange(idx, 'shortDesc', e.target.value)}
											size="small"
											required
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
											error={formTouched && !row.shortDesc}
											helperText={formTouched && !row.shortDesc ? 'Required' : ''}
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
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
				>
					{mode === 'add' ? 'Add' : 'Save'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default KnowledgeBaseTableDialog;
