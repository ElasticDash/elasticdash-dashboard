import { api } from '@/utils/api';

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
