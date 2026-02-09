import axios from 'axios';

export async function fetchLlmConfig() {
	const url = process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/llm';
	const res = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.data) throw new Error('No response data');

	return res.data;
}

export async function updateLlmConfig(config: { llmProviderId: number; llmToken: string }) {
	const url = process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/llm';
	const res = await axios.put(url, config, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.data) throw new Error('No response data');

	return res.data;
}
