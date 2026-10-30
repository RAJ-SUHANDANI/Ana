import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type HealthEnv = {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  AI?: unknown;
};

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const bindings = env as unknown as HealthEnv;
    const openrouterConfigured = Boolean(bindings.OPENROUTER_API_KEY?.trim());
    const cloudflareFallbackAvailable = Boolean(bindings.AI);

    return NextResponse.json(
      {
        available: openrouterConfigured || cloudflareFallbackAvailable,
        primaryProvider: openrouterConfigured ? "openrouter" : "cloudflare",
        openrouterConfigured,
        cloudflareFallbackAvailable,
        model: openrouterConfigured
          ? bindings.OPENROUTER_MODEL?.trim() || "openrouter/free"
          : "@cf/zai-org/glm-4.7-flash",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        available: false,
        primaryProvider: null,
        openrouterConfigured: false,
        cloudflareFallbackAvailable: false,
        message: "The Worker runtime is not available in this environment.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
