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
	key: string;
	category: string;
	type: string;
	description: string;
}

interface KnowledgeBaseApiDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: {
		apiPath: string;
		apiMethod: string;
		description: string;
		tags: string[];
		openapiOperation: any;
	}) => void;
	initialData?: {
		apiPath: string;
		apiMethod: string;
		description: string;
		tags: string[];
		openapiOperation: any;
	};
	mode: 'add' | 'edit';
}

const KnowledgeBaseApiDialog: React.FC<KnowledgeBaseApiDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	mode
}) => {
	const [path, setPath] = React.useState(initialData?.apiPath || '');
	const [method, setMethod] = React.useState(initialData?.apiMethod || 'GET');
	const [description, setShortDesc] = React.useState(initialData?.description || '');
	const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
	const [keys, setKeys] = React.useState<KeyRow[]>([]);
	const [formTouched, setFormTouched] = React.useState(false);

	const typeOptions = ['integer', 'string', 'boolean', 'float', 'date', 'text'];
	const categoryOptions = ['Param', 'Query', 'Body'];
	const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

	React.useEffect(() => {
		setPath(initialData?.apiPath || '');
		setMethod(initialData?.apiMethod || 'GET');
		setShortDesc(initialData?.description || '');
		setTags(initialData?.tags || []);
		let keysArr: KeyRow[] = [];

		// If keys are missing/empty but openapiOperation exists, map parameters and requestBody
		if ((!keysArr || keysArr.length === 0) && (initialData as any)?.openapiOperation) {
			const op = (initialData as any).openapiOperation;

			// Map parameters
			if (Array.isArray(op.parameters)) {
				keysArr = op.parameters.map((param: any) => ({
					key: param.name || '',
					category: param.in
						? param.in === 'path'
							? 'Param'
							: param.in === 'query'
								? 'Query'
								: param.in
						: '',
					type: param.schema?.type || '',
					description: param.description || ''
				}));
			}

			// Map requestBody (assume JSON schema, only top-level properties)
			if (
				op.requestBody &&
				op.requestBody.content &&
				op.requestBody.content['application/json'] &&
				op.requestBody.content['application/json'].schema &&
				op.requestBody.content['application/json'].schema.properties
			) {
				const props = op.requestBody.content['application/json'].schema.properties;
				for (const [key, val] of Object.entries(props)) {
					keysArr.push({
						key: key,
						category: 'Body',
						type: (val as any).type || '',
						description: (val as any).description || ''
					});
				}
			}
		}

		setKeys(keysArr);
		setFormTouched(false);
		console.log('initialData', initialData);
	}, [initialData, open]);

	const handleAddKey = () => {
		setKeys([...keys, { key: '', category: '', type: '', description: '' }]);
	};
	const handleDeleteKey = (idx: number) => {
		setKeys(keys.filter((_, i) => i !== idx));
	};
	const handleKeyChange = (idx: number, field: string, value: string) => {
		setKeys(keys.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
	};
	const allKeysValid = keys.length > 0 && keys.every((k) => k.key && k.category && k.type && k.description);

	const handleSubmit = () => {
		setFormTouched(true);

		if (path.trim() && method && description.trim() && allKeysValid) {
			// Convert keys back to openapiOperation
			const parameters = keys
				.filter((k) => k.category === 'Param' || k.category === 'Query')
				.map((k) => ({
					in: k.category === 'Param' ? 'path' : 'query',
					name: k.key,
					schema: { type: k.type },
					required: true, // You may want to adjust this logic
					description: k.description
				}));
			const bodyProps: Record<string, any> = {};
			keys.filter((k) => k.category === 'Body').forEach((k) => {
				bodyProps[k.key] = { type: k.type, description: k.description };
			});
			const openapiOperation: any = {
				parameters
			};

			if (Object.keys(bodyProps).length > 0) {
				openapiOperation.requestBody = {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: bodyProps
							}
						}
					}
				};
			}

			onSubmit({ apiPath: path, apiMethod: method, description, tags, openapiOperation });
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{mode === 'add' ? 'Add API Manually' : 'Edit API'}</DialogTitle>
			<DialogContent>
				<TextField
					label="Path"
					value={path}
					onChange={(e) => setPath(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !path.trim()}
					helperText={formTouched && !path.trim() ? 'Path is required' : ''}
				/>
				<FormControl
					fullWidth
					required
					margin="normal"
					error={formTouched && !method}
				>
					<InputLabel>Method</InputLabel>
					<Select
						value={method}
						label="Method"
						onChange={(e) => setMethod(e.target.value)}
					>
						{methodOptions.map((opt) => (
							<MenuItem
								key={opt}
								value={opt}
							>
								{opt}
							</MenuItem>
						))}
					</Select>
					{formTouched && !method && <FormHelperText>Required</FormHelperText>}
				</FormControl>
				<TextField
					label="Tags (comma separated)"
					value={tags.join(', ')}
					onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()))}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="Short Description"
					value={description}
					onChange={(e) => setShortDesc(e.target.value)}
					required
					fullWidth
					margin="normal"
					error={formTouched && !description.trim()}
					helperText={formTouched && !description.trim() ? 'Short Description is required' : ''}
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
											value={row.key}
											onChange={(e) => handleKeyChange(idx, 'key', e.target.value)}
											size="small"
											required
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
											error={formTouched && !row.key}
											helperText={formTouched && !row.key ? 'Required' : ''}
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
										<FormControl
											size="small"
											required
											fullWidth
											error={formTouched && !row.type}
										>
											<InputLabel>Type</InputLabel>
											<Select
												value={row.type}
												label="Type"
												onChange={(e) => handleKeyChange(idx, 'type', e.target.value)}
											>
												{typeOptions.map((opt) => (
													<MenuItem
														key={opt}
														value={opt}
													>
														{opt}
													</MenuItem>
												))}
											</Select>
											{formTouched && !row.type && <FormHelperText>Required</FormHelperText>}
										</FormControl>
									</TableCell>
									<TableCell sx={{ width: '30%' }}>
										<TextField
											value={row.description}
											onChange={(e) => handleKeyChange(idx, 'description', e.target.value)}
											size="small"
											required
											fullWidth
											inputProps={{ style: { minWidth: 0 } }}
											error={formTouched && !row.description}
											helperText={formTouched && !row.description ? 'Required' : ''}
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

export default KnowledgeBaseApiDialog;
