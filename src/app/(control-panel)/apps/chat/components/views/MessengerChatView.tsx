'use client';
import { lighten, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
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

export type ChatMessage = {
	id: number;
	role: 'user' | 'assistant';
	content: string;
	time: string | null;
	messageType: string;
};

const StyledMessageRow = styled('div')(({ theme }) => ({
	'&.contact': {
		'& .bubble': {
			backgroundColor: lighten(theme.palette.secondary.main, 0.1),
			color: theme.vars.palette.secondary.contrastText,
			borderRadius: 8,
			'& .time': {
				paddingLeft: 12
			}
		},
		'&.last-of-group': {
			'& .bubble': {
				borderBottomLeftRadius: 3
			}
		}
	},
	'&.me': {
		paddingLeft: 36,
		'& .bubble': {
			marginLeft: 'auto',
			backgroundColor: lighten(theme.palette.primary.main, 0.1),
			color: theme.vars.palette.primary.contrastText,
			borderRadius: 8,
			'& .time': {
				justifyContent: 'flex-end',
				right: 0,
				paddingRight: 12
			}
		},
		'&.last-of-group': {
			'& .bubble': {
				borderBottomRightRadius: 3
			}
		}
	},
	'&.contact + .me, &.me + .contact': {
		paddingTop: 8,
		marginTop: 8
	}
}));

type MessengerChatViewProps = {
	className?: string;
};

/**
 * The MessengerChatView.
 */
function MessengerChatView(props: MessengerChatViewProps) {
	const { className } = props;
	// Plan approval chat hook
	const { pendingPlan, isProcessing, approvePlan, rejectPlan, sendMessage } = useChat();
	const chatRef = useRef<HTMLDivElement>(null);
	const [message, setMessage] = useState('');
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	const [feedbackWrong, setFeedbackWrong] = useState('');
	const [feedbackExpected, setFeedbackExpected] = useState('');
	const [messages, setMessages] = useState<ChatMessage[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [hasMore, setHasMore] = useState(true);
	// Add state for selectedFeedbackMsgId
	const [selectedFeedbackMsgId, setSelectedFeedbackMsgId] = useState<number | null>(null);

	// On mount, fetch conversations and latest messages
	useEffect(() => {
		async function loadChat() {
			setLoading(true);
			try {
				const convRes = await fetchConversations();
				const conversations = convRes.conversations || [];

				console.log('conversations: ', conversations);

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
				const msgRes = await fetchConversationMessages(latestConv.id, 0);
				const msgs = msgRes.messages || [];
				console.log('messages: ', msgs);
				setMessages(msgs);

				if (!Array.isArray(conversations) || conversations.length === 0) {
					setMessages([]);
					setConversationId(null);
					setLoading(false);
					return;
				}

				setLoading(false);
			} catch (error) {
				setLoading(false);
				setMessages([]);
				setConversationId(null);
				console.error('Failed to load chat:', error);
			}
		}

		loadChat().catch((error) => {
			setLoading(false);
			setMessages([]);
			setConversationId(null);
			console.error('Failed to load chat:', error);
		});
	}, []);

	useEffect(() => {
		if (messages) {
			setTimeout(scrollToBottom);
		}
	}, [messages]);

	function scrollToBottom() {
		if (!chatRef.current) {
			return;
		}

		chatRef.current.scrollTo({
			top: chatRef.current.scrollHeight,
			behavior: 'smooth'
		});
	}

	function isFirstMessageOfGroup(item: ChatMessage, i: number) {
		return i === 0 || (messages[i - 1] && messages[i - 1].role !== item.role);
	}

	function isLastMessageOfGroup(item: ChatMessage, i: number) {
		return i === messages.length - 1 || (messages[i + 1] && messages[i + 1].role !== item.role);
	}

	function onInputChange(ev: React.ChangeEvent<HTMLInputElement>) {
		setMessage(ev.target.value);
	}

	async function onMessageSubmit(ev: React.FormEvent<HTMLFormElement>) {
		ev.preventDefault();

		if (message === '') {
			return;
		}

		setMessages((prev) => [
			...(prev || []),
			{
				id: Date.now(),
				role: 'user',
				content: message,
				time: new Date().toISOString(),
				messageType: 'text'
			}
		]);

		if (typeof sendMessage === 'function') {
			try {
				await sendMessage(message);

				// After sending, fetch latest messages
				if (conversationId) {
					const msgRes = await fetchConversationMessages(conversationId, 0);
					const msgs = msgRes.messages || [];
					setMessages(msgs);
				}
			} catch (err) {
				// Optionally handle error
			}
		}

		setMessage('');
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
				<div className={clsx('relative z-10 flex flex-1 flex-col', className)}>
					<div
						ref={chatRef}
						className="chat-container flex flex-1 flex-col overflow-y-auto"
						onScroll={async (e) => {
							const el = e.currentTarget;

							if (el.scrollTop === 0 && hasMore && messages && messages.length > 0 && conversationId) {
								// Fetch previous messages using earliest message id
								const earliestId = messages[0].id;
								try {
									const msgRes = await fetchConversationMessages(conversationId, earliestId);
									const prevMsgs = msgRes.messages || [];

									if (prevMsgs.length > 0) {
										setMessages([...prevMsgs, ...messages]);
										setHasMore(prevMsgs.length === 20);
									} else {
										setHasMore(false);
									}
								} catch {
									setHasMore(false);
								}
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
												<ReactMarkdown remarkPlugins={[remarkGfm]}>
													{typeof msg.content === 'string'
														? msg.content
														: JSON.stringify(msg.content)}
												</ReactMarkdown>

												{/* Planning metrics */}
												{msg.role === 'assistant' &&
													(msg.planningDurationMs !== undefined || msg.usedReferencePlan) && (
														<div className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">
															{msg.usedReferencePlan && <div>🪄 Used reference plan</div>}
															{msg.planningDurationMs !== undefined && (
																<div>⏱️ Planning: {msg.planningDurationMs}ms</div>
															)}
														</div>
													)}

												{/* Save Task button */}
												{/* {msg.role === 'assistant' && msg.planSummary && msg.planSummary.steps && msg.planSummary.steps.length > 0 && (
													<div className="mt-3 flex flex-col gap-2">
														<button
															onClick={() => handleSaveTask(msg)}
															disabled={isSavingTask}
															className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
														>
															Save this task
														</button>
													</div>
												)} */}

												{/* Approve/Reject buttons */}
												{msg.awaitingApproval && index === messages.length - 1 && (
													<div className="mt-3 flex gap-2">
														<button
															onClick={() => approvePlan()}
															className="flex-1 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
														>
															✓ Approve
														</button>
														<button
															onClick={() => rejectPlan()}
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

					{/* Render pending plan as a chat message with approve/reject buttons */}
					{pendingPlan && (
						<div className="message assistant">
							<div className="message-content-wrapper">
								<div className="message-content">
									<strong>Plan Approval Required</strong>
									<div style={{ margin: '8px 0' }}>
										<pre
											style={{
												whiteSpace: 'pre-wrap',
												wordBreak: 'break-word',
												background: 'none',
												padding: 0,
												margin: 0,
												fontFamily: 'inherit',
												fontSize: 'inherit'
											}}
										>
											{pendingPlan.description || JSON.stringify(pendingPlan, null, 2)}
										</pre>
									</div>
									<div className="mt-3 flex gap-2">
										<Button
											onClick={approvePlan}
											disabled={isProcessing}
											className="flex-1 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
										>
											{isProcessing ? 'Processing...' : '✓ Approve'}
										</Button>
										<Button
											onClick={rejectPlan}
											disabled={isProcessing}
											className="flex-1 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-200 disabled:opacity-50"
										>
											✗ Reject
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

					{messages && (
						<Paper
							square
							component="form"
							onSubmit={onMessageSubmit}
							className="absolute right-0 bottom-0 left-0 border-t-1 px-4 py-4"
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
								/>
								<IconButton type="submit">
									<FuseSvgIcon color="action">lucide:send</FuseSvgIcon>
								</IconButton>
							</div>
						</Paper>
					)}

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
