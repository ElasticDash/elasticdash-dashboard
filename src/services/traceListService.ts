// src/services/traceListService.ts
export async function fetchTraces({ limit = 20, offset = 0, filter = '' }) {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/traces/list', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ limit, offset, filter })
	});

	if (!res.ok) throw new Error('Failed to fetch traces');

	return res.json();
}
