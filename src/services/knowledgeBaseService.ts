import axios from 'axios';

// Update draft API
export async function updateDraftApi(id: number, updates: any, token?: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.put(`${baseUrl}/project/kb/apis/${id}`, updates, {
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		return res.data;
	} catch (err) {
		console.error('updateDraftApi error:', err);
		throw new Error('Failed to update draft API');
	}
}

// Delete draft API
export async function deleteDraftApi(id: number, token?: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.delete(`${baseUrl}/project/kb/apis/${id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('deleteDraftApi error:', err);
		throw new Error('Failed to delete draft API');
	}
}

// Update draft table
export async function updateDraftTable(id: number, updates: any, token?: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.put(`${baseUrl}/project/kb/tables/${id}`, updates, {
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		return res.data;
	} catch (err) {
		console.error('updateDraftTable error:', err);
		throw new Error('Failed to update draft table');
	}
}

// Delete draft table
export async function deleteDraftTable(id: number, token?: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.delete(`${baseUrl}/project/kb/tables/${id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('deleteDraftTable error:', err);
		throw new Error('Failed to delete draft table');
	}
}

// Fetch draft APIs for a project (projectId=0 allowed)
export async function fetchDraftApis(token?: string, projectId = 0) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.get(`${baseUrl}/project/kb/draft/apis?projectId=${projectId}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('fetchDraftApis error:', err);
		throw new Error('Failed to fetch APIs');
	}
}

// Fetch draft tables for a project (projectId=0 allowed)
export async function fetchDraftTables(token?: string, projectId = 0) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.get(`${baseUrl}/project/kb/draft/tables?projectId=${projectId}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('fetchDraftTables error:', err);
		throw new Error('Failed to fetch tables');
	}
}

// Fetch active APIs for a project (projectId=0 allowed)
export async function fetchActiveApis(token?: string, projectId = 0) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.get(`${baseUrl}/project/kb/active/apis?projectId=${projectId}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('fetchActiveApis error:', err);
		throw new Error('Failed to fetch APIs');
	}
}

// Fetch active tables for a project (projectId=0 allowed)
export async function fetchActiveTables(token?: string, projectId = 0) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	try {
		const res = await axios.get(`${baseUrl}/project/kb/active/tables?projectId=${projectId}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		return res.data;
	} catch (err) {
		console.error('fetchActiveTables error:', err);
		throw new Error('Failed to fetch tables');
	}
}
// src/services/knowledgeBaseService.ts

export async function uploadOpenApi({ projectId, file, token }: { projectId: number; file: File; token?: string }) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	const formData = new FormData();
	formData.append('projectId', String(projectId));
	formData.append('openapi', file);

	const body = {
		projectId,
		openapi: file
	};
	try {
		const res = await axios.post(`${baseUrl}/project/kb/upload-openapi`, body, {
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		return res;
	} catch (err) {
		throw new Error('Upload failed');
	}
}

export async function uploadSqlDdl({
	projectId,
	databaseId,
	ddlText,
	token
}: {
	projectId: number;
	databaseId: number;
	ddlText: string;
	token?: string;
}) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	const body = {
		projectId,
		databaseId,
		ddlText
	};
	try {
		const res = await axios.post(`${baseUrl}/project/kb/upload-sql`, body, {
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		return res;
	} catch (err) {
		throw new Error('Upload failed');
	}
}
