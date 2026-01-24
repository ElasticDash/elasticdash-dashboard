import { api } from '@/utils/api';
import { TestCase } from './testCaseService';

export interface TestCaseDetailResponse {
	success: boolean;
	error?: string;
	result: TestCaseDetailData;
}

export interface TestCaseDetailData {
	testCase: TestCase;
	aiCalls: any[];
}

export async function fetchTestCaseDetail(id: number): Promise<TestCaseDetailData> {
	const res: TestCaseDetailResponse = await api.get(`test_case/${id}`).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case detail');

	return res.result;
}
