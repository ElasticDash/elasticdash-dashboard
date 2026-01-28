import {
	Dialog,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	DialogContent,
	CircularProgress,
	Box,
	Chip,
	List,
	ListItem,
	ListItemButton,
	Button
} from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import { TestCaseRunRecordDetail } from '@/services/testCaseRunRecordService';
import { fetchTestCaseRunDetail, getMockTestCaseRunDetailWithPromptDrift } from '@/services/testCaseRunService';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';

interface TestCaseRunRecordDetailDialogProps {
	open: boolean;
	onClose: () => void;
	recordDetail: TestCaseRunRecordDetail | null;
	loading: boolean;
	error: string | null;
}

const TestCaseRunRecordDetailDialog: React.FC<TestCaseRunRecordDetailDialogProps> = ({
	open,
	onClose,
	recordDetail,
	loading,
	error
}) => {
	const [selectedRun, setSelectedRun] = useState<any | null>(null);
	const [selectedAiCall, setSelectedAiCall] = useState<any | null>(null);
	const [aiCallsLoading, setAiCallsLoading] = useState(false);
	const [allAiCalls, setAllAiCalls] = useState<any[]>([]);

	// Helper function to prettify JSON
	const prettifyJSON = (content: any): string => {
		if (content === null || content === undefined) {
			return '';
		}

		if (typeof content === 'string') {
			try {
				const parsed = JSON.parse(content);
				return JSON.stringify(parsed, null, 2);
			} catch {
				return content;
			}
		}

		try {
			return JSON.stringify(content, null, 2);
		} catch {
			return String(content);
		}
	};

	const getStatusColor = (status: string, promptDriftDetected?: boolean) => {
		// Prompt drift gets yellow/warning regardless of status
		if (promptDriftDetected) {
			return 'warning';
		}

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

	const getStatusLabel = (status: string, promptDriftDetected?: boolean, isRun?: boolean) => {
		if (promptDriftDetected) {
			return isRun ? 'Suspicious' : 'Prompt Drifted';
		}

		return status;
	};

	// Get all runs as individual items in the list
	const runs = useMemo(() => {
		if (!recordDetail?.runs) return [];

		return recordDetail.runs;
	}, [recordDetail]);

	// Auto-select first run
	useEffect(() => {
		if (open && runs.length > 0 && !selectedRun) {
			setSelectedRun(runs[0]);
		}
	}, [open, runs, selectedRun]);

	// Fetch AI calls for selected run
	useEffect(() => {
		if (!selectedRun) {
			setAllAiCalls([]);
			setSelectedAiCall(null);
			return;
		}

		const fetchAiCalls = async () => {
			setAiCallsLoading(true);
			try {
				// Use mock data if promptDriftDetected is true
				let detail;

				if (selectedRun.promptDriftDetected) {
					detail = getMockTestCaseRunDetailWithPromptDrift(selectedRun.id);
				} else {
					detail = await fetchTestCaseRunDetail(selectedRun.id);
				}

				if (detail.aiCalls && detail.aiCalls.length > 0) {
					setAllAiCalls(detail.aiCalls);
					// Auto-select first AI call
					setSelectedAiCall(detail.aiCalls[0]);
				} else {
					setAllAiCalls([]);
					setSelectedAiCall(null);
				}
			} catch (err) {
				console.error(`Failed to fetch AI calls for run ${selectedRun.id}:`, err);
				setAllAiCalls([]);
				setSelectedAiCall(null);
			} finally {
				setAiCallsLoading(false);
			}
		};

		fetchAiCalls();
	}, [selectedRun]);

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedRun(null);
			setSelectedAiCall(null);
			setAllAiCalls([]);
		}
	}, [open]);

	useEffect(() => {
		console.log('allAiCalls: ', allAiCalls);
	}, [allAiCalls]);

	if (!open) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xl"
			fullWidth
			PaperProps={{
				sx: {
					height: '80vh',
					maxHeight: '80vh'
				}
			}}
		>
			<AppBar
				position="relative"
				color="default"
				elevation={0}
			>
				<Toolbar>
					<Typography
						variant="h6"
						sx={{ flex: 1 }}
					>
						Test Case Run Record Details {recordDetail?.record?.id && `#${recordDetail.record.id}`}
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
			<DialogContent
				sx={{ p: 0, height: '100%', display: 'flex', overflow: 'hidden' }}
				className="border-t-2 border-gray-300"
			>
				{loading && (
					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
						<CircularProgress />
					</Box>
				)}

				{error && (
					<Box sx={{ width: '100%', p: 2 }}>
						<Typography color="error">{error}</Typography>
					</Box>
				)}

				{!loading && !error && recordDetail && (
					<Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
						{/* First column - Test Cases list */}
						<Box
							sx={{
								width: 240,
								borderRight: '1px solid',
								borderColor: 'divider',
								overflowY: 'auto',
								bgcolor: 'background.default'
							}}
						>
							{runs.length === 0 ? (
								<Typography sx={{ p: 2, color: 'text.secondary' }}>No test runs found.</Typography>
							) : (
								<List sx={{ p: 0 }}>
									{runs.map((run, index) => (
										<ListItem
											disablePadding
											key={run.id}
											sx={{ alignItems: 'flex-start' }}
										>
											<Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													minWidth: 28,
													pt: 1
												}}
											>
												<FiberManualRecordIcon
													fontSize="small"
													color={selectedRun?.id === run.id ? 'primary' : 'disabled'}
												/>
												{index < runs.length - 1 && (
													<MuiDivider
														orientation="vertical"
														flexItem
														sx={{
															height: 28,
															borderRightWidth: 2,
															borderColor: 'divider',
															my: 0,
															mx: 'auto'
														}}
													/>
												)}
											</Box>
											<ListItemButton
												selected={selectedRun?.id === run.id}
												onClick={() => setSelectedRun(run)}
												sx={{ pl: 1, alignItems: 'flex-start' }}
											>
												<Box
													sx={{
														width: '100%',
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center'
													}}
												>
													<Box>
														<Typography
															variant="body2"
															fontWeight={600}
														>
															{run.testCaseName}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Run #{run.id}
														</Typography>
													</Box>
													<Chip
														label={getStatusLabel(
															run.status,
															run.promptDriftDetected,
															true
														)}
														color={getStatusColor(run.status, run.promptDriftDetected)}
														size="small"
														sx={{
															height: 18,
															fontSize: '0.65rem',
															...(run.promptDriftDetected && {
																backgroundColor: '#ffc107',
																color: '#000',
																fontWeight: 600
															})
														}}
													/>
												</Box>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							)}
						</Box>

						{/* Second column - AI Calls list */}
						<Box
							sx={{
								width: 300,
								borderRight: '1px solid',
								borderColor: 'divider',
								overflowY: 'auto',
								bgcolor: 'background.default'
							}}
						>
							{aiCallsLoading ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
									<CircularProgress size={24} />
								</Box>
							) : allAiCalls.length === 0 ? (
								<Typography sx={{ p: 2, color: 'text.secondary' }}>
									{selectedRun ? 'No AI calls found for this run.' : 'Select a run to view AI calls.'}
								</Typography>
							) : (
								<List sx={{ p: 0 }}>
									{allAiCalls.map((call, index) => (
										<ListItem
											disablePadding
											key={call.id}
											sx={{ alignItems: 'flex-start' }}
										>
											<Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													minWidth: 28,
													pt: 1
												}}
											>
												<FiberManualRecordIcon
													fontSize="small"
													color={selectedAiCall === call ? 'primary' : 'disabled'}
												/>
												{index < allAiCalls.length - 1 && (
													<MuiDivider
														orientation="vertical"
														flexItem
														sx={{
															height: 28,
															borderRightWidth: 2,
															borderColor: 'divider',
															my: 0,
															mx: 'auto'
														}}
													/>
												)}
											</Box>
											<ListItemButton
												selected={selectedAiCall === call}
												onClick={() => setSelectedAiCall(call)}
												sx={{ pl: 1, alignItems: 'flex-start' }}
											>
												<Box
													sx={{
														width: '100%',
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center'
													}}
												>
													<Box>
														<Typography
															variant="body2"
															fontWeight={600}
														>
															AI Call #{call.stepOrder || index + 1}
														</Typography>
														{call.name && (
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{call.name}
															</Typography>
														)}
													</Box>
													<Chip
														label={getStatusLabel(
															call.runStatus || call.status,
															call.promptDriftDetected
														)}
														color={getStatusColor(
															call.runStatus || call.status,
															call.promptDriftDetected
														)}
														size="small"
														sx={{
															height: 18,
															fontSize: '0.65rem',
															...(call.promptDriftDetected && {
																backgroundColor: '#ffc107',
																color: '#000',
																fontWeight: 600
															})
														}}
													/>
												</Box>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							)}
						</Box>

						{/* Third column - AI Call details */}
						<Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
							{selectedAiCall ? (
								<>
									<Box sx={{ height: 'calc(100% - 44px)', overflow: 'auto' }}>
										<Typography
											variant="h6"
											gutterBottom
										>
											Input
										</Typography>
										<pre
											style={{
												background: '#f5f5f5',
												padding: '16px',
												borderRadius: '4px',
												overflow: 'auto',
												fontSize: '14px',
												marginBottom: '24px'
											}}
										>
											{prettifyJSON(selectedAiCall.input)}
										</pre>

										<Typography
											variant="h6"
											gutterBottom
										>
											Output
										</Typography>
										<pre
											style={{
												background: '#f5f5f5',
												padding: '16px',
												borderRadius: '4px',
												overflow: 'auto',
												fontSize: '14px',
												marginBottom: '24px'
											}}
										>
											{prettifyJSON(selectedAiCall.runOutput || selectedAiCall.output)}
										</pre>

										{selectedAiCall.expectedOutput && (
											<>
												<Typography
													variant="h6"
													gutterBottom
												>
													Expected Output
												</Typography>
												<pre
													style={{
														background: '#f5f5f5',
														padding: '16px',
														borderRadius: '4px',
														overflow: 'auto',
														fontSize: '14px'
													}}
												>
													{prettifyJSON(selectedAiCall.expectedOutput)}
												</pre>
											</>
										)}

										{selectedAiCall.failureReason && (
											<>
												<Typography
													variant="h6"
													gutterBottom
													sx={{ mt: 2, color: 'error.main' }}
												>
													Failure Reason
												</Typography>
												<pre
													style={{
														background: '#ffebee',
														padding: '16px',
														borderRadius: '4px',
														overflow: 'auto',
														fontSize: '14px',
														color: '#c62828'
													}}
												>
													{selectedAiCall.failureReason}
												</pre>
											</>
										)}

										{selectedAiCall.promptDriftDetected && (
											<>
												<Typography
													variant="h6"
													gutterBottom
													sx={{ mt: 2, color: 'warning.main' }}
												>
													Detected Prompt
												</Typography>
												<pre
													style={{
														background: '#fffbf0',
														padding: '16px',
														borderRadius: '4px',
														overflow: 'auto',
														fontSize: '14px',
														color: '#333',
														border: '1px solid #ffc107'
													}}
												>
													{`You are a helpful AI assistant. Your task is to analyze user input and provide accurate, concise responses.

When the user asks a question:
1. Break down the question into key components
2. Research relevant information from your knowledge base
3. Formulate a clear, structured response
4. Provide examples when appropriate

Always maintain a professional and friendly tone.`}
												</pre>
											</>
										)}
									</Box>

									{selectedAiCall.promptDriftDetected ? (
										<>
											<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
												<Button
													variant="outlined"
													color="secondary"
													size="small"
												>
													Ignore
												</Button>
												<Button
													variant="contained"
													color="primary"
													size="small"
												>
													Apply New Prompt
												</Button>
											</Box>
										</>
									) : (
										<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
											{(selectedAiCall.runStatus || selectedAiCall.status)?.toLowerCase() ===
											'success' ? (
												<Button
													variant="contained"
													color="error"
													size="small"
												>
													Mark as Failure
												</Button>
											) : (
												<Button
													variant="contained"
													color="success"
													size="small"
												>
													Mark as Success
												</Button>
											)}
										</Box>
									)}
								</>
							) : (
								<Typography color="text.secondary">
									Select an AI call from the list to view details
								</Typography>
							)}
						</Box>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default TestCaseRunRecordDetailDialog;
