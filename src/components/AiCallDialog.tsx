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
	CircularProgress,
	Chip,
	Paper
} from '@mui/material';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';
import { prettifyJSON } from '@/utils/prettifyJSON';
import { TestCaseDraft, fetchTestCaseDrafts } from '@/services/testCaseService';

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
	testCaseId?: number;
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls, testCaseId }) => {
	const [selectedCall, setSelectedCall] = useState<any | null>(null);
	const [drafts, setDrafts] = useState<TestCaseDraft[]>([]);
	const [loadingDrafts, setLoadingDrafts] = useState(false);
	const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);

	// Auto-select first AI call when dialog opens
	useEffect(() => {
		if (open && aiCalls && aiCalls.length > 0) {
			setSelectedCall(aiCalls[0]);
		}
	}, [open, aiCalls]);

	// Fetch drafts when dialog opens and testCaseId is available
	useEffect(() => {
		if (open && testCaseId) {
			loadDrafts();
		} else {
			setDrafts([]);
			setSelectedDraftId(null);
		}
	}, [open, testCaseId]);

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedCall(null);
			setDrafts([]);
			setSelectedDraftId(null);
		}
	}, [open]);

	const loadDrafts = async () => {
		if (!testCaseId) return;

		setLoadingDrafts(true);
		try {
			const result = await fetchTestCaseDrafts({ testCaseId });
			setDrafts(result || []);
		} catch (error) {
			console.error('Failed to fetch drafts:', error);
			setDrafts([]);
		} finally {
			setLoadingDrafts(false);
		}
	};

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
					{testCaseId && drafts.length > 0 && (
						<Box
							sx={{
								width: 280,
								borderRight: '1px solid',
								borderColor: 'divider',
								overflowY: 'auto',
								bgcolor: 'background.default'
							}}
						>
							<Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
								<Typography
									variant="subtitle1"
									sx={{ fontWeight: 600 }}
								>
									Drafts ({drafts.length})
								</Typography>
							</Box>

							{loadingDrafts ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
									<CircularProgress size={24} />
								</Box>
							) : drafts.length > 0 ? (
								<Box sx={{ p: 2 }}>
									{drafts.map((draft) => (
										<Paper
											key={draft.id}
											sx={{
												p: 1.5,
												mb: 1.5,
												cursor: 'pointer',
												border:
													selectedDraftId === draft.id
														? '2px solid #1976d2'
														: '1px solid #e0e0e0',
												'&:hover': {
													backgroundColor: '#f5f5f5'
												}
											}}
											onClick={() => setSelectedDraftId(draft.id)}
										>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600 }}
												>
													Draft #{draft.id}
												</Typography>
												<Chip
													label={draft.status}
													color={getStatusColor(draft.status)}
													size="small"
												/>
											</Box>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{new Date(draft.createdAt).toLocaleString()}
											</Typography>
										</Paper>
									))}
								</Box>
							) : (
								<Box sx={{ p: 2 }}>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										No drafts found
									</Typography>
								</Box>
							)}
						</Box>
					)}

					{/* Middle sidebar - AI Calls list */}
					<Box
						sx={{
							width: 300,
							borderRight: '1px solid',
							borderColor: 'divider',
							overflowY: 'auto',
							bgcolor: 'background.default'
						}}
					>
						{aiCalls.length === 0 ? (
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
