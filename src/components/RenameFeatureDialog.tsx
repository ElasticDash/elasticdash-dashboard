import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface RenameFeatureDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (newName: string) => void;
	initialName?: string;
	loading?: boolean;
	error?: string | null;
}

const RenameFeatureDialog: React.FC<RenameFeatureDialogProps> = ({
	open,
	onClose,
	onConfirm,
	initialName = '',
	loading = false,
	error
}) => {
	const [name, setName] = useState(initialName);

	React.useEffect(() => {
		setName(initialName);
	}, [initialName, open]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>Rename Feature</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Feature Name"
					type="text"
					fullWidth
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={loading}
				/>
				{error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					onClick={() => onConfirm(name)}
					color="primary"
					variant="contained"
					disabled={loading || !name.trim()}
				>
					Rename
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RenameFeatureDialog;
