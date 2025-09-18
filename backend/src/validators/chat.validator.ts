import { z } from "zod";

export const sendMessageSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  category: z.string().optional().default("other"),
});

export const streamMessageSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  category: z.string().optional().default("other"),
});
