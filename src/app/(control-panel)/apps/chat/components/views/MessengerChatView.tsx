'use client';
import { lighten, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
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
import PlanReviewPanel from './PlanReviewPanel';
import { fetchConversations, fetchConversationMessages } from '@/services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type ChatMessage = {
	id: number;
	role: 'user' | 'agent';
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

	function onMessageSubmit(ev: React.FormEvent<HTMLFormElement>) {
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
			sendMessage(message);
		}

		setMessage('');
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
						className="flex flex-1 flex-col overflow-y-auto"
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
								{messages.map((item, i) => {
									const isReceived = item.role != 'user';
									return (
										<StyledMessageRow
											key={item.id ?? i}
											className={clsx(
												'relative flex shrink-0 grow-0 flex-col items-start justify-end px-4 pb-1',
												isReceived ? 'contact' : 'me',
												{ 'first-of-group': isFirstMessageOfGroup(item, i) },
												{ 'last-of-group': isLastMessageOfGroup(item, i) },
												i + 1 === messages.length && 'pb-18'
											)}
										>
											<div className="bubble relative flex max-w-full items-center justify-center px-3 py-2">
												<Typography className="text-md whitespace-pre-wrap">
													<ReactMarkdown remarkPlugins={[remarkGfm]}>
														{typeof item.content === 'string'
															? item.content
															: JSON.stringify(item.content)}
													</ReactMarkdown>
												</Typography>
												{item.time && (
													<Typography
														className="time absolute bottom-0 -mb-5 hidden w-full text-sm whitespace-nowrap ltr:left-0 rtl:right-0"
														color="text.secondary"
													>
														{formatDistanceToNow(new Date(item.time), {
															addSuffix: true
														})}
													</Typography>
												)}
											</div>
											{isReceived && (
												<div
													style={{
														display: 'flex',
														gap: 8,
														marginTop: 8,
														alignSelf: 'flex-start'
													}}
												>
													<IconButton size="small">
														<FuseSvgIcon>lucide:thumbs-up</FuseSvgIcon>
													</IconButton>
													<IconButton
														size="small"
														onClick={() => setFeedbackOpen(true)}
													>
														<FuseSvgIcon>lucide:thumbs-down</FuseSvgIcon>
													</IconButton>
												</div>
											)}
										</StyledMessageRow>
									);
								})}
							</div>
						)}
					</div>

					{/* Plan Approval Panel: show only if a plan is pending */}
					{pendingPlan && (
						<PlanReviewPanel
							plan={pendingPlan}
							onApprove={approvePlan}
							onReject={rejectPlan}
							isProcessing={isProcessing}
						/>
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
								onClick={() => {
									setFeedbackOpen(false);
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
