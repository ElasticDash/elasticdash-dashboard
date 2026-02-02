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

export interface SessionDetailParams {
	sessionId: string;
}

export interface SessionTrace {
	id: string;
	timestamp: string;
	name: string;
	user_id: string | null;
	metadata: Record<string, any>;
	release: string | null;
	version: string | null;
	project_id: string;
	environment: string;
	public: boolean;
	bookmarked: boolean;
	tags: string[];
	input: string | null;
	output: string | null;
	session_id: string | null;
	created_at: string;
	updated_at: string;
	event_ts: string;
	is_deleted: number;
}

export interface SessionDetailResponse {
	data: SessionTrace[];
	meta: any[];
	rows: number;
	statistics: Record<string, any>;
}

export async function fetchSessions(params: SessionListParams): Promise<SessionListResponse> {
	// Always use { limit, offset, filter } as input
	const { limit, offset, filter } = params;
	const res = (await api.post('traces/sessions/list', { json: { limit, offset, filter } }).json()) as {
		success: boolean;
		error?: string;
		result: {
			data?: {
				data?: any[];
			};
			total?: number;
			limit?: number;
			offset?: number;
		};
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch sessions');

	console.log('fetchSessions response:', res);

	const dataArray = res.result?.data?.data || [];
	return {
		data: (dataArray || []).map((row: any) => ({
			session_id: row.session_id,
			count: row.count ? Number(row.count) : 0
		})),
		total: res.result?.total || 0,
		limit: res.result?.limit || limit,
		offset: res.result?.offset || offset
	};
}

export async function fetchSessionDetail({ sessionId }: SessionDetailParams): Promise<SessionDetailResponse> {
	const res = (await api.get(`traces/sessions/${sessionId}`).json()) as {
		success: boolean;
		error?: string;
		result: SessionDetailResponse;
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch session detail');

	return res.result;
}
