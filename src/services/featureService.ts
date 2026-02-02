// src/services/traceService.ts
import { api } from '@/utils/api';

export async function fetchFeatures(): Promise<any> {
	const res = (await api.get('features/list').json()) as {
		success: boolean;
		error?: string;
		result: any[];
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch features');

	return res.result;
}

export async function updateFeature(id: string, displayedName: string): Promise<any> {
	const res = (await api.put('features/update/' + id, { json: { displayedName } }).json()) as {
		success: boolean;
		error?: string;
		result: any[];
	};

	if (!res.success) throw new Error(res.error || 'Failed to delete feature');

	return res.result;
}

export async function deleteFeature(id: string): Promise<any> {
	const res = (await api.delete('features/delete/' + id).json()) as {
		success: boolean;
		error?: string;
		result: any[];
	};

	if (!res.success) throw new Error(res.error || 'Failed to delete feature');

	return res.result;
}
