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
import React from 'react';
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
	if (!open) return null;

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
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
										{runDetail.run.test_case_name || `ID: ${runDetail.run.test_case_id}`}
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
										{new Date(runDetail.run.started_at).toLocaleString()}
									</Typography>
								</Box>
								{runDetail.run.completed_at && (
									<Box sx={{ display: 'flex', gap: 2 }}>
										<Typography
											variant="body2"
											sx={{ fontWeight: 600, minWidth: 150 }}
										>
											Completed At:
										</Typography>
										<Typography variant="body2">
											{new Date(runDetail.run.completed_at).toLocaleString()}
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

						{runDetail.aiCalls && runDetail.aiCalls.length > 0 ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								{runDetail.aiCalls.map((aiCall, index) => (
									<Paper
										key={aiCall.id}
										sx={{ p: 2 }}
										elevation={1}
									>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 600 }}
											>
												Step {aiCall.step_order}
											</Typography>
											<Chip
												label={aiCall.run_status}
												color={getStatusColor(aiCall.run_status)}
												size="small"
											/>
										</Box>
										<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
											<Box sx={{ display: 'flex', gap: 2 }}>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600, minWidth: 150 }}
												>
													Model:
												</Typography>
												<Typography variant="body2">{aiCall.ai_model}</Typography>
											</Box>
											<Box sx={{ display: 'flex', gap: 2 }}>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600, minWidth: 150 }}
												>
													Endpoint:
												</Typography>
												<Typography
													variant="body2"
													className="font-mono"
												>
													{aiCall.api_endpoint}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', gap: 2 }}>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600, minWidth: 150 }}
												>
													Validation Score:
												</Typography>
												<Typography variant="body2">{aiCall.validation_score}</Typography>
											</Box>
											{aiCall.run_started_at && (
												<Box sx={{ display: 'flex', gap: 2 }}>
													<Typography
														variant="body2"
														sx={{ fontWeight: 600, minWidth: 150 }}
													>
														Duration:
													</Typography>
													<Typography variant="body2">
														{new Date(aiCall.run_started_at).toLocaleTimeString()} -{' '}
														{aiCall.run_completed_at
															? new Date(aiCall.run_completed_at).toLocaleTimeString()
															: 'Running...'}
													</Typography>
												</Box>
											)}
										</Box>
									</Paper>
								))}
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
