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

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls }) => {
	const [selectedCall, setSelectedCall] = useState<any | null>(null);

	// Helper function to prettify JSON content
	const prettifyJSON = (content: any): string => {
		if (content === null || content === undefined) {
			return '';
		}

		// If it's already a string, try to parse and re-stringify it
		if (typeof content === 'string') {
			try {
				const parsed = JSON.parse(content);
				return JSON.stringify(parsed, null, 2);
			} catch {
				// If parsing fails, return the original string
				return content;
			}
		}

		// If it's an object, stringify it with formatting
		try {
			return JSON.stringify(content, null, 2);
		} catch {
			return String(content);
		}
	};

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
							<Typography sx={{ p: 2, color: 'text.secondary' }}>
								No AI calls found.
							</Typography>
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
									{prettifyJSON(selectedCall.input)}
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
										fontSize: '14px'
									}}
								>
									{prettifyJSON(selectedCall.expectedOutput ?? selectedCall.output)}
								</pre>
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
