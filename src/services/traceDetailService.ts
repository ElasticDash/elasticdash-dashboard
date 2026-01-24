import { api } from '@/utils/api';

export interface TraceDetailParams {
	id: string;
}

export interface TraceDetailResponse {
	id: string;
	timestamp: string;
	name: string;
	metadata: Record<string, any>;
	release: string | null;
	version: string | null;
	environment: string;
	public: boolean;
	bookmarked: boolean;
	tags: string[];
	input: string | null;
	output: string | null;
	userId: string | null;
	projectId: string;
	sessionId: string;
	createdAt: string;
	updatedAt: string;
	eventTs: string;
	isDeleted: number;
}

export async function fetchTraceDetail({ id }: TraceDetailParams): Promise<TraceDetailResponse> {
	const res = await api.get(`traces/detail/${id}`).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch trace detail');

	return res.result;
}
