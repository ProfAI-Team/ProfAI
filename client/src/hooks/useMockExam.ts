import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mockExamService } from '../services/mockExamService';
import type {
  MockExam,
  MockExamResultResponse,
  MockExamSubmitResponse,
} from '../types/mockExam';
import type { SubmitMockExamParams } from '../services/mockExamService';

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

/**
 * Phase 7 task 7.5 — mock-exam session submission as a TanStack mutation
 * so the session page no longer juggles submitting / submitError local
 * state. The same shape is what the tutoring session page (7.22) copies.
 *
 * The mutation prefills the result cache with the submit response so the
 * follow-up `useMockExamResult(sessionId)` read from the result page
 * hits an already-populated cache instead of refetching.
 */
export function useSubmitMockExam(examId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<MockExamSubmitResponse, Error, SubmitMockExamParams>({
    mutationFn: (params) => {
      if (!examId) {
        return Promise.reject(new Error('exam id required'));
      }
      return mockExamService.submit(examId, params);
    },
    onSuccess: (res) => {
      queryClient.setQueryData(
        mockExamKeys.result(res.sessionId),
        res
      );
      // Grader may have generated a new session row; invalidate the
      // exam detail so a second visit refetches the current question
      // state instead of reusing the pre-submit snapshot.
      if (examId) {
        queryClient.invalidateQueries({
          queryKey: mockExamKeys.byId(examId),
        });
      }
    },
  });
}
