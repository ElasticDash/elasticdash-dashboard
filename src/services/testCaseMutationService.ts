import { api } from '@/utils/api';
import { TestCase } from './testCaseService';

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
