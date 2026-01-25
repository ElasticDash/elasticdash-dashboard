import { Dialog, AppBar, Toolbar, Typography, IconButton, DialogContent, Button, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import { fetchTraceDetail, createTestCaseFromTrace } from '@/services/traceDetailService';
import TraceObservationStepper from './TraceObservationStepper';

interface TraceDetailDialogProps {
	open: boolean;
	onClose: () => void;
	traceId: string | null;
}

const TraceDetailDialog: React.FC<TraceDetailDialogProps> = ({ open, onClose, traceId }) => {
	const [traceDetail, setTraceDetail] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [testCaseLoading, setTestCaseLoading] = useState(false);
	const [testCaseError, setTestCaseError] = useState<string | null>(null);
	const [testCaseSuccess, setTestCaseSuccess] = useState<string | null>(null);

	// Fetch trace detail when dialog opens and traceId changes
	useEffect(() => {
		if (open && traceId) {
			setLoading(true);
			setError(null);
			setTraceDetail(null);
			setTestCaseError(null);
			setTestCaseSuccess(null);

			fetchTraceDetail({ id: traceId })
				.then((res) => {
					console.log('Fetched trace detail:', res);
					setTraceDetail(res);
				})
				.catch((err: any) => {
					setError(err.message || 'Failed to fetch trace detail');
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [open, traceId]);

	// Reset state when dialog is closed
	useEffect(() => {
		if (!open) {
			setTraceDetail(null);
			setError(null);
			setLoading(false);
			setTestCaseError(null);
			setTestCaseSuccess(null);
		}
	}, [open]);

	const handleCreateTestCase = async () => {
		if (!traceId) return;

		setTestCaseLoading(true);
		setTestCaseError(null);
		setTestCaseSuccess(null);

		try {
			const res = await createTestCaseFromTrace({ traceId });

			if (!res.success) {
				setTestCaseError(res.error || 'Failed to create test case from trace');
			} else {
				setTestCaseSuccess('Test case created successfully!');
			}
		} catch (err: any) {
			setTestCaseError(err.message || 'Failed to create test case from trace');
		} finally {
			setTestCaseLoading(false);
		}
	};

	if (!open) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xl"
			fullWidth
		>
			<AppBar
				position="relative"
				color="default"
				elevation={0}
				sx={{ position: 'sticky' }}
			>
				<Toolbar>
					<Typography
						variant="h6"
						sx={{ flex: 1 }}
					>
						Trace Detail: {traceId}
					</Typography>
					<Button
						onClick={handleCreateTestCase}
						variant="outlined"
						disabled={testCaseLoading || !traceDetail}
						sx={{ mr: 2 }}
					>
						{testCaseLoading ? 'Creating...' : 'Create Test Case'}
					</Button>
					<IconButton
						edge="end"
						color="inherit"
						onClick={onClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<DialogContent>
				{loading && (
					<div className="flex items-center justify-center py-8">
						<CircularProgress />
					</div>
				)}

				{error && <div className="text-red-500">{error}</div>}

				{!loading && !error && traceDetail && Array.isArray(traceDetail.observations) && (
					<TraceObservationStepper observations={traceDetail.observations} />
				)}

				{!loading && !error && traceDetail && !Array.isArray(traceDetail.observations) && (
					<div className="text-gray-500">No observations found for this trace.</div>
				)}

				{testCaseError && <div className="mt-2 text-xs text-red-500">{testCaseError}</div>}
				{testCaseSuccess && <div className="mt-2 text-xs text-green-600">{testCaseSuccess}</div>}

				<Button
					onClick={onClose}
					variant="outlined"
					sx={{ mt: 2 }}
				>
					Close
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default TraceDetailDialog;
