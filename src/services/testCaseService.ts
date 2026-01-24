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
  const res: ListTestCasesResponse = await api.get('test_case').json();
  if (!res.success) throw new Error(res.error || 'Failed to fetch test cases');
  return res.result;
}
