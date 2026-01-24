const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

/**
 * Send chat completion (user message or approval)
 * @param body - { messages: Array<{type: string, content: string}>, conversationId?: number, isApproval: boolean }
 * @param token - Authorization bearer token
 * @returns Promise<any>
 */
export async function sendChatCompletion(body: any, token: string) {
	const url = `${API_BASE_URL}/chat/completion`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) throw new Error('Failed to send chat completion');

	return res.json();
}

/**
 * Send chat completion (user message or approval)
 * @param body - { messages: Array<{role: string, content: string}>, conversationId?: number, isApproval: boolean }
 * @param token - Authorization bearer token
 * @returns Promise<any>
 */
export async function sendChatCompletionDuplicated(body: any, token: string) {
	const url = `${API_BASE_URL}/chat/duplicated`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) throw new Error('Failed to send chat duplicated');

	return res.json();
}

/**
 * Fetch list of conversations
 * @returns Promise<{conversations: Array<{id: number, updated_at: string, ...}>}>
 */
export async function fetchConversations() {
	const url = `${API_BASE_URL}/chat/conversations`;
	const token = localStorage.getItem('token') || '';
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) throw new Error('Failed to fetch conversations');

	return res.json();
}

/**
 * Fetch messages by conversationId and firstMessageId
 * @param conversationId - The conversation ID (number)
 * @param firstMessageId - The earliest message ID to start fetching from (default: 0 for latest messages)
 * @returns Promise<{messages: Array<{id: number, role: string, content: string, ...}>}>
 */
export async function fetchConversationMessages(conversationId: number, firstMessageId = 0) {
	const url = `${API_BASE_URL}/chat/conversation/${conversationId}/${firstMessageId}`;
	const token = localStorage.getItem('token') || '';
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) throw new Error('Failed to fetch conversation messages');

	return res.json();
}
