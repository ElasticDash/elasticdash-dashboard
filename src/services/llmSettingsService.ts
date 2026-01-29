import axios from 'axios';

export async function fetchLlmConfig() {
	const res = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/llm', {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.data) throw new Error('No response data');

	return res.data;
}

export async function updateLlmConfig(config: { llmProviderId: number; llmToken: string }) {
	const res = await axios.put(process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/llm', config, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.data) throw new Error('No response data');

	return res.data;
}
