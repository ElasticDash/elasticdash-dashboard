import axios from 'axios';

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
