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
	Button,
	Paper
} from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import {
	acceptTestCaseRerun,
	resetTestCase,
	TestCaseRunRecordDetail,
	fetchTestCaseRunDetail,
	getMockTestCaseRunDetailWithPromptDrift
} from '@/services/testCaseService';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';
import { humanApproveTestCaseRunAICall } from '@/services/testCaseService';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { prettifyJSON } from '@/utils/prettifyJSON';

interface TestCaseRunRecordDetailDialogProps {
	open: boolean;
	onClose: () => void;
	onRefresh?: () => void;
	recordDetail: TestCaseRunRecordDetail | null;
	loading: boolean;
	error: string | null;
}

const TestCaseRunRecordDetailDialog: React.FC<TestCaseRunRecordDetailDialogProps> = ({
	open,
	onClose,
	onRefresh,
	recordDetail,
	loading,
	error
}) => {
	const [selectedRun, setSelectedRun] = useState<any | null>(null);
	const [selectedAiCall, setSelectedAiCall] = useState<any | null>(null);
	const [aiCallsLoading, setAiCallsLoading] = useState(false);
	const [allAiCalls, setAllAiCalls] = useState<any[]>([]);
	const [resettingRunId, setResettingRunId] = useState<number | null>(null);
	const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
	const [pendingReplaceRun, setPendingReplaceRun] = useState<any | null>(null);

	// Dialog state for alerts
	const [alertDialogOpen, setAlertDialogOpen] = useState(false);
	const [alertDialogMsg, setAlertDialogMsg] = useState('');

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
			case 'benchmark':
				return 'info';
			default:
				return 'default';
		}
	};

	const getStatusLabel = (status: string, promptDriftDetected?: boolean, isRun?: boolean) => {
		if (promptDriftDetected) {
			return isRun ? 'Suspicious' : 'Prompt Drifted';
		}

		if (status === 'failed') {
			return 'Mismatch';
		}

		return status.charAt(0).toUpperCase() + status.slice(1);
	};

	// Handle reset test case
	const handleResetTestCase = async (run: any) => {
		if (!recordDetail?.record?.id || !run.testCaseId) return;

		setResettingRunId(run.id);
		try {
			await resetTestCase(run.testCaseId, recordDetail.record.id);
			// Optionally refresh the run list or show a success message
			setAlertDialogMsg('Test case rerun has started. Please come back later to check the results.');
			setAlertDialogOpen(true);
			setSelectedRun(null);
			setSelectedRun(selectedRun); // Trigger re-fetch of AI calls
		} catch (err: any) {
			setAlertDialogMsg(err.message || 'Failed to reset test case');
			setAlertDialogOpen(true);
		} finally {
			setResettingRunId(null);
		}
	};

	const handleTCUpdate = async (updatedRun: any) => {
		if (!recordDetail) return;

		try {
			await acceptTestCaseRerun(updatedRun.id);

			// Refetch AI calls and test case runs
			if (recordDetail.record.id) {
				const detail = await fetchTestCaseRunDetail(recordDetail.record.id);

				if (detail) {
					// Update runs and AI calls state
					if (detail.runs) {
						setSelectedRun(detail.runs.find((r) => r.id === updatedRun.id) || null);
					}
				}
			}

			// Optionally, refetch AI calls for the selected run
			if (updatedRun.id) {
				setAiCallsLoading(true);
				try {
					const runDetail = await fetchTestCaseRunDetail(updatedRun.id);
					setAllAiCalls(runDetail?.aiCalls || []);
				} catch {
					console.error('Failed to refetch AI calls after test case update');
				}
				setAiCallsLoading(false);
			}

			onRefresh();
		} catch (err: any) {
			setAlertDialogMsg(err.message || 'Failed to update test case');
			setAlertDialogOpen(true);
		}
	};

	const handleReplaceClick = (run: any) => {
		setPendingReplaceRun(run);
		setConfirmReplaceOpen(true);
	};

	const handleConfirmReplace = async () => {
		if (pendingReplaceRun) {
			setConfirmReplaceOpen(false);
			await handleTCUpdate(pendingReplaceRun);
			setPendingReplaceRun(null);
		}
	};

	const handleCancelReplace = () => {
		setConfirmReplaceOpen(false);
		setPendingReplaceRun(null);
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

	function humanApproveAiCallHandler(approve: boolean) {
		humanApproveTestCaseRunAICall(selectedAiCall.racId, approve)
			.then(async () => {
				// Update the selected AI call's humanValidation status
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

				setAlertDialogMsg(approve ? 'Marked as Success' : 'Marked as Mismatch');
				setAlertDialogOpen(true);
			})
			.catch((err) => {
				setAlertDialogMsg(err?.message || 'Failed to update AI call status');
				setAlertDialogOpen(true);
			});
	}

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

				{/* Alert Dialog for error/success messages */}
				<Dialog
					open={alertDialogOpen}
					onClose={() => setAlertDialogOpen(false)}
				>
					<DialogContent>
						<Typography
							variant="h6"
							gutterBottom
						>
							Notice
						</Typography>
						<Typography>{alertDialogMsg}</Typography>
					</DialogContent>
					<Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
						<Button
							onClick={() => setAlertDialogOpen(false)}
							autoFocus
						>
							OK
						</Button>
					</Box>
				</Dialog>

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
									{runs.map((run, index) => {
										const prev = runs[index - 1];
										const showSeparator = index > 0 && prev && run.testCaseId !== prev.testCaseId;
										return (
											<React.Fragment key={run.id}>
												{showSeparator && (
													<MuiDivider
														sx={{ my: 0.5, borderColor: 'primary.main', borderWidth: 2 }}
													/>
												)}
												<ListItem
													disablePadding
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
														{(() => {
															const next = runs[index + 1];
															return (
																index < runs.length - 1 &&
																next &&
																run.testCaseId === next.testCaseId && (
																	<MuiDivider
																		orientation="vertical"
																		flexItem
																		sx={{
																			height: 28,
																			borderRightWidth: 1,
																			borderColor: 'grey.400',
																			my: 0,
																			mx: 'auto'
																		}}
																	/>
																)
															);
														})()}
													</Box>
													<ListItemButton
														selected={selectedRun?.id === run.id}
														onClick={() => setSelectedRun(run)}
														sx={{
															pl: 1,
															alignItems: 'flex-start',
															flexDirection: 'column',
															backgroundColor:
																run.isRerun &&
																!['outdated', 'benchmark'].includes(
																	run.status.toLowerCase()
																)
																	? '#e3f2fd'
																	: 'inherit'
														}}
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
																	noWrap
																	sx={{
																		maxWidth: 120,
																		textOverflow: 'ellipsis',
																		overflow: 'hidden',
																		whiteSpace: 'nowrap'
																	}}
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
															<Box
																sx={{
																	display: 'flex',
																	flexDirection: 'column',
																	gap: 0.5,
																	alignItems: 'flex-end'
																}}
															>
																{run.isRerun &&
																!['outdated', 'benchmark'].includes(
																	run.status.toLowerCase()
																) ? (
																	<Button
																		size="small"
																		variant="outlined"
																		color="secondary"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleReplaceClick(run);
																		}}
																		disabled={resettingRunId === run.id}
																		sx={{
																			fontSize: '0.65rem',
																			padding: '2px 8px',
																			minWidth: 'auto',
																			height: 20
																		}}
																	>
																		Replace
																	</Button>
																) : (
																	<Chip
																		label={getStatusLabel(
																			run.status,
																			run.promptDriftDetected,
																			true
																		)}
																		color={getStatusColor(
																			run.status,
																			run.promptDriftDetected
																		)}
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
																)}
																{/* Confirmation Dialog for Replace */}
																<Dialog
																	open={confirmReplaceOpen}
																	onClose={handleCancelReplace}
																	maxWidth="xs"
																	fullWidth
																>
																	<DialogContent>
																		<Typography
																			variant="h6"
																			gutterBottom
																		>
																			Replace Test Case Steps?
																		</Typography>
																		<Typography
																			variant="body2"
																			color="text.secondary"
																			gutterBottom
																		>
																			This will replace all steps of the relevant
																			test case with the steps from this run. This
																			action cannot be undone.
																		</Typography>
																		<Box
																			sx={{
																				display: 'flex',
																				justifyContent: 'flex-end',
																				gap: 2,
																				mt: 2
																			}}
																		>
																			<Button
																				onClick={handleCancelReplace}
																				color="inherit"
																				variant="outlined"
																			>
																				Cancel
																			</Button>
																			<Button
																				onClick={handleConfirmReplace}
																				color="error"
																				variant="contained"
																			>
																				Replace
																			</Button>
																		</Box>
																	</DialogContent>
																</Dialog>
															</Box>
														</Box>
													</ListItemButton>
												</ListItem>
											</React.Fragment>
										);
									})}
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
								<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
									<List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
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
															icon={
																call.humanValidation !== undefined &&
																call.humanValidation !== null ? (
																	<AccessibilityIcon
																		fontSize="inherit"
																		style={{ marginLeft: 2 }}
																	/>
																) : undefined
															}
															label={
																call.humanValidation !== undefined &&
																call.humanValidation !== null
																	? call.humanValidation
																		? 'Success'
																		: 'Mismatch'
																	: getStatusLabel(call.runStatus || call.status)
															}
															color={
																call.humanValidation !== undefined &&
																call.humanValidation !== null
																	? call.humanValidation
																		? 'success'
																		: 'error'
																	: getStatusColor(call.runStatus || call.status)
															}
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
									{/* Footer for rerun reset */}
									{!selectedRun?.isRerun && (
										<Box
											sx={{
												p: 2,
												borderTop: '1px solid',
												borderColor: 'divider',
												bgcolor: 'background.paper',
												display: 'flex',
												justifyContent: 'flex-end'
											}}
										>
											<Button
												variant="outlined"
												color="secondary"
												onClick={() => handleResetTestCase(selectedRun)}
												disabled={resettingRunId === selectedRun.id}
											>
												{resettingRunId === selectedRun.id
													? 'Rerunning...'
													: 'Rerun This Test Case'}
											</Button>
										</Box>
									)}
								</Box>
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

										{prettifyJSON(selectedAiCall.runInput || selectedAiCall.input)}

										<Typography
											variant="h6"
											gutterBottom
										>
											Output
										</Typography>
										{prettifyJSON(selectedAiCall.runOutput || selectedAiCall.output)}

										{selectedAiCall.expectedOutput && !selectedRun.isRerun && (
											<>
												<Typography
													variant="h6"
													gutterBottom
												>
													Expected Output
												</Typography>
												{prettifyJSON(selectedAiCall.expectedOutput)}
											</>
										)}

										{selectedAiCall.failureReason && !selectedRun.isRerun && (
											<>
												<Typography
													variant="h6"
													gutterBottom
													sx={{ mt: 2, color: 'error.main' }}
												>
													Failure Reason
												</Typography>
												<Paper sx={{ p: 1, background: '#f7f7f7', mb: 2 }}>
													<p
														style={{
															margin: 0,
															fontSize: 13,
															whiteSpace: 'pre-wrap'
														}}
													>
														{selectedAiCall.failureReason}
													</p>
												</Paper>
											</>
										)}
									</Box>

									<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
										<>
											<Button
												variant="contained"
												color="error"
												size="small"
												onClick={() => humanApproveAiCallHandler(false)}
											>
												Mark as Mismatch
											</Button>
											<Button
												variant="contained"
												color="success"
												size="small"
												onClick={() => humanApproveAiCallHandler(true)}
											>
												Mark as Success
											</Button>
										</>
									</Box>
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
