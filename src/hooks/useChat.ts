import { useState, useCallback, useEffect, useRef } from 'react';
import { getSocket, joinSessionRoom } from '@/services/socketService';
import { getChatHistory, getSession, saveChatHistory, saveSession } from '@/utils/storageUtils';
import { sendChatCompletion } from '@/services/chatService';

const SOCKET_EVENT = 'chat:plan:result';
const SOCKET_TIMEOUT = 60000; // 60 seconds

export function useChat() {
	const [chatHistory, setChatHistory] = useState<any[]>([]);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [pendingPlan, setPendingPlan] = useState<any>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inputDisabled, setInputDisabled] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	// Callback to trigger history refetch in MessengerChatView
	const historyRefetchCallback = useRef<(() => void) | null>(null);

	// Initialize from localStorage
	useEffect(() => {
		const saved = getSession();
		const history = getChatHistory();

		if (saved.sessionId) setSessionId(saved.sessionId);

		if (saved.conversationId) setConversationId(saved.conversationId);

		if (history.length > 0) setChatHistory(history);
	}, []);

	// Persist to localStorage
	useEffect(() => {
		saveSession(sessionId, conversationId);
		saveChatHistory(chatHistory);
	}, [sessionId, conversationId, chatHistory]);

	// Listen for socket results
	useEffect(() => {
		const socket = getSocket();

		if (!socket) return;

		const handlePlanResult = (payload: any) => {
			const { status, sessionId: resultSessionId, result, error: resultError } = payload;

			if (resultSessionId !== sessionId) return;

			setIsProcessing(false);
			setInputDisabled(false);

			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			if (resultError) {
				setError(resultError);
				setPendingPlan(null);

				// Always trigger history refetch
				if (historyRefetchCallback.current) historyRefetchCallback.current();

				return;
			}

			if (status === 'completed' && result) {
				setChatHistory((prev) => [...prev, { type: 'result', ...result }]);
			}

			setPendingPlan(null);

			// Always trigger history refetch
			if (historyRefetchCallback.current) historyRefetchCallback.current();
		};
		socket.on(SOCKET_EVENT, handlePlanResult);
		return () => {
			socket.off(SOCKET_EVENT, handlePlanResult);
		};
	}, [sessionId]);

	// Send user message and get plan
	const sendMessage = useCallback(
		async (userContent: string, onInputClear?: () => void, onInputDisable?: (disabled: boolean) => void) => {
			if (!userContent.trim()) return;

			setError(null);
			setIsProcessing(true);
			setPendingPlan(null);
			setInputDisabled(true);

			if (onInputDisable) onInputDisable(true);

			if (onInputClear) onInputClear();

			const token = localStorage.getItem('token');

			if (!token) {
				setError('User not authenticated.');
				setIsProcessing(false);
				setInputDisabled(false);

				if (onInputDisable) onInputDisable(false);

				return;
			}

			// Always sync conversationId from localStorage before sending
			const latestSession = getSession();
			const currentConversationId = latestSession.conversationId || conversationId;
			const userMessage = {
				role: 'user',
				content: userContent,
				createdAt: new Date().toISOString()
			};
			setChatHistory((prev) => [...prev, userMessage]);
			const userMessageBody = {
				messages: [{ type: 'user', content: userContent }],
				conversationId: currentConversationId || undefined,
				isApproval: userContent === 'approve' ? true : false
			};
			try {
				// Use chatService for API call
				const data = await sendChatCompletion(userMessageBody, token);

				if (data.plan && data.sessionId) {
					setPendingPlan({ ...data.plan, sessionId: data.sessionId, query: userContent });
					setSessionId(data.sessionId);

					// If conversationId is returned, update it and localStorage
					if (data.conversationId) {
						setConversationId(String(data.conversationId));
						saveSession(data.sessionId, String(data.conversationId));
					}

					joinSessionRoom(data.sessionId);
				} else if (data.error) {
					setError(data.error);
				}
			} catch (err) {
				console.error('Error sending message:', err);
				setError('Failed to send message.');
			} finally {
				setIsProcessing(false);
				setInputDisabled(false);

				if (onInputDisable) onInputDisable(false);
			}
		},
		[conversationId]
	);

	// Approve pending plan
	const approvePlan = useCallback(async () => {
		if (!pendingPlan || !pendingPlan.sessionId) return;

		setError(null);
		setIsProcessing(true);
		try {
			const token = localStorage.getItem('token');

			if (!token) {
				setError('User not authenticated.');
				setIsProcessing(false);
				return;
			}

			const data = await sendChatCompletion(
				{
					isApproval: true,
					sessionId: pendingPlan.sessionId
				},
				token!
			);

			if (data.status === 'processing') {
				// Start timeout fallback
				timeoutRef.current = setTimeout(() => {
					if (isProcessing) {
						setError('Request timeout. Please check backend logs or try again.');
						setIsProcessing(false);
					}
				}, SOCKET_TIMEOUT);
			} else if (data.error) {
				setError(data.error);
				setIsProcessing(false);
			}
		} catch (err) {
			setError('Error approving plan.');
			console.error('Error approving plan:', err);
			setIsProcessing(false);
		}
	}, [pendingPlan, isProcessing]);

	// Reject plan and start over
	const rejectPlan = useCallback(
		async (feedback?: string) => {
			if (!pendingPlan || !pendingPlan.sessionId) return;

			const userMessage = {
				id: `msg-${Date.now()}`,
				type: 'user',
				content: feedback || 'Let me provide feedback on this plan',
				createdAt: new Date().toISOString()
			};
			setChatHistory((prev) => [...prev, userMessage]);
			setPendingPlan(null);
			setIsProcessing(false);
			setError(null);
		},
		[pendingPlan]
	);

	// Allow MessengerChatView to register a callback for history refetch
	const registerHistoryRefetch = (cb: () => void) => {
		historyRefetchCallback.current = cb;
	};

	return {
		chatHistory,
		sessionId,
		conversationId,
		pendingPlan,
		isProcessing,
		error,
		sendMessage,
		approvePlan,
		rejectPlan,
		inputDisabled,
		registerHistoryRefetch
	};
}
