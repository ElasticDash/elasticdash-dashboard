import { api } from '@/utils/api';

export interface TestCase {
	id: number;
	name: string;
	description: string;
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
	const res = await api.get(`testcases/detail/${id}`).json();

	if (!res.success) throw new Error(res.error || 'Failed to fetch test case detail');

	return res.result;
}
