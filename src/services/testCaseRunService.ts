import { api } from '@/utils/api';

export interface CreateTestCaseRunParams {
	testCaseId: number;
	created_by?: number;
}

export interface TestCaseRun {
	id: number;
	testCaseId: number;
	testCaseName?: string;
	status: string;
	startedAt: string;
	completedAt: string | null;
	createdBy?: number;
	updatedBy?: number;
}

export interface TestCaseRunListResponse {
	data: TestCaseRun[];
}

export interface AiCallRun {
	id: number;
	stepOrder: number;
	aiModel: string;
	apiEndpoint: string;
	input: any;
	expectedOutput: string;
	outputMatchType: string;
	runInput: any;
	runOutput: any;
	validationScore: number;
	runStatus: string;
	runStartedAt: string;
	runCompletedAt: string;
}

export interface TestCaseRunDetail {
	run: TestCaseRun;
	aiCalls: AiCallRun[];
}

export async function createTestCaseRun(params: CreateTestCaseRunParams): Promise<TestCaseRun> {
	const { testCaseId, createdBy } = params;
	const res = (await api
		.post(`testcases/run/${testCaseId}`, {
			json: { createdBy }
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

/**
 * Run a test case by ID
 * @param id - test case id
 * @returns Promise<any>
 */
export async function runTestCase(id: number): Promise<any> {
	const res = await api.post('testcases/run', { json: { id } }).json();

	if (!res.success) throw new Error(res.error || 'Failed to run test case');

	return res.result;
}
