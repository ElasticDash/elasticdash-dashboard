'use client';
import React, { useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody
} from '@mui/material';

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls }) => {
    useEffect(() => {
        console.log('AI Calls data:', aiCalls);
    }, [aiCalls]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>AI Calls</DialogTitle>
			<DialogContent>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Timestamp</TableCell>
							<TableCell>Input</TableCell>
							<TableCell>Output</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{aiCalls.map((call) => (
							<TableRow key={call.id}>
								<TableCell>{call.id}</TableCell>
								<TableCell>{new Date(call.createdAt).toLocaleString()}</TableCell>
								<TableCell>{JSON.stringify(call.input)}</TableCell>
								<TableCell>{call.expectedOutput}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AiCallDialog;
