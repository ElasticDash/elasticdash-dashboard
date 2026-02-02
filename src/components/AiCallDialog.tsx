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
	Box
} from '@mui/material';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';
import { prettifyJSON } from '@/utils/prettifyJSON';

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls }) => {
	const [selectedCall, setSelectedCall] = useState<any | null>(null);

	// Auto-select first AI call when dialog opens
	useEffect(() => {
		if (open && aiCalls && aiCalls.length > 0) {
			setSelectedCall(aiCalls[0]);
		}
	}, [open, aiCalls]);

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedCall(null);
		}
	}, [open]);

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
					{/* Left sidebar - AI Calls list */}
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
