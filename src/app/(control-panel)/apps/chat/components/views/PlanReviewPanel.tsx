import React from 'react';
import { Box, Button, Paper, Typography, CircularProgress } from '@mui/material';

export interface PlanReviewPanelProps {
	plan: any;
	onApprove: () => void;
	onReject: () => void;
	isProcessing: boolean;
}

const PlanReviewPanel: React.FC<PlanReviewPanelProps> = ({ plan, onApprove, onReject, isProcessing }) => {
	return (
		<Paper
			elevation={3}
			sx={{ p: 2, mb: 2, background: '#fffbe6', border: '1px solid #ffe58f' }}
		>
			<Typography
				variant="h6"
				gutterBottom
			>
				Plan Approval Required
			</Typography>
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="body1"
					sx={{ whiteSpace: 'pre-wrap' }}
				>
					{plan?.description || JSON.stringify(plan, null, 2)}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<Button
					variant="contained"
					color="success"
					onClick={onApprove}
					disabled={isProcessing}
				>
					{isProcessing ? <CircularProgress size={20} /> : 'Approve'}
				</Button>
				<Button
					variant="outlined"
					color="error"
					onClick={onReject}
					disabled={isProcessing}
				>
					Reject
				</Button>
			</Box>
		</Paper>
	);
};

export default PlanReviewPanel;
