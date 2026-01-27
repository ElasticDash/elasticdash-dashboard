import { api } from '@/utils/api';

/**
 * Test Case Run Record - represents a batch execution of test cases
 */
export interface TestCaseRunRecord {
	id: number;
	testCaseIds: number[];
	times: number;
	status: 'pending' | 'running' | 'completed';
	totalRuns: number;
	successfulRuns: number;
	failedRuns: number;
	pendingRuns: number;
	runningRuns: number;
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
	startedAt: string;
	completedAt: string | null;
	createdAt: string;
}

/**
 * Detailed view of a test case run record with all associated runs
 */
export interface TestCaseRunRecordDetail {
	record: {
		id: number;
		test_case_ids: number[];
		times: number;
		status: 'pending' | 'running' | 'completed';
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
	const res = (await api.get(`testcases/runrecords/${id}`).json()) as {
		success: boolean;
		error?: string;
		result: TestCaseRunRecordDetail;
	};

	if (!res.success) {
		throw new Error(res.error || 'Failed to fetch test case run record detail');
	}

	return res.result;
}
