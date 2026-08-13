import "server-only";
import { env } from "@/lib/env";

/*
  Minimal AI chat client for Daylight. OpenAI-compatible Chat Completions over
  fetch (no SDK dependency). The model is configurable via AI_MODEL; the key via
  AI_API_KEY. Swapping providers later is a matter of changing the base URL.
*/

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export const isAiConfigured = Boolean(env.AI_API_KEY);

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

/** Send a chat conversation and return the assistant's reply text. */
export async function chatComplete(messages: ChatTurn[]): Promise<string> {
  if (!isAiConfigured) throw new Error("The AI companion isn't configured yet.");
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.AI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.8,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "The AI companion is unavailable right now.");
  }
  const reply = json?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("The AI companion didn't return a response. Please try again.");
  }
  return reply.trim();
}
