import axios from 'axios';

export async function resetTestCases(testCaseIds: number[]): Promise<any> {
  if (!testCaseIds.length) return;
  const token = localStorage.getItem('token') || '';
  const results = await Promise.all(
    testCaseIds.map(async (id) => {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_BASE_URL + `/testcases/reset/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    })
  );
  return results;
}
