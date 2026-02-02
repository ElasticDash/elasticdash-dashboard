import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface DeleteTestCaseDialogProps {
	open: boolean;
	onClose: () => void;
	onDelete: () => void;
}

const DeleteTestCaseDialog: React.FC<DeleteTestCaseDialogProps> = ({ open, onClose, onDelete }) => (
	<Dialog
		open={open}
		onClose={onClose}
	>
		<DialogTitle>Delete Test Case</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Are you sure you want to delete this test case? This action cannot be undone.
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>Cancel</Button>
			<Button
				onClick={onDelete}
				color="error"
				variant="contained"
				autoFocus
			>
				Delete
			</Button>
		</DialogActions>
	</Dialog>
);

export default DeleteTestCaseDialog;
