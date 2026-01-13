export async function withdrawFeedback(id: number) {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + `/user/feedback/withdraw/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		},
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to withdraw feedback');
	}
	return res.json();
}
// src/app/(control-panel)/apps/tickets/api.ts

export async function getAllFeedbacks() {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/user/feedbacks/all', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to fetch feedbacks');
	}

	return res.json();
}

export async function getUnhelpfulFeedbacks() {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/user/feedbacks/unhelpful', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to fetch tickets');
	}

	return res.json();
}

export async function getFeedbackDetail(id: number) {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + `/user/feedback/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to fetch feedback detail');
	}

	return res.json();
}
