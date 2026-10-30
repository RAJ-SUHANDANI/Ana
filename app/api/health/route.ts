import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "openrouter/free";

export async function GET() {
  const configured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  const modelAllowed = model === DEFAULT_MODEL || model.endsWith(":free");

  return NextResponse.json(
    {
      available: configured && modelAllowed,
      configured,
      provider: "openrouter",
      model,
      message: !configured
        ? "Add OPENROUTER_API_KEY to the Vercel project environment variables."
        : !modelAllowed
          ? "OPENROUTER_MODEL must be openrouter/free or a model ID ending in :free."
          : undefined,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
