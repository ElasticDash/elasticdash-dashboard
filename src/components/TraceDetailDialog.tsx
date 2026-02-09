import {
	Dialog,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	DialogContent,
	CircularProgress,
	List,
	ListItem,
	ListItemButton,
	Box,
	Chip
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './tiptap/tiptap-icons/close-icon';
import { fetchTraceDetail } from '@/services/traceService';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Divider as MuiDivider } from '@mui/material';
import { prettifyJSON } from '@/utils/prettifyJSON';

interface TraceDetailDialogProps {
	open: boolean;
	onClose: () => void;
	traceId: string | null;
}

const TraceDetailDialog: React.FC<TraceDetailDialogProps> = ({ open, onClose, traceId }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [testCaseError, setTestCaseError] = useState<string | null>(null);
	const [testCaseSuccess, setTestCaseSuccess] = useState<string | null>(null);
	const [selectedObservation, setSelectedObservation] = useState<any | null>(null);
	const [observations, setObservations] = useState<any[]>([]);

	// Fetch trace detail when dialog opens and traceId changes
	useEffect(() => {
		if (open && traceId) {
			setLoading(true);
			setError(null);
			setTestCaseError(null);
			setTestCaseSuccess(null);
			setSelectedObservation(null);
			setObservations([]);
			fetchTraceDetail({ id: traceId })
				.then((res: any) => {
					console.log('Fetched trace detail:', res);
					console.log('traceDetail?.observations: ', res.observations);

					const observationsFetched =
						res.observations.map((o) => ({
							...o,
							metadata: o.metadata
								? {
										...o.metadata,
										attributes: o.metadata.attributes ? JSON.parse(o.metadata.attributes) : {},
										resourceAttributes: o.metadata.resourceAttributes
											? JSON.parse(o.metadata.resourceAttributes)
											: {},
										scope: o.metadata.scope ? JSON.parse(o.metadata.scope) : {}
									}
								: null
						})) || [];

					console.log('Processed observations:', observationsFetched);

					// Auto-select first observation
					if (observationsFetched && observationsFetched.length > 0) {
						setSelectedObservation(observationsFetched[0]);
					}

					setObservations(observationsFetched);
				})
				.catch((err: any) => {
					setError(err.message || 'Failed to fetch trace detail');
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [open, traceId]);

	// Reset state when dialog is closed
	useEffect(() => {
		if (!open) {
			setError(null);
			setLoading(false);
			setTestCaseError(null);
			setTestCaseSuccess(null);
			setSelectedObservation(null);
		}
	}, [open]);

	useEffect(() => {
		console.log('selectedObservation: ', selectedObservation);
	}, [selectedObservation]);

	useEffect(() => {
		console.log('observations: ', observations);
	}, [observations]);

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
						Trace Detail: {traceId}
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
					<div
						className="flex items-center justify-center py-8"
						style={{ width: '100%' }}
					>
						<CircularProgress />
					</div>
				)}

				{error && (
					<div
						className="text-red-500"
						style={{ padding: 16 }}
					>
						{error}
					</div>
				)}

				{!loading && !error && (
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
							{observations.length === 0 ? (
								<Typography sx={{ p: 2, color: 'text.secondary' }}>
									No AI calls found for this trace.
								</Typography>
							) : (
								<List sx={{ p: 0 }}>
									{observations.map((observation: any, index: number) => (
										<ListItem
											disablePadding
											key={index}
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
													color={selectedObservation === observation ? 'primary' : 'disabled'}
												/>
												{index < observations.length - 1 && (
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
												selected={selectedObservation === observation}
												onClick={() => setSelectedObservation(observation)}
												sx={{ pl: 1, alignItems: 'flex-start' }}
											>
												<Box sx={{ width: '100%' }}>
													<div className="flex w-full items-center justify-between">
														<Typography
															variant="body2"
															fontWeight={600}
														>
															AI Call #{index + 1}
														</Typography>
														<Chip
															label={
																observation.metadata?.attributes[
																	'elasticdash.observation.model.name'
																] || 'Unknown Model'
															}
														/>
													</div>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														{observation.name || 'Unnamed'}
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
							{selectedObservation ? (
								<>
									<Typography
										variant="h6"
										gutterBottom
									>
										Input
									</Typography>

									{prettifyJSON(selectedObservation.input)}

									<Typography
										variant="h6"
										gutterBottom
									>
										Output
									</Typography>
									{prettifyJSON(selectedObservation.output)}

									{testCaseError && <div className="mt-2 text-xs text-red-500">{testCaseError}</div>}
									{testCaseSuccess && (
										<div className="mt-2 text-xs text-green-600">{testCaseSuccess}</div>
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

export default TraceDetailDialog;
