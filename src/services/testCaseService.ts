import axios from 'axios';
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
