import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface DeleteFeatureDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	featureName?: string;
}

const DeleteFeatureDialog: React.FC<DeleteFeatureDialogProps> = ({ open, onClose, onConfirm, featureName }) => (
	<Dialog
		open={open}
		onClose={onClose}
	>
		<DialogTitle>Delete Feature</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Are you sure you want to delete the feature
				{featureName ? ` "${featureName}"` : ''}?
				<br />
				This action cannot be undone and all related traces will be inaccessible.
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>Cancel</Button>
			<Button
				onClick={onConfirm}
				color="error"
				variant="contained"
				autoFocus
			>
				Delete
			</Button>
		</DialogActions>
	</Dialog>
);

export default DeleteFeatureDialog;
