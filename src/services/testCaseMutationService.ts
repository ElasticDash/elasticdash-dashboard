import { api } from '@/utils/api';
import { TestCase } from './testCaseService';

export async function updateTestCase(id: number, data: Partial<TestCase>) {
  const res = await api.put(`test_case/${id}`, { json: data }).json();
  if (!res.success) throw new Error(res.error || 'Failed to update test case');
  return res.result;
}

export async function deleteTestCase(id: number) {
  const res = await api.delete(`test_case/${id}`).json();
  if (!res.success) throw new Error(res.error || 'Failed to delete test case');
  return res.result;
}
