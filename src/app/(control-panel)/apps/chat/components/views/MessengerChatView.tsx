'use client';
import { lighten } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import clsx from 'clsx';
import { useEffect, useRef, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import FuseLoading from '@fuse/core/FuseLoading';
import { useChat } from '@/hooks/useChat';
import { fetchConversations, fetchConversationMessages } from '@/services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveSession } from '@/utils/storageUtils';
import { postFeedback } from '@/app/(control-panel)/apps/tickets/api';
import '@/styles/chat-widget.css';
import { getSocket } from '@/services/socketService';

export type ChatMessage = {
	id: number;
	role: 'user' | 'assistant';
	content: string;
	time: string | null;
	messageType: string;
};

type MessengerChatViewProps = {
	className?: string;
};

/**
 * The MessengerChatView.
 */
function MessengerChatView(props: MessengerChatViewProps) {
	const { className } = props;
	// Plan approval chat hook
	const { pendingPlan, isProcessing, sendMessage, inputDisabled, registerHistoryRefetch } = useChat();
	const chatRef = useRef<HTMLDivElement>(null);
	const [message, setMessage] = useState('');
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	const [feedbackWrong, setFeedbackWrong] = useState('');
	const [feedbackExpected, setFeedbackExpected] = useState('');
	const [messages, setMessages] = useState<ChatMessage[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [formDisabled, setFormDisabled] = useState(false);
	const [selectedFeedbackMsgId, setSelectedFeedbackMsgId] = useState<number | null>(null);
	const [fetchLatest, setFetchLatest] = useState(false);

	useEffect(() => {
		console.log('new messages: ', messages);
		if (fetchLatest && messages && messages.length > 0) {
			scrollToBottom();
		}
	}, [messages, fetchLatest]);

	// Chat history fetcher, supports incremental loading and deduplication
	const fetchAndSetMessages = useCallback(async (earliestId = 0, shouldScrollToBottom = true) => {
		setLoading(true);
		try {
			const convRes = await fetchConversations();
			const conversations = convRes.conversations || [];

			if (!Array.isArray(conversations) || conversations.length === 0) {
				setMessages([]);
				setConversationId(null);
				setLoading(false);
				return;
			}

			// Use the latest conversation (ordered by updated_at desc)
			const latestConv = conversations[0];
			setConversationId(latestConv.id);
			saveSession('', String(latestConv.id));
			const msgRes = await fetchConversationMessages(latestConv.id, earliestId);
			const newMsgs = msgRes.messages || [];
			setFetchLatest(earliestId === 0);
			setMessages((prevMsgs) => {
				const array = prevMsgs && Array.isArray(prevMsgs) ? prevMsgs.filter((msg) => msg.id > 0) : []; // Remove temporary messages

				for (const newMsg of newMsgs) {
					if (!array.find((m) => m.id === newMsg.id)) {
						array.push(newMsg);
					}
				}
				return array;
			});
			setLoading(false);

			// Only scroll to bottom if earliestId is 0 (initial load or socket event)
			if (shouldScrollToBottom && earliestId === 0) {
				setTimeout(() => scrollToBottom(), 0);
			}
		} catch (error) {
			setLoading(false);
			setMessages([]);
			setConversationId(null);
			console.error('Failed to load chat:', error);
		}
	}, []);

	// On mount, fetch conversations and latest messages
	useEffect(() => {
		fetchAndSetMessages(0, true);
	}, [fetchAndSetMessages]);

	// Register history refetch callback with useChat
	useEffect(() => {
		if (registerHistoryRefetch) {
			registerHistoryRefetch(() => fetchAndSetMessages(0, true));
		}

		const socket = getSocket();

		if (!socket) return;

		const socketHandler = () => fetchAndSetMessages(0, true);
		socket.on('chat:plan:result', socketHandler);
		socket.on('chat_update', socketHandler);
		return () => {
			socket.off('chat:plan:result', socketHandler);
			socket.off('chat_update', socketHandler);
		};
	}, [registerHistoryRefetch, fetchAndSetMessages]);

	// Remove automatic scroll on every messages update to prevent scroll jumps

	function scrollToBottom() {
		if (!chatRef.current) {
			return;
		}

		chatRef.current.scrollTo({
			top: chatRef.current.scrollHeight
		});
	}

	function onInputChange(ev: React.ChangeEvent<HTMLInputElement>) {
		setMessage(ev.target.value);
	}

	async function onMessageSubmit(ev: React.FormEvent<HTMLFormElement>) {
		ev.preventDefault();

		if (message === '' || formDisabled || inputDisabled) {
			return;
		}

		setFormDisabled(true);
		// Clear input immediately
		setMessages((prev) => [
			...(prev || []),
			{
				id: -Date.now(), // temporary id
				role: 'user',
				content: message,
				time: new Date().toISOString(),
				messageType: 'text'
			}
		]);
		setMessage('');

		if (typeof sendMessage === 'function') {
			try {
				await sendMessage(
					message,
					() => setMessage(''), // clear input
					(disabled) => setFormDisabled(disabled)
				);

				fetchAndSetMessages(0, true);
			} catch (err) {
				setFormDisabled(false);
			}
		} else {
			setFormDisabled(false);
		}
	}

	// Feedback submission logic
	async function handleFeedbackSubmit(
		messageId: number,
		isHelpful: boolean,
		description?: string,
		expectedResponse?: string
	) {
		try {
			await postFeedback({
				messageId,
				conversationId,
				isHelpful,
				description,
				expectedResponse
			});
		} catch (err) {
			// Optionally handle error
		}
	}

	if (loading) {
		return <FuseLoading />;
	}

	return (
		<>
			<Box
				className="w-full border-b-1"
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Toolbar className="flex w-full items-center justify-between px-4">
					<div className="flex items-center gap-2">Chat</div>
				</Toolbar>
			</Box>
			<div className="flex h-full min-h-0 w-full flex-auto">
				<div className={clsx('relative z-10 flex w-full flex-1 flex-col', className)}>
					<div
						ref={chatRef}
						className="chat-container flex flex-1 flex-col overflow-y-auto"
						onScroll={async (e) => {
							const el = e.currentTarget;

							if (el.scrollTop === 0 && hasMore && messages && messages.length > 0 && conversationId) {
								const earliestId = messages[0].id;
								await fetchAndSetMessages(earliestId, false);
								// Optionally update hasMore if needed (not shown here)
							}
						}}
					>
						{messages?.length > 0 && (
							<div className="flex flex-col pt-4 pb-10 md:px-4">
								{messages.map((msg: any, index) => (
									<div
										key={index}
										className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
									>
										<div className="message-content-wrapper">
											<div className="message-content">
												{/* If planJson exists, render plan steps and deliverable */}
												{msg.planJson ? (
													<>
														<div style={{ fontWeight: 600, marginBottom: 8 }}>
															Plan Steps
														</div>
														<div style={{ paddingLeft: 20, margin: 0 }}>
															{Array.isArray(msg.planJson.execution_plan) &&
																msg.planJson.execution_plan.map(
																	(step: any, idx: number) => (
																		<div
																			key={idx}
																			style={{ marginBottom: 4 }}
																		>
																			<span style={{ fontWeight: 500 }}>
																				Step {step.step_number}:
																			</span>
																			{step.api && (
																				<>
																					<pre
																						style={{
																							marginLeft: 6,
																							background: '#f0f4f8',
																							padding: '2px 6px',
																							borderRadius: 6
																						}}
																					>
																						{`Call ${step.api.path} [${step.api.method?.toUpperCase?.() || ''}]`}
																					</pre>
																					<pre>
																						{JSON.stringify(
																							step.api.requestBody,
																							null,
																							2
																						)}
																					</pre>
																				</>
																			)}
																		</div>
																	)
																)}
														</div>
														{msg.planJson.final_deliverable && (
															<div style={{ marginTop: 10 }}>
																<span style={{ fontWeight: 600 }}>
																	Final Deliverable:
																</span>{' '}
																{msg.planJson.final_deliverable}
															</div>
														)}
													</>
												) : (
													<ReactMarkdown remarkPlugins={[remarkGfm]}>
														{typeof msg.content === 'string'
															? msg.content
															: JSON.stringify(msg.content)}
													</ReactMarkdown>
												)}

												{/* Approve/Reject buttons */}
												{msg.planNeedsApproval && index === messages.length - 1 && (
													<div className="mt-3 flex gap-2">
														<button
															onClick={async () => {
																setMessages((prev) => [
																	...(prev || []),
																	{
																		id: -Date.now(), // temporary id
																		role: 'user',
																		content: 'Approved',
																		time: new Date().toISOString(),
																		messageType: 'text'
																	}
																]);
																await sendMessage('approve');
															}}
															disabled={isProcessing}
															className="flex-1 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
														>
															{isProcessing ? 'Processing...' : '✓ Approve'}
														</button>
														<button
															onClick={async () => {
																setMessages((prev) => [
																	...(prev || []),
																	{
																		id: -Date.now(), // temporary id
																		role: 'user',
																		content: 'Rejected',
																		time: new Date().toISOString(),
																		messageType: 'text'
																	}
																]);
																await sendMessage('reject');
															}}
															disabled={isProcessing}
															className="flex-1 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-200 disabled:opacity-50"
														>
															✗ Reject
														</button>
													</div>
												)}

												{/* Feedback buttons */}
												{msg.role === 'assistant' && (
													<div
														style={{
															display: 'flex',
															gap: 8,
															marginTop: 8,
															alignSelf: 'flex-start'
														}}
													>
														<IconButton
															size="small"
															onClick={async () => {
																await handleFeedbackSubmit(msg.id, true);
															}}
														>
															<FuseSvgIcon>lucide:thumbs-up</FuseSvgIcon>
														</IconButton>
														<IconButton
															size="small"
															onClick={() => {
																setFeedbackOpen(true);
																setSelectedFeedbackMsgId(msg.id);
															}}
														>
															<FuseSvgIcon>lucide:thumbs-down</FuseSvgIcon>
														</IconButton>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<Paper
						square
						component="form"
						onSubmit={onMessageSubmit}
						className="left-0 border-t-1 px-4 py-4"
						sx={(theme) => ({
							backgroundColor: lighten(theme.palette.background.default, 0.02),
							...theme.applyStyles('light', {
								backgroundColor: lighten(theme.palette.background.default, 0.4)
							})
						})}
					>
						<div className="relative flex items-center">
							<IconButton type="submit">
								<FuseSvgIcon
									className="text-3xl"
									color="action"
								>
									lucide:smile
								</FuseSvgIcon>
							</IconButton>

							<IconButton type="submit">
								<FuseSvgIcon
									className="text-3xl"
									color="action"
								>
									lucide:paperclip
								</FuseSvgIcon>
							</IconButton>

							<InputBase
								autoFocus={false}
								id="message-input"
								className="mx-2 flex flex-1 shrink-0 grow rounded-lg border-1 px-2"
								placeholder="Type your message"
								onChange={onInputChange}
								value={message}
								sx={{ backgroundColor: 'background.paper' }}
								disabled={formDisabled || inputDisabled}
							/>
							<IconButton
								type="submit"
								disabled={formDisabled || inputDisabled}
							>
								<FuseSvgIcon color="action">lucide:send</FuseSvgIcon>
							</IconButton>
						</div>
					</Paper>

					{/* Feedback Dialog State */}
					{/** Track which message is being given feedback */}
					{/** Add state for selectedFeedbackMsgId */}
					{/* Feedback Dialog */}
					<Dialog
						open={feedbackOpen}
						onClose={() => setFeedbackOpen(false)}
						maxWidth="sm"
						fullWidth
					>
						<DialogTitle>Send Feedback</DialogTitle>
						<DialogContent>
							<TextField
								label="What went wrong"
								multiline
								minRows={3}
								fullWidth
								margin="normal"
								value={feedbackWrong}
								onChange={(e) => setFeedbackWrong(e.target.value)}
							/>
							<TextField
								label="What is expected"
								multiline
								minRows={3}
								fullWidth
								margin="normal"
								value={feedbackExpected}
								onChange={(e) => setFeedbackExpected(e.target.value)}
							/>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={() => setFeedbackOpen(false)}
								color="primary"
							>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									setFeedbackOpen(false);
									await handleFeedbackSubmit(
										selectedFeedbackMsgId,
										false,
										feedbackWrong,
										feedbackExpected
									);
									setFeedbackWrong('');
									setFeedbackExpected('');
								}}
								color="primary"
								variant="contained"
							>
								Submit
							</Button>
						</DialogActions>
					</Dialog>
				</div>
			</div>
		</>
	);
}

export default MessengerChatView;
