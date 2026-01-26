import { api } from '@/utils/api';

export interface CreateTestCaseRunParams {
	testCaseId: number;
	created_by?: number;
}

export interface TestCaseRun {
	id: number;
	test_case_id: number;
	test_case_name?: string;
	status: string;
	started_at: string;
	completed_at: string | null;
	created_by?: number;
	updated_by?: number;
}

export interface TestCaseRunListResponse {
	data: TestCaseRun[];
}

export interface AiCallRun {
	id: number;
	step_order: number;
	ai_model: string;
	api_endpoint: string;
	input: any;
	expected_output: string;
	output_match_type: string;
	run_input: any;
	run_output: any;
	validation_score: number;
	run_status: string;
	run_started_at: string;
	run_completed_at: string;
}

export interface TestCaseRunDetail {
	run: TestCaseRun;
	aiCalls: AiCallRun[];
}

export async function createTestCaseRun(params: CreateTestCaseRunParams): Promise<TestCaseRun> {
	const { testCaseId, created_by } = params;
	const res = (await api
		.post(`testcases/run/${testCaseId}`, {
			json: { created_by }
		})
		.json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRun;
	};

	if (!res.success) throw new Error(res.error || 'Failed to create test case run');

	return res.result;
}

export async function fetchTestCaseRuns(): Promise<TestCaseRun[]> {
	const res = (await api.get('testcases/runs').json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRun[];
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case runs');

	return res.result;
}

export async function fetchTestCaseRunDetail(runId: number): Promise<TestCaseRunDetail> {
	const res = (await api.get(`testcases/runs/${runId}`).json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRunDetail;
	};

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case run detail');

	return res.result;
}
