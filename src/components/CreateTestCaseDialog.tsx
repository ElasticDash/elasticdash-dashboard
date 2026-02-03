import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface CreateTestCaseDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (name: string) => void;
	loading?: boolean;
}

const CreateTestCaseDialog: React.FC<CreateTestCaseDialogProps> = ({
	open,
	onClose,
	onConfirm,
	loading = false
}) => {
	const [name, setName] = useState('');

	React.useEffect(() => {
		if (open) {
			setName('');
		}
	}, [open]);

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Create Test Case</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Test Case Name"
					type="text"
					fullWidth
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={loading}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					onClick={() => onConfirm(name)}
					color="primary"
					variant="contained"
					disabled={loading || !name.trim()}
				>
					{loading ? 'Creating...' : 'Create'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateTestCaseDialog;
