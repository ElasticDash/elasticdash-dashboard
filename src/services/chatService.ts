const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

// Send chat completion (user message or approval)
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

// Fetch list of conversations
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

// Fetch messages by conversationId and firstMessageId
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
