import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const MODEL = "@cf/zai-org/glm-4.7-flash";
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 6_000;
const MAX_TOTAL_CHARS = 18_000;

type ChatMessage = { role: "user" | "assistant"; content: string };
type AiBinding = {
  run: (
    model: string,
    input: {
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      max_tokens: number;
      temperature: number;
      stream?: false;
      chat_template_kwargs?: { enable_thinking: boolean };
    },
  ) => Promise<{
    response?: string;
    choices?: Array<{ message?: { content?: string } }>;
  }>;
};

const moodInstructions: Record<string, string> = {
  warm: "Be warm, thoughtful and natural. Be friendly without being overly familiar.",
  focused: "Be concise, direct, structured and practical. Avoid unnecessary preamble.",
  playful: "Be light, curious and occasionally witty when appropriate. Never force jokes.",
  calm: "Use a calm, reassuring and unhurried tone. Keep explanations clear and grounded.",
  professional: "Use polished, precise and professional language. Be respectful and well organised.",
  supportive: "Be patient, encouraging and empathetic without assuming how the user feels.",
};

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return error("This request origin is not allowed.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) return error("The request is too large.", 413);

  let body: { messages?: unknown; mood?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("The request body must be valid JSON.", 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return error("Send between 1 and 16 recent messages.", 400);
  }

  let totalChars = 0;
  const messages: ChatMessage[] = [];
  for (const entry of body.messages) {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("role" in entry) ||
      !("content" in entry) ||
      !["user", "assistant"].includes(String(entry.role)) ||
      typeof entry.content !== "string"
    ) {
      return error("One or more messages has an invalid format.", 400);
    }
    const content = entry.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) {
      return error("A message is empty or exceeds the 6,000 character limit.", 400);
    }
    totalChars += content.length;
    messages.push({ role: entry.role as ChatMessage["role"], content });
  }

  if (totalChars > MAX_TOTAL_CHARS) {
    return error("This conversation is too long to send at once. Start a new conversation or shorten the context.", 413);
  }

  const mood = typeof body.mood === "string" && body.mood in moodInstructions ? body.mood : "warm";
  const systemPrompt = [
    "You are ANA, a thoughtful, capable AI companion.",
    "Your character is calm confidence, intellectual curiosity, clarity and warmth. You are never theatrical, arrogant or excessively enthusiastic.",
    "Communicate naturally. Avoid generic AI filler and do not repeat the user's question unnecessarily.",
    "Adapt your communication style to this user-selected preference: " + moodInstructions[mood],
    "Be honest about uncertainty and limitations. Never claim to have opened websites, sent messages, changed accounts or completed actions unless a tool actually performed them.",
    "In this first version you can answer questions, explain, brainstorm, write, calculate and help plan. You cannot access private accounts or control the user's device.",
    "Use readable Markdown when helpful. Keep the answer appropriately detailed for the request.",
  ].join("\n\n");

  try {
    const { env } = getCloudflareContext();
    const ai = (env as unknown as { AI?: AiBinding }).AI;
    if (!ai) return error("ANA's cloud AI binding is not configured yet.", 503);

    const result = await ai.run(MODEL, {
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 900,
      temperature: 0.65,
      stream: false,
      chat_template_kwargs: { enable_thinking: false },
    });

    const answer = result.response ?? result.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return error("ANA couldn't create a response just now. Please try again.", 502);
    }

    return NextResponse.json(
      { response: answer.trim(), model: MODEL },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    const message = String(cause instanceof Error ? cause.message : cause);
    const quota = /limit|quota|neuron|capacity|billing/i.test(message);
    return error(
      quota
        ? "ANA may have reached the free daily AI allowance. Please try again after it resets."
        : "ANA's thinking service is temporarily unavailable. Please try again shortly.",
      quota ? 429 : 503,
    );
  }
}
