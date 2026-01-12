import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export async function login({
	username,
	password,
	rememberme
}: {
	username: string;
	password: string;
	rememberme: boolean;
}) {
	const res = await fetch(`${API_BASE_URL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password, rememberme })
	});
	const data = await res.json();

	if (data.success && data.result) {
		localStorage.setItem('token', data.result.token);
		localStorage.setItem('currentUser', JSON.stringify(data.result.user));
		return data.result;
	} else {
		throw new Error(data.message || 'Login failed');
	}
}

export function useLogin() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin(username: string, password: string, rememberme: boolean) {
		setLoading(true);
		setError(null);
		try {
			await login({ username, password, rememberme });
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message);
			setLoading(false);
			return false;
		}
	}

	return { handleLogin, loading, error };
}
