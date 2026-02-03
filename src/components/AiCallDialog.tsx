'use client';
import React, { useEffect, useState } from 'react';
import {
	Dialog,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	DialogContent,
	List,
	ListItem,
	ListItemButton,
	Box,
	Button
} from '@mui/material';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';
import { prettifyJSON } from '@/utils/prettifyJSON';
import { resetTestCase } from '@/services/testCaseService';

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
	testCaseId?: number;
	rerun?: any;
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls, testCaseId, rerun }) => {
	const [selectedCall, setSelectedCall] = useState<any | null>(null);
	const [showRerun, setShowRerun] = useState<boolean>(false);
	const [rerunning, setRerunning] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	// Auto-select first AI call when dialog opens
	useEffect(() => {
		if (open && aiCalls && aiCalls.length > 0) {
			setSelectedCall(aiCalls[0]);
		}
	}, [open, aiCalls]);

	useEffect(() => {
		if (rerun && showRerun && rerun.aiCalls && rerun.aiCalls.length > 0) {
			setSelectedCall(rerun.aiCalls[0]);
		} else if (!showRerun && aiCalls && aiCalls.length > 0) {
			setSelectedCall(aiCalls[0]);
		}
	}, [showRerun]);

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedCall(null);
			setShowRerun(false);
		}
	}, [open]);

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

	const handleRerun = async () => {
		if (!testCaseId) return;

		setRerunning(true);
		setAlertMessage(null);
		try {
			// Call resetTestCase without testCaseRunRecordId (pass undefined or 0)
			await resetTestCase(testCaseId, -1);
			setAlertMessage('Test case rerun has started. Please come back later to check the results.');
		} catch (err: any) {
			console.error('Failed to rerun test case:', err);
			setAlertMessage(err.message || 'Failed to rerun test case');
		} finally {
			setRerunning(false);
		}
	};

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
						AI Calls
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
				<Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
					{/* Leftmost sidebar - Drafts list */}
					{testCaseId && rerun && (
						<Box
							sx={{
								width: 240,
								borderRight: '1px solid',
								borderColor: 'divider',
								overflowY: 'auto',
								bgcolor: 'background.default'
							}}
						>
							<List sx={{ p: 0 }}>
								<React.Fragment>
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
												color={!showRerun ? 'primary' : 'disabled'}
											/>
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
										</Box>
										<ListItemButton
											selected={!showRerun}
											onClick={() => setShowRerun(false)}
											sx={{
												pl: 1,
												alignItems: 'flex-start',
												flexDirection: 'column'
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
														Original Test Case
													</Typography>
												</Box>
											</Box>
										</ListItemButton>
									</ListItem>
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
												color={showRerun ? 'primary' : 'disabled'}
											/>
										</Box>
										<ListItemButton
											selected={showRerun}
											onClick={() => setShowRerun(true)}
											sx={{
												pl: 1,
												alignItems: 'flex-start',
												flexDirection: 'column'
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
														Rerun Result
													</Typography>
												</Box>
											</Box>
										</ListItemButton>
									</ListItem>
								</React.Fragment>
							</List>
						</Box>
					)}

					{/* Middle sidebar - AI Calls list */}
					<Box
						sx={{
							width: 300,
							borderRight: '1px solid',
							borderColor: 'divider',
							display: 'flex',
							flexDirection: 'column',
							bgcolor: 'background.default'
						}}
					>
						<Box sx={{ flex: 1, overflowY: 'auto' }}>
							{showRerun && rerun ? (
								<List sx={{ p: 0 }}>
									{(rerun.aiCalls || []).map((call: any, index: number) => (
										<ListItem
											disablePadding
											key={call.id || index}
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
													color={selectedCall === call ? 'primary' : 'disabled'}
												/>
												{index < (rerun.aiCalls || []).length - 1 && (
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
												selected={selectedCall === call}
												onClick={() => setSelectedCall(call)}
												sx={{ pl: 1, alignItems: 'flex-start' }}
											>
												<Box sx={{ width: '100%' }}>
													<Typography
														variant="body2"
														fontWeight={600}
													>
														AI Call #{call.stepOrder ?? index + 1}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														ID: {call.id}
													</Typography>
												</Box>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							) : aiCalls.length === 0 ? (
								<Typography sx={{ p: 2, color: 'text.secondary' }}>No AI calls found.</Typography>
							) : (
								<List sx={{ p: 0 }}>
									{aiCalls.map((call: any, index: number) => (
										<ListItem
											disablePadding
											key={call.id || index}
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
													color={selectedCall === call ? 'primary' : 'disabled'}
												/>
												{index < aiCalls.length - 1 && (
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
												selected={selectedCall === call}
												onClick={() => setSelectedCall(call)}
												sx={{ pl: 1, alignItems: 'flex-start' }}
											>
												<Box sx={{ width: '100%' }}>
													<Typography
														variant="body2"
														fontWeight={600}
													>
														AI Call #{call.stepOrder ?? index + 1}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														ID: {call.id}
													</Typography>
												</Box>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							)}
						</Box>

						{/* Footer with Rerun button */}
						{testCaseId && (
							<Box
								sx={{
									p: 2,
									borderTop: '1px solid',
									borderColor: 'divider',
									bgcolor: 'background.paper'
								}}
							>
								{alertMessage && (
									<Typography
										variant="body2"
										color={
											alertMessage.includes('success') || alertMessage.includes('started')
												? 'success.main'
												: 'error.main'
										}
										sx={{ mb: 1 }}
									>
										{alertMessage}
									</Typography>
								)}
								<Button
									variant="outlined"
									color="secondary"
									onClick={handleRerun}
									disabled={rerunning}
									fullWidth
								>
									{rerunning ? 'Rerunning...' : 'Rerun Test Case'}
								</Button>
							</Box>
						)}
					</Box>

					{/* Right content - AI Call details */}
					<Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
						{selectedCall ? (
							<>
								<Typography
									variant="h6"
									gutterBottom
								>
									Input
								</Typography>
								{prettifyJSON(selectedCall.input)}

								<Typography
									variant="h6"
									gutterBottom
								>
									Output
								</Typography>
								{prettifyJSON(selectedCall.expectedOutput ?? selectedCall.output)}
							</>
						) : (
							<Typography color="text.secondary">
								Select an AI call from the list to view details
							</Typography>
						)}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default AiCallDialog;
