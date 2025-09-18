"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "@/contexts/session-context";
import { ChatProvider } from "@/contexts/chat-context";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ChatProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ChatProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
