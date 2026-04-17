import { useQuery } from '@tanstack/react-query';

import { mockExamService } from '../services/mockExamService';
import type {
  MockExam,
  MockExamResultResponse,
} from '../types/mockExam';

export const mockExamKeys = {
  all: ['mockExam'] as const,
  byId: (id: string) => [...mockExamKeys.all, 'byId', id] as const,
  result: (sessionId: string) =>
    [...mockExamKeys.all, 'result', sessionId] as const,
};

export function useMockExam(id: string | undefined) {
  return useQuery<MockExam>({
    queryKey: mockExamKeys.byId(id ?? ''),
    queryFn: () => mockExamService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useMockExamResult(sessionId: string | undefined) {
  return useQuery<MockExamResultResponse>({
    queryKey: mockExamKeys.result(sessionId ?? ''),
    queryFn: () => mockExamService.getResult(sessionId as string),
    enabled: Boolean(sessionId),
    // Result is terminal — once grading is done it does not change.
    staleTime: Infinity,
  });
}
