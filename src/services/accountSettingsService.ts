import axios from 'axios';

export async function fetchApiBaseUrl() {
	const res = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/apibaseurl', {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.data) throw new Error('No response data');

	return res.data;
}

export async function updateApiBaseUrl(url: string) {
	const res = await axios.put(
		process.env.NEXT_PUBLIC_BASE_URL + '/user/settings/apibaseurl',
		{ url },
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token') || ''}`
			}
		}
	);

	if (!res.data) throw new Error('No response data');

	return res.data;
}
