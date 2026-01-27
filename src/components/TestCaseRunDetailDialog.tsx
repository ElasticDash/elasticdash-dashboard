import {
	Dialog,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	DialogContent,
	Button,
	CircularProgress,
	Paper,
	Box,
	Chip
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import { TestCaseRunDetail } from '@/services/testCaseRunService';

interface TestCaseRunDetailDialogProps {
	open: boolean;
	onClose: () => void;
	runDetail: TestCaseRunDetail | null;
	loading: boolean;
	error: string | null;
}

const TestCaseRunDetailDialog: React.FC<TestCaseRunDetailDialogProps> = ({
	open,
	onClose,
	runDetail,
	loading,
	error
}) => {
	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'completed':
			case 'success':
				return 'success';
			case 'pending':
			case 'running':
				return 'warning';
			case 'failed':
			case 'error':
				return 'error';
			default:
				return 'default';
		}
	};

	// Collapsible state for each AI call
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});
	const [showOnlyFailed, setShowOnlyFailed] = useState(true);

	const handleToggle = (id: number) => {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	useEffect(() => {
		console.log('runDetail changed: ', runDetail);
	}, [runDetail]);

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
						Test Case Run Details {runDetail?.run?.id && `#${runDetail.run.id}`}
					</Typography>
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

				{error && <Typography color="error">{error}</Typography>}

				{!loading && !error && runDetail && (
					<>
						<Paper
							sx={{ p: 2, mb: 2 }}
							elevation={1}
						>
							<Typography
								variant="h6"
								sx={{ mb: 2 }}
							>
								Run Information
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Test Case:
									</Typography>
									<Typography variant="body2">
										{runDetail.run.testCaseName || `ID: ${runDetail.run.testCaseId}`}
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Status:
									</Typography>
									<Chip
										label={runDetail.run.status}
										color={getStatusColor(runDetail.run.status)}
										size="small"
									/>
								</Box>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Started At:
									</Typography>
									<Typography variant="body2">
										{new Date(runDetail.run.startedAt).toLocaleString()}
									</Typography>
								</Box>
								{runDetail.run.completedAt && (
									<Box sx={{ display: 'flex', gap: 2 }}>
										<Typography
											variant="body2"
											sx={{ fontWeight: 600, minWidth: 150 }}
										>
											Completed At:
										</Typography>
										<Typography variant="body2">
											{new Date(runDetail.run.completedAt).toLocaleString()}
										</Typography>
									</Box>
								)}
							</Box>
						</Paper>

						<Typography
							variant="h6"
							sx={{ mb: 2 }}
						>
							AI Calls ({runDetail.aiCalls?.length || 0})
						</Typography>

						{/* Toggle for failed/all */}
						<Box sx={{ mb: 2 }}>
							<FormControlLabel
								control={
									<Switch
										checked={showOnlyFailed}
										onChange={() => setShowOnlyFailed((v) => !v)}
									/>
								}
								label="Only view failed test"
							/>
						</Box>

						{runDetail.aiCalls && runDetail.aiCalls.length > 0 ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								{(showOnlyFailed
									? runDetail.aiCalls.filter((aiCall) =>
										['failed', 'error'].includes((aiCall.run_status || '').toLowerCase())
									)
									: runDetail.aiCalls
								)
								.filter((aiCall) => aiCall.input && aiCall.run_output)
								.map((aiCall) => {
									const isOpen = !!expanded[aiCall.id];
									const start = aiCall.run_started_at ? new Date(aiCall.run_started_at) : null;
									const end = aiCall.run_completed_at ? new Date(aiCall.run_completed_at) : null;
									const duration =
										start && end
											? `${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s`
											: 'N/A';
									return (
										<Paper
											key={aiCall.id}
											sx={{ p: 1, mb: 1 }}
											elevation={1}
										>
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												onClick={() => handleToggle(aiCall.id)}
												sx={{ cursor: 'pointer', userSelect: 'none' }}
											>
												<Box
													display="flex"
													alignItems="center"
													gap={2}
												>
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600 }}
													>
														Step {aiCall.step_order}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{start ? start.toLocaleTimeString() : 'N/A'}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														Duration: {duration}
													</Typography>
													<Chip
														label={aiCall.run_status}
														color={getStatusColor(aiCall.run_status)}
														size="small"
													/>
												</Box>
												<Typography
													variant="body2"
													color="primary"
												>
													{isOpen ? '▼' : '▶'}
												</Typography>
											</Box>
											{isOpen && (
												<Box sx={{ mt: 2, ml: 2 }}>
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600, mb: 1 }}
													>
														Input
													</Typography>
													<Paper sx={{ p: 1, mb: 1, background: '#f7f7f7' }}>
														<pre
															style={{
																margin: 0,
																fontSize: 13,
																whiteSpace: 'pre-wrap',
																wordBreak: 'break-all'
															}}
														>
															{JSON.stringify(aiCall.input, null, 2)}
														</pre>
													</Paper>
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600, mb: 1 }}
													>
														Output
													</Typography>
													<Paper sx={{ p: 1, mb: 1, background: '#f7f7f7' }}>
														<pre
															style={{
																margin: 0,
																fontSize: 13,
																whiteSpace: 'pre-wrap',
																wordBreak: 'break-all'
															}}
														>
															{typeof aiCall.run_output === 'string'
																? aiCall.run_output
																: JSON.stringify(aiCall.run_output, null, 2)}
														</pre>
													</Paper>
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600, mb: 1 }}
													>
														Expected Output
													</Typography>
													<Paper sx={{ p: 1, background: '#f7f7f7' }}>
														<pre
															style={{
																margin: 0,
																fontSize: 13,
																whiteSpace: 'pre-wrap',
																wordBreak: 'break-all'
															}}
														>
															{typeof aiCall.expected_output === 'string'
																? aiCall.expected_output
																: JSON.stringify(aiCall.expected_output, null, 2)}
														</pre>
													</Paper>
												</Box>
											)}
										</Paper>
									);
								})}
							</Box>
						) : (
							<Typography
								variant="body2"
								color="text.secondary"
							>
								No AI calls found for this run.
							</Typography>
						)}
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

export default TestCaseRunDetailDialog;
