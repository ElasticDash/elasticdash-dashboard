import axios from 'axios';
import { api } from '@/utils/api';

export interface FetchTestCasesPagedParams {
	limit: number;
	offset: number;
	filter?: string;
	search?: string;
}

export interface ListTestCasesPagedResponse {
	success: boolean;
	result: {
		testCases: TestCase[];
		total: number;
	};
	error?: string;
}

export interface TestCase {
	id: number;
	name: string;
	description: string;
	count: number;
	deleted: boolean;
	createdAt: string;
	createdBy: number;
	updatedAt: string;
	updatedBy: number;
}

export interface ListTestCasesResponse {
	success: boolean;
	result: TestCase[];
	error?: string;
}

export interface TestCaseDetailResponse {
	success: boolean;
	error?: string;
	result: TestCaseDetailData;
}

export interface TestCaseDetailData {
	testCase: TestCase;
	aiCalls: any[];
}

/**
 * Test Case Run Record - represents a batch execution of test cases
 */
export interface TestCaseRunRecord {
	id: number;
	testCaseIds: number[];
	times: number;
	status: 'pending' | 'running' | 'completed' | 'suspicious';
	totalRuns: number;
	successfulRuns: number;
	failedRuns: number;
	pendingRuns: number;
	runningRuns: number;
	totalAiCalls?: number;
	successfulAiCalls?: number;
	failedAiCalls?: number;
	pendingAiCalls?: number;
	runningAiCalls?: number;
	createdAt: string;
	startedAt: string;
	completedAt: string | null;
	createdBy?: number;
	updatedBy?: number;
}

/**
 * Individual test case run within a run record
 */
export interface TestCaseRunInRecord {
	id: number;
	testCaseId: number;
	testCaseName: string;
	status: 'pending' | 'running' | 'success' | 'failed';
	promptDriftDetected?: boolean;
	startedAt: string;
	completedAt: string | null;
	createdAt: string;
	isRerun?: boolean;
}

/**
 * Detailed view of a test case run record with all associated runs
 */
export interface TestCaseRunRecordDetail {
	record: {
		id: number;
		test_case_ids: number[];
		times: number;
		status: 'pending' | 'running' | 'completed' | 'suspicious';
		created_at: string;
		started_at: string;
		completed_at: string | null;
		created_by?: number;
		updated_by?: number;
	};
	runs: TestCaseRunInRecord[];
	summary: {
		total: number;
		pending: number;
		running: number;
		success: number;
		failed: number;
	};
}

/**
 * Parameters for creating a test case run record
 */
export interface CreateTestCaseRunRecordParams {
	testCaseIds: number[];
	times?: number; // defaults to 1, must be 1-100
}

export interface CreateTestCaseRunParams {
	testCaseId: number;
	createdBy?: number;
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
	promptDriftDetected?: boolean;
	failureReason?: string;
	runStartedAt: string;
	runCompletedAt: string;
}

export interface TestCaseRunDetail {
	run: TestCaseRun;
	runs?: TestCaseRun[];
	aiCalls: AiCallRun[];
}

export async function fetchTestCasesPaged(
	params: FetchTestCasesPagedParams
): Promise<{ testCases: TestCase[]; total: number }> {
	const res = await axios.post(
		process.env.NEXT_PUBLIC_BASE_URL + '/testcases/list',
		{
			limit: params.limit,
			offset: params.offset,
			filter: params.filter || '',
			search: params.search || ''
		},
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token') || ''}`
			}
		}
	);
	const data: ListTestCasesPagedResponse = res.data;

	if (!data.success) throw new Error(data.error || 'Failed to fetch test cases');

	return data.result;
}

export async function fetchTestCases(): Promise<TestCase[]> {
	const res: ListTestCasesResponse = await api.get('testcases/list').json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test cases');

	return res.result;
}

/**
 * Fetch test case detail and AI calls for a given test case ID
 * @param id - test case id
 * @returns Promise<{ testCase: TestCase, aiCalls: any[] }>
 */
export async function fetchTestCaseDetailWithAiCalls(id: number): Promise<{ testCase: TestCase; aiCalls: any[] }> {
	const res: any = await api.get(`testcases/detail/${id}`).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case detail');

	return res.result;
}

export async function humanApproveTestCaseRunAICall(testCaseRunAICallId: number, approved: boolean): Promise<any> {
	const res: any = await api
		.put(`testcases/runrecords/aicall/approve`, {
			json: { testCaseRunAICallId, approved }
		})
		.json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case detail');

	return res.result;
}

export async function fetchTestCaseDetail(id: number): Promise<TestCaseDetailData> {
	const res: TestCaseDetailResponse = await api.get(`testcases/${id}`).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case detail');

	return res.result;
}

export async function updateTestCase(id: number, data: Partial<TestCase>) {
	const res = (await api.put(`testcases/edit/${id}`, { json: data }).json()) as {
		success: boolean;
		error?: string;
		result: any;
	};

	if (!res.success) throw new Error(res.error || 'Failed to update test case');

	return res.result;
}

export async function deleteTestCase(id: number) {
	const res = (await api.delete(`testcases/delete/${id}`).json()) as {
		success: boolean;
		error?: string;
		result: any;
	};

	if (!res.success) throw new Error(res.error || 'Failed to delete test case');

	return res.result;
}

/**
 * Accept a rerun for a test case run record
 * @param testCaseRunId - The ID of the test case run to accept
 * @returns Promise<any>
 */
export async function acceptTestCaseRerun(testCaseRunId: number): Promise<any> {
	const res: any = await api
		.post('testcases/rerun/accept', {
			json: { testCaseRunId }
		})
		.json();

	if (!res.success) throw new Error(res.error || 'Failed to accept test case rerun');

	return res.result;
}


export async function resetTestCase(testCaseId: number, testCaseRunRecordId: number): Promise<any> {
	if (!testCaseId) return;

	const token = localStorage.getItem('token') || '';
	const res = await axios.post(
		process.env.NEXT_PUBLIC_BASE_URL + `/testcases/reset`,
		{
			testCaseId,
			testCaseRunRecordId
		},
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	return res.data;
}

/**
 * Create a test case run record (batch execution)
 * @param params - testCaseIds: array of test case IDs, times: number of runs per test case (1-100)
 * @returns Promise<TestCaseRunRecord>
 */
export async function createTestCaseRunRecord(params: CreateTestCaseRunRecordParams): Promise<TestCaseRunRecord> {
	const { testCaseIds, times = 1 } = params;

	// Frontend validation
	if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
		throw new Error('test_case_ids must be a non-empty array');
	}

	if (times < 1) {
		throw new Error('times must be at least 1');
	}

	if (times > 100) {
		throw new Error('times cannot exceed 100');
	}

	const res = (await api
		.post('testcases/runrecords/create', {
			json: {
				test_case_ids: testCaseIds,
				times
			}
		})
		.json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRunRecord;
	};

	if (!res.success) {
		throw new Error(res.error || 'Failed to create test case run record');
	}

	return res.result;
}

/**
 * Fetch all test case run records
 * @returns Promise<TestCaseRunRecord[]>
 */
export async function fetchTestCaseRunRecords(): Promise<TestCaseRunRecord[]> {
	const res = (await api.get('testcases/runrecords/list').json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRunRecord[];
	};

	if (!res.success) {
		throw new Error(res.error || 'Failed to fetch test case run records');
	}

	console.log('Fetched test case run records:', res);

	return res.result;
}

/**
 * Fetch detailed information for a specific test case run record
 * @param id - run record ID
 * @returns Promise<TestCaseRunRecordDetail>
 */
export async function fetchTestCaseRunRecordDetail(id: number): Promise<TestCaseRunRecordDetail> {
	const res = (await api.get(`testcases/runrecords/detail/${id}`).json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRunRecordDetail;
	};

	if (!res.success) {
		throw new Error(res.error || 'Failed to fetch test case run record detail');
	}

	return res.result;
}

/**
 * Get mock data for testing prompt drift detection
 * Returns a test case run record detail with promptDriftDetected = true
 */
export function getMockPromptDriftData(): TestCaseRunRecordDetail {
	const now = new Date();
	const startTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
	const completedTime = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago

	return {
		record: {
			id: 999,
			test_case_ids: [1],
			times: 1,
			status: 'suspicious',
			created_at: startTime.toISOString(),
			started_at: startTime.toISOString(),
			completed_at: completedTime.toISOString(),
			created_by: 1,
			updated_by: 1
		},
		runs: [
			{
				id: 1001,
				testCaseId: 1,
				testCaseName: 'Test Case with Prompt Drift',
				status: 'success',
				promptDriftDetected: true,
				startedAt: startTime.toISOString(),
				completedAt: completedTime.toISOString(),
				createdAt: startTime.toISOString()
			}
		],
		summary: {
			total: 1,
			pending: 0,
			running: 0,
			success: 1,
			failed: 0
		}
	};
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
	const res: any = await api.post('testcases/run', { json: { id } }).json();

	if (!res.success) throw new Error(res.error || 'Failed to run test case');

	return res.result;
}

/**
 * Get mock test case run detail with AI call that has prompt drift
 */
export function getMockTestCaseRunDetailWithPromptDrift(runId: number): TestCaseRunDetail {
	const now = new Date();
	const startTime = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes ago
	const completedTime = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago

	return {
		run: {
			id: runId,
			testCaseId: 1,
			testCaseName: 'Test Case with Prompt Drift',
			status: 'suspicious',
			startedAt: startTime.toISOString(),
			completedAt: completedTime.toISOString(),
			createdBy: 1,
			updatedBy: 1
		},
		aiCalls: [
			{
				id: 2001,
				stepOrder: 1,
				aiModel: 'gpt-4',
				apiEndpoint: '/api/chat/completions',
				input: { prompt: 'Test prompt', context: 'Test context' },
				expectedOutput: 'Expected response',
				outputMatchType: 'exact',
				runInput: { prompt: 'Test prompt', context: 'Test context' },
				runOutput: { response: 'Actual response' },
				validationScore: 0.95,
				runStatus: 'success',
				promptDriftDetected: true,
				runStartedAt: startTime.toISOString(),
				runCompletedAt: completedTime.toISOString()
			}
		]
	};
}
