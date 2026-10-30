import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const ai = (env as unknown as { AI?: AiBinding }).AI;
    return NextResponse.json(
      { available: Boolean(ai), model: "@cf/zai-org/glm-4.7-flash" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { available: false, model: "@cf/zai-org/glm-4.7-flash", message: "Cloudflare AI binding is not available in this runtime." },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
