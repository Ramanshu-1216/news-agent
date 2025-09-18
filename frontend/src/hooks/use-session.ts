"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface Session {
  id: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  message: string;
  createdAt: string;
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.sessions.create(),
    onSuccess: () => {
      // Invalidate sessions list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
    },
  });
}

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId || ""),
    queryFn: () => api.sessions.get(sessionId!),
    enabled: !!sessionId,
  });
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: api.sessions.getAll,
  });
}

export function useClearSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.sessions.clear(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidate session and chat history
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatHistory.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
    },
  });
}

export function useValidateSession() {
  return useMutation({
    mutationFn: (sessionId: string) => api.sessions.get(sessionId),
  });
}
