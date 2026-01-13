// src/app/(control-panel)/apps/account-settings/api.ts

export async function updatePassword({ oldPassword, password }: { oldPassword: string; password: string }) {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/user/updatepassword', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		},
		body: JSON.stringify({ oldPassword, password })
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to update password');
	}

	return res.json();
}
