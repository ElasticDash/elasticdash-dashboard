import { Dialog, AppBar, Toolbar, Typography, IconButton, DialogContent, Button } from '@mui/material';
import React from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';

import { useState } from 'react';
import { fetchTraceDetail, createTestCaseFromTrace } from '@/services/traceDetailService';

interface SessionDetailDialogProps {
	open: boolean;
	onClose: () => void;
	sessionId: string | null;
	detail: any | null;
	loading: boolean;
	error: string | null;
}

const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
	open,
	onClose,
	sessionId,
	detail,
	loading,
	error
}) => {
	const [traceDetail, setTraceDetail] = useState<any | null>(null);
	const [traceLoading, setTraceLoading] = useState(false);
	const [traceError, setTraceError] = useState<string | null>(null);
	const [testCaseLoading, setTestCaseLoading] = useState<string | null>(null);
	const [testCaseError, setTestCaseError] = useState<string | null>(null);
	const [testCaseSuccess, setTestCaseSuccess] = useState<string | null>(null);

	const handleTraceDetail = async (traceId: string) => {
		setTraceLoading(true);
		setTraceError(null);
		try {
			const res = await fetchTraceDetail({ id: traceId });
            console.log('Fetched trace detail:', res);
			setTraceDetail(res);
		} catch (err: any) {
			setTraceError(err.message || 'Failed to fetch trace detail');
		} finally {
			setTraceLoading(false);
		}
	};

	const handleBackToSession = () => {
		setTraceDetail(null);
		setTraceError(null);
		setTraceLoading(false);
	};

	const handleCreateTestCaseFromTrace = async (traceId: string) => {
		setTestCaseLoading(traceId);
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
			setTestCaseLoading(null);
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
						{traceDetail ? `Trace Detail: ${traceDetail.id}` : `Session Detail: ${sessionId}`}
					</Typography>
					{traceDetail && (
						<Button
							onClick={handleBackToSession}
							variant="outlined"
							sx={{ mr: 2 }}
						>
							Back to Session
						</Button>
					)}
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
				{traceDetail ? (
					<>
						{traceLoading && <div>Loading trace detail...</div>}
						{traceError && <div className="text-red-500">{traceError}</div>}
						{!traceLoading && !traceError && traceDetail && (
							<table className="mb-6 min-w-full border text-sm">
								<tbody>
									{Object.entries(traceDetail).map(([key, value]) => (
										<tr key={key}>
											<td className="border px-2 py-1 font-bold">{key}</td>
											<td className="border px-2 py-1 font-mono">
												{typeof value === 'object' ? JSON.stringify(value) : String(value)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</>
				) : (
					<>
						{loading && <div>Loading...</div>}
						{error && <div className="text-red-500">{error}</div>}
						{detail && detail.meta && (
							<table className="mb-6 min-w-full border text-sm">
								<thead>
									<tr className="bg-gray-100">
										{detail.meta.map((col: any) => (
											<th
												key={col.name}
												className="border px-2 py-1"
											>
												{col.name}
											</th>
										))}
										<th className="border px-2 py-1">Actions</th>
									</tr>
								</thead>
								<tbody>
									{detail.data.length === 0 ? (
										<tr>
											<td
												colSpan={detail.meta.length + 1}
												className="py-4 text-center"
											>
												No traces found.
											</td>
										</tr>
									) : (
										detail.data.map((row: any) => (
											<tr key={row.id}>
												{detail.meta.map((col: any) => (
													<td
														key={col.name}
														className="border px-2 py-1 font-mono"
													>
														{typeof row[col.name] === 'object'
															? JSON.stringify(row[col.name])
															: String(row[col.name])}
													</td>
												))}
												<td className="border px-2 py-1 flex gap-2">
													<Button
														size="small"
														variant="contained"
														onClick={() => handleTraceDetail(row.id)}
													>
														Detail
													</Button>
													<Button
														size="small"
														variant="outlined"
														color="secondary"
														disabled={testCaseLoading === row.id}
														onClick={() => handleCreateTestCaseFromTrace(row.id)}
													>
														{testCaseLoading === row.id ? 'Creating...' : 'Create Test Case'}
													</Button>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						)}
						{detail && <div className="text-xs text-gray-500">Rows: {detail.rows}</div>}
						{testCaseError && <div className="text-red-500 text-xs mt-2">{testCaseError}</div>}
						{testCaseSuccess && <div className="text-green-600 text-xs mt-2">{testCaseSuccess}</div>}
					</>
				)}
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

export default SessionDetailDialog;
