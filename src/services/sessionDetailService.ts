import { api } from '@/utils/api';

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

export async function fetchSessionDetail({ sessionId }: SessionDetailParams): Promise<SessionDetailResponse> {
	const res = (await api.get(`traces/sessions/${sessionId}`).json()) as {
		success: boolean;
		error?: string;
		result: SessionDetailResponse;
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch session detail');

	return res.result;
}
