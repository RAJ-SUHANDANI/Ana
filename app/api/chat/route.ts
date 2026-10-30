import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const CLOUDFLARE_MODEL = "@cf/zai-org/glm-4.7-flash";
const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 6_000;
const MAX_TOTAL_CHARS = 18_000;

type ChatMessage = { role: "user" | "assistant"; content: string };
type ModelMessage = { role: "system" | "user" | "assistant"; content: string };
type RateLimitBinding = { limit: (input: { key: string }) => Promise<{ success: boolean }> };
type AiBinding = {
  run: (model: string, input: {
    messages: ModelMessage[];
    max_tokens: number;
    temperature: number;
    stream?: false;
    chat_template_kwargs?: { enable_thinking: boolean };
  }) => Promise<{ response?: string; choices?: Array<{ message?: { content?: string } }> }>;
};
type RuntimeEnv = {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  AI?: AiBinding;
  AI_RATE_LIMITER?: RateLimitBinding;
};
type OpenRouterResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: unknown } }>;
};

class ProviderFailure extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "ProviderFailure";
  }
}

const moodInstructions: Record<string, string> = {
  warm: "Be warm, thoughtful and natural. Be friendly without being overly familiar.",
  focused: "Be concise, direct, structured and practical. Avoid unnecessary preamble.",
  playful: "Be light, curious and occasionally witty when appropriate. Never force jokes.",
  calm: "Use a calm, reassuring and unhurried tone. Keep explanations clear and grounded.",
  professional: "Use polished, precise and professional language. Be respectful and well organised.",
  supportive: "Be patient, encouraging and empathetic without assuming how the user feels.",
};

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getOpenRouterModel(configuredModel?: string) {
  const model = configuredModel?.trim() || DEFAULT_OPENROUTER_MODEL;
  // Never let an environment setting silently switch ANA to a paid model.
  if (model !== DEFAULT_OPENROUTER_MODEL && !model.endsWith(":free")) {
    throw new ProviderFailure(500, "OPENROUTER_MODEL must be openrouter/free or end in :free.");
  }
  return model;
}

async function requestOpenRouter(
  apiKey: string,
  model: string,
  messages: ModelMessage[],
  appOrigin: string,
) {
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": appOrigin,
        "X-Title": "ANA",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 900,
        temperature: 0.65,
        provider: {
          allow_fallbacks: true,
          data_collection: "deny",
        },
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new ProviderFailure(503, "OpenRouter could not be reached.");
  }

  if (!response.ok) {
    throw new ProviderFailure(response.status, "OpenRouter did not accept the request.");
  }

  let payload: OpenRouterResponse;
  try {
    payload = (await response.json()) as OpenRouterResponse;
  } catch {
    throw new ProviderFailure(502, "OpenRouter returned an unreadable response.");
  }

  const rawContent = payload.choices?.[0]?.message?.content;
  const answer =
    typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent
            .filter((part): part is { type: string; text: string } =>
              Boolean(part) &&
              typeof part === "object" &&
              "text" in part &&
              typeof part.text === "string",
            )
            .map((part) => part.text)
            .join("")
        : "";

  if (!answer.trim()) {
    throw new ProviderFailure(502, "OpenRouter returned an empty answer.");
  }

  return {
    response: answer.trim(),
    provider: "openrouter",
    model: payload.model || model,
  };
}

async function requestCloudflare(ai: AiBinding, messages: ModelMessage[]) {
  const result = await ai.run(CLOUDFLARE_MODEL, {
    messages,
    max_tokens: 900,
    temperature: 0.65,
    stream: false,
    chat_template_kwargs: { enable_thinking: false },
  });

  const answer = result.response ?? result.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new ProviderFailure(502, "Cloudflare AI returned an empty answer.");
  }

  return {
    response: answer.trim(),
    provider: "cloudflare",
    model: CLOUDFLARE_MODEL,
  };
}

function getUnavailableMessage(openRouterStatus: number | null, cloudflareFailed: boolean) {
  if (cloudflareFailed) {
    return {
      message: "ANA's AI providers are temporarily unavailable. Please try again shortly.",
      status: 503,
    };
  }
  if (openRouterStatus === 429) {
    return {
      message: "OpenRouter's free-model allowance or capacity is currently exhausted. Please try again later.",
      status: 429,
    };
  }
  if (openRouterStatus === 401 || openRouterStatus === 403) {
    return {
      message: "OpenRouter could not authorise this request. Check the OPENROUTER_API_KEY secret in Cloudflare.",
      status: 503,
    };
  }
  if (openRouterStatus === 402) {
    return {
      message: "OpenRouter could not serve the selected free model. Check the model setting and free-model availability.",
      status: 503,
    };
  }
  if (openRouterStatus === 500) {
    return {
      message: "The OpenRouter model setting is invalid. Use openrouter/free or a model ID ending in :free.",
      status: 500,
    };
  }
  return {
    message: "ANA's AI service could not complete this request. Please try again shortly.",
    status: 503,
  };
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
    return error(
      "This conversation is too long to send at once. Start a new conversation or shorten the context.",
      413,
    );
  }

  const mood = typeof body.mood === "string" && body.mood in moodInstructions
    ? body.mood
    : "warm";

  const systemPrompt = [
    "You are ANA, a thoughtful, capable AI companion.",
    "Your character is calm confidence, intellectual curiosity, clarity and warmth. You are never theatrical, arrogant or excessively enthusiastic.",
    "Communicate naturally. Avoid generic AI filler and do not repeat the user's question unnecessarily.",
    "Adapt your communication style to this user-selected preference: " + moodInstructions[mood],
    "Be honest about uncertainty and limitations. Never claim to have opened websites, sent messages, changed accounts or completed actions unless a tool actually performed them.",
    "In this first version you can answer questions, explain, brainstorm, write, calculate and help plan. You cannot access private accounts or control the user's device.",
    "Use readable Markdown when helpful. Keep the answer appropriately detailed for the request.",
  ].join("\n\n");

  const modelMessages: ModelMessage[] = [{ role: "system", content: systemPrompt }, ...messages];

  try {
    const { env } = getCloudflareContext();
    const bindings = env as unknown as RuntimeEnv;

    // This limiter protects both providers from rapid repeated requests.
    if (bindings.AI_RATE_LIMITER) {
      const clientIp = request.headers.get("cf-connecting-ip") || "unknown-client";
      const { success } = await bindings.AI_RATE_LIMITER.limit({ key: clientIp });
      if (!success) {
        return error("You have sent several messages in a short time. Please pause briefly and try again.", 429);
      }
    }

    const apiKey = bindings.OPENROUTER_API_KEY?.trim();
    let openRouterStatus: number | null = null;

    if (apiKey) {
      try {
        const model = getOpenRouterModel(bindings.OPENROUTER_MODEL);
        const result = await requestOpenRouter(apiKey, model, modelMessages, new URL(request.url).origin);
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
      } catch (cause) {
        openRouterStatus = cause instanceof ProviderFailure ? cause.status : 503;
      }
    }

    // Cloudflare Workers AI is the free-tier fallback and also supports a
    // deployment before an OpenRouter key has been configured.
    if (bindings.AI) {
      try {
        const result = await requestCloudflare(bindings.AI, modelMessages);
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
      } catch {
        const unavailable = getUnavailableMessage(openRouterStatus, true);
        return error(unavailable.message, unavailable.status);
      }
    }

    if (!apiKey) {
      return error("ANA's AI provider is not configured. Add OPENROUTER_API_KEY as a Cloudflare Worker secret.", 503);
    }

    const unavailable = getUnavailableMessage(openRouterStatus, false);
    return error(unavailable.message, unavailable.status);
  } catch {
    return error(
      "ANA's server runtime is unavailable. Confirm the Cloudflare Worker bindings are configured.",
      503,
    );
  }
}
