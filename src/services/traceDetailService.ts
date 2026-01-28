import { api } from '@/utils/api';
export interface CreateTestCaseFromTraceParams {
	traceId: string;
	[key: string]: any;
}

export interface CreateTestCaseFromTraceResponse {
	success: boolean;
	error?: string;
	result?: any;
}

export async function createTestCaseFromTrace(
	params: CreateTestCaseFromTraceParams
): Promise<CreateTestCaseFromTraceResponse> {
	const res = (await api
		.post('testcases/fromtrace', {
			json: params
		})
		.json()) as CreateTestCaseFromTraceResponse;
	return res;
}

export interface TraceDetailParams {
	id: string;
}

export interface TraceDetailResponse {
	id: string;
	timestamp: string;
	name: string;
	observations: any[];
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
	const res = (await api.get(`traces/detail/${id}`).json()) as {
		success: boolean;
		error?: string;
		result: TraceDetailResponse;
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch trace detail');

	return res.result;
}
