'use client';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { TestCase } from '@/services/testCaseService';

interface TestCaseDetailDialogProps {
	open: boolean;
	onClose: () => void;
	testCase: TestCase | null;
	onSave: (updated: Partial<TestCase>) => void;
	onDelete: () => void;
}

const TestCaseDetailDialog: React.FC<TestCaseDetailDialogProps> = ({ open, onClose, testCase, onSave, onDelete }) => {
	const [name, setName] = useState(testCase?.name || '');
	const [description, setDescription] = useState(testCase?.description || '');

	React.useEffect(() => {
		setName(testCase?.name || '');
		setDescription(testCase?.description || '');
	}, [testCase]);

	if (!testCase) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Test Case Renaming</DialogTitle>
			<DialogContent>
				<TextField
					label="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					fullWidth
					margin="normal"
				/>
				<Typography
					variant="body2"
					color="textSecondary"
					sx={{ mt: 2 }}
				>
					ID: {testCase.id}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={() => onSave({ name, description })}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TestCaseDetailDialog;
