// src/app/(control-panel)/apps/account-settings/dbApi.ts

export async function getDatabaseConnection() {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/user/database-connection', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		}
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to fetch database connection');
	}

	return res.json();
}

export async function updateDatabaseConnection(connectionString: string) {
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/user/database-connection', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
		},
		body: JSON.stringify({ connectionString })
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error?.message || 'Failed to update database connection');
	}

	return res.json();
}
