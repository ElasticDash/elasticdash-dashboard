import { api } from '@/utils/api';

export interface SessionListParams {
	limit: number;
	offset: number;
	filter: any;
}

export interface SessionListItem {
	session_id: string;
	count: number;
}

export interface SessionListResponse {
	data: SessionListItem[];
	total: number;
	limit: number;
	offset: number;
}

export async function fetchSessions(params: SessionListParams): Promise<SessionListResponse> {
	// Always use { limit, offset, filter } as input
	const { limit, offset, filter } = params;
	const res = await api.post('traces/sessions/list', { json: { limit, offset, filter } }).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch sessions');

    console.log('fetchSessions response:', res);

	const result = res.result?.data?.data || {};
	return {
		data: (result || []).map((row: any) => ({
			session_id: row.session_id,
			count: row.count ? Number(row.count) : 0
		})),
		total: result.total || 0,
		limit: result.limit || limit,
		offset: result.offset || offset
	};
}
