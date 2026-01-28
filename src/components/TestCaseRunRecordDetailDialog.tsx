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
	Chip,
	Tabs,
	Tab,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer
} from '@mui/material';
import React, { useState, useMemo } from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import { TestCaseRunRecordDetail } from '@/services/testCaseRunRecordService';
import { fetchTestCaseRunDetail } from '@/services/testCaseRunService';
import TestCaseRunDetailDialog from './TestCaseRunDetailDialog';

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
	const [activeTab, setActiveTab] = useState(0);

	// State for individual run detail dialog
	const [runDetailOpen, setRunDetailOpen] = useState(false);
	const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
	const [runDetail, setRunDetail] = useState<any | null>(null);
	const [runDetailLoading, setRunDetailLoading] = useState(false);
	const [runDetailError, setRunDetailError] = useState<string | null>(null);

	const handleOpenRunDetail = async (runId: number) => {
		setSelectedRunId(runId);
		setRunDetailOpen(true);
		setRunDetail(null);
		setRunDetailError(null);
		setRunDetailLoading(true);

		try {
			const detail = await fetchTestCaseRunDetail(runId);
			setRunDetail(detail);
		} catch (err: any) {
			setRunDetailError(err.message || 'Failed to fetch test case run detail');
		} finally {
			setRunDetailLoading(false);
		}
	};

	const handleCloseRunDetail = () => {
		setRunDetailOpen(false);
		setSelectedRunId(null);
		setRunDetail(null);
		setRunDetailError(null);
		setRunDetailLoading(false);
	};

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

	// Group runs by test case ID
	const groupedRuns = useMemo(() => {
		if (!recordDetail?.runs) return {};

		const groups: Record<number, typeof recordDetail.runs> = {};
		recordDetail.runs.forEach((run) => {
			if (!groups[run.testCaseId]) {
				groups[run.testCaseId] = [];
			}
			groups[run.testCaseId].push(run);
		});

		return groups;
	}, [recordDetail]);

	// Get unique test cases with names
	const testCases = useMemo(() => {
		if (!recordDetail?.runs) return [];

		const uniqueTestCases = new Map<number, { id: number; name: string }>();
		recordDetail.runs.forEach((run) => {
			if (!uniqueTestCases.has(run.testCaseId)) {
				uniqueTestCases.set(run.testCaseId, {
					id: run.testCaseId,
					name: run.testCaseName
				});
			}
		});

		return Array.from(uniqueTestCases.values());
	}, [recordDetail]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
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
			<DialogContent>
				{loading && (
					<div className="flex items-center justify-center py-8">
						<CircularProgress />
					</div>
				)}

				{error && <Typography color="error">{error}</Typography>}

				{!loading && !error && recordDetail && (
					<>
						{/* Record Metadata */}
						<Paper
							sx={{ p: 2, mb: 2 }}
							elevation={1}
						>
							<Typography
								variant="h6"
								sx={{ mb: 2 }}
							>
								Record Information
							</Typography>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Record ID:
									</Typography>
									<Typography variant="body2">#{recordDetail.record.id}</Typography>
								</Box>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Test Cases:
									</Typography>
									<Typography variant="body2">
										{recordDetail.record.test_case_ids?.length || 0} test case(s)
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Runs Per Case:
									</Typography>
									<Typography variant="body2">{recordDetail.record.times}×</Typography>
								</Box>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600, minWidth: 150 }}
									>
										Status:
									</Typography>
									<Chip
										label={recordDetail.record.status}
										color={getStatusColor(recordDetail.record.status)}
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
										{new Date(recordDetail.record.started_at).toLocaleString()}
									</Typography>
								</Box>
								{recordDetail.record.completed_at && (
									<Box sx={{ display: 'flex', gap: 2 }}>
										<Typography
											variant="body2"
											sx={{ fontWeight: 600, minWidth: 150 }}
										>
											Completed At:
										</Typography>
										<Typography variant="body2">
											{new Date(recordDetail.record.completed_at).toLocaleString()}
										</Typography>
									</Box>
								)}
							</Box>
						</Paper>

						{/* Summary Statistics */}
						<Paper
							sx={{ p: 2, mb: 3 }}
							elevation={1}
						>
							<Typography
								variant="h6"
								sx={{ mb: 2 }}
							>
								Summary
							</Typography>
							<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Total:
									</Typography>
									<Chip
										label={recordDetail.summary.total}
										size="small"
										color="default"
									/>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Success:
									</Typography>
									<Chip
										label={recordDetail.summary.success}
										size="small"
										color="success"
									/>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Failed:
									</Typography>
									<Chip
										label={recordDetail.summary.failed}
										size="small"
										color="error"
									/>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Running:
									</Typography>
									<Chip
										label={recordDetail.summary.running}
										size="small"
										color="warning"
									/>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Pending:
									</Typography>
									<Chip
										label={recordDetail.summary.pending}
										size="small"
										color="default"
										variant="outlined"
									/>
								</Box>
							</Box>
						</Paper>

						{/* Tabs for each test case */}
						{testCases.length > 0 && (
							<Box sx={{ width: '100%' }}>
								<Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 3 }}>
									<Tabs
										value={activeTab}
										onChange={handleTabChange}
										variant="scrollable"
										scrollButtons="auto"
										sx={{
											'& .MuiTabs-indicator': {
												height: 3,
												borderRadius: '3px 3px 0 0'
											},
											'& .MuiTab-root': {
												textTransform: 'none',
												fontWeight: 500,
												fontSize: '0.95rem',
												minHeight: 48,
												'&.Mui-selected': {
													fontWeight: 600,
													color: 'primary.main'
												}
											}
										}}
									>
										{testCases.map((testCase, index) => {
											const runs = groupedRuns[testCase.id] || [];
											const successCount = runs.filter((r) => r.status === 'success').length;
											const failedCount = runs.filter((r) => r.status === 'failed').length;
											const pendingCount = runs.filter((r) => r.status === 'pending').length;
											const runningCount = runs.filter((r) => r.status === 'running').length;

											return (
												<Tab
													key={testCase.id}
													id={`test-case-tab-${index}`}
													label={
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
															<Typography
																variant="body2"
																sx={{ fontWeight: 'inherit' }}
															>
																{testCase.name}
															</Typography>
															<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
																{successCount > 0 && (
																	<Chip
																		label={successCount}
																		size="small"
																		color="success"
																		sx={{
																			height: 20,
																			fontSize: '0.7rem',
																			'& .MuiChip-label': { px: 1 }
																		}}
																	/>
																)}
																{failedCount > 0 && (
																	<Chip
																		label={failedCount}
																		size="small"
																		color="error"
																		sx={{
																			height: 20,
																			fontSize: '0.7rem',
																			'& .MuiChip-label': { px: 1 }
																		}}
																	/>
																)}
																{runningCount > 0 && (
																	<Chip
																		label={runningCount}
																		size="small"
																		color="warning"
																		sx={{
																			height: 20,
																			fontSize: '0.7rem',
																			'& .MuiChip-label': { px: 1 }
																		}}
																	/>
																)}
																{pendingCount > 0 && (
																	<Chip
																		label={pendingCount}
																		size="small"
																		color="default"
																		variant="outlined"
																		sx={{
																			height: 20,
																			fontSize: '0.7rem',
																			'& .MuiChip-label': { px: 1 }
																		}}
																	/>
																)}
															</Box>
														</Box>
													}
												/>
											);
										})}
									</Tabs>
								</Box>

								{/* Tab panels */}
								{testCases.map((testCase, index) => (
									<div
										key={testCase.id}
										role="tabpanel"
										hidden={activeTab !== index}
										id={`test-case-tabpanel-${index}`}
									>
										{activeTab === index && (
											<Box>
												<Box
													sx={{
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center',
														mb: 2,
														px: 1
													}}
												>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 1 }}
													>
														<span style={{ fontSize: '1.1em' }}>💡</span>
														Click on any run to view detailed AI call information
													</Typography>
													<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
														<Typography
															variant="body2"
															color="text.secondary"
															sx={{ fontWeight: 500 }}
														>
															Total: {groupedRuns[testCase.id]?.length || 0} runs
														</Typography>
													</Box>
												</Box>
												<TableContainer
													component={Paper}
													elevation={2}
													sx={{
														borderRadius: 2,
														overflow: 'hidden'
													}}
												>
													<Table size="small">
														<TableHead>
															<TableRow
																sx={{
																	backgroundColor: 'rgba(0, 0, 0, 0.04)',
																	'& .MuiTableCell-root': {
																		fontWeight: 600,
																		color: 'text.primary',
																		borderBottom: '2px solid',
																		borderColor: 'divider'
																	}
																}}
															>
																<TableCell>Run ID</TableCell>
																<TableCell>Status</TableCell>
																<TableCell>Started At</TableCell>
																<TableCell>Completed At</TableCell>
																<TableCell>Duration</TableCell>
																<TableCell width={100}>Actions</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{(!groupedRuns[testCase.id] || groupedRuns[testCase.id].length === 0) ? (
																<TableRow>
																	<TableCell
																		colSpan={6}
																		sx={{ textAlign: 'center', py: 4 }}
																	>
																		<Typography
																			variant="body2"
																			color="text.secondary"
																			sx={{ fontStyle: 'italic' }}
																		>
																			No runs found for this test case
																		</Typography>
																	</TableCell>
																</TableRow>
															) : (
																groupedRuns[testCase.id]?.map((run) => {
																const start = run.startedAt
																	? new Date(run.startedAt)
																	: null;
																const end = run.completedAt
																	? new Date(run.completedAt)
																	: null;
																const duration =
																	start && end
																		? `${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s`
																		: '-';

																return (
																	<TableRow
																		key={run.id}
																		hover
																		onClick={() => handleOpenRunDetail(run.id)}
																		sx={{
																			cursor: 'pointer',
																			transition: 'all 0.2s ease',
																			'&:hover': {
																				backgroundColor: 'rgba(25, 118, 210, 0.08)',
																				transform: 'scale(1.001)',
																				boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
																			},
																			'&:nth-of-type(even)': {
																				backgroundColor: 'rgba(0, 0, 0, 0.02)'
																			}
																		}}
																	>
																		<TableCell>
																			<Typography
																				variant="body2"
																				className="font-mono"
																				sx={{ fontWeight: 600 }}
																			>
																				#{run.id}
																			</Typography>
																		</TableCell>
																		<TableCell>
																			<Chip
																				label={run.status}
																				color={getStatusColor(run.status)}
																				size="small"
																			/>
																		</TableCell>
																		<TableCell>
																			<Typography variant="body2">
																				{start
																					? start.toLocaleString()
																					: '-'}
																			</Typography>
																		</TableCell>
																		<TableCell>
																			<Typography variant="body2">
																				{end ? end.toLocaleString() : '-'}
																			</Typography>
																		</TableCell>
																		<TableCell>
																			<Typography variant="body2">
																				{duration}
																			</Typography>
																		</TableCell>
																		<TableCell>
																			<Button
																				size="small"
																				variant="contained"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleOpenRunDetail(run.id);
																				}}
																				sx={{
																					textTransform: 'none',
																					fontWeight: 500,
																					px: 2,
																					py: 0.5,
																					minWidth: 'auto'
																				}}
																			>
																				View Details
																			</Button>
																		</TableCell>
																	</TableRow>
																);
															}))}
														</TableBody>
													</Table>
												</TableContainer>
											</Box>
										)}
									</div>
								))}
							</Box>
						)}

						{testCases.length === 0 && (
							<Paper
								elevation={1}
								sx={{
									textAlign: 'center',
									py: 6,
									px: 3,
									backgroundColor: 'rgba(0, 0, 0, 0.02)',
									borderRadius: 2
								}}
							>
								<Typography
									variant="h6"
									color="text.secondary"
									sx={{ mb: 1, fontWeight: 500 }}
								>
									No Test Results
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ fontStyle: 'italic' }}
								>
									No test case runs found for this record.
								</Typography>
							</Paper>
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

			{/* Individual Run Detail Dialog */}
			<TestCaseRunDetailDialog
				open={runDetailOpen}
				onClose={handleCloseRunDetail}
				runDetail={runDetail}
				loading={runDetailLoading}
				error={runDetailError}
			/>
		</Dialog>
	);
};

export default TestCaseRunRecordDetailDialog;
