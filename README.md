# ANA — A Different Kind of Intelligence

ANA is a web-based AI companion built with the **Next.js App Router**, TypeScript and a custom visual identity. It centres on thoughtful conversation, user-selected communication styles and a distinctive glowing sphere that responds to voice and assistant activity.

The first release is deliberately focused: a premium public landing page, a functional AI workspace, optional browser voice, local conversation history and a small set of useful preferences.

## Product principles

- **Web only:** ANA runs in a modern browser. There is no native mobile or desktop app.
- **No local model:** AI inference runs remotely. Users do not download or run a model on their device.
- **Free-tier first:** OpenRouter's free-model router is the primary AI provider. Cloudflare Workers AI is retained as an optional fallback.
- **No paid-model routing:** ANA defaults to openrouter/free. A custom OpenRouter model setting is accepted only when it is openrouter/free or ends in :free.
- **No trials or upgrade prompts:** No trial periods, subscriptions, pricing tiers or upgrade screens are included.
- **No exposed provider keys:** The OpenRouter API key is read only by the server-side Next.js Route Handler. It is never sent to the browser.
- **Honest capabilities:** V1 answers questions, explains, brainstorms, writes and helps plan. It does not claim to control accounts or complete external actions it cannot perform.

> **Free usage is limited.** OpenRouter's free model variants currently allow up to 20 requests per minute and 50 requests per day on an account without purchased credits. The 50-request allowance is shared by every ANA visitor using the same API key, and failed attempts also count. Buying at least $10 of credits raises the free-model daily cap to 1,000, but that is not a zero-cost option. Limits and model availability can change. See [OpenRouter free models](https://openrouter.ai/collections/free-models) and [OpenRouter pricing](https://openrouter.ai/pricing).

## Experience

### Premium public website

The landing page uses the ANA Obsidian Aura design system: deep ink surfaces, electric violet and blue light, elegant typography, original orb artwork, restrained section reveals and interactive personality examples.

### AI workspace

- Text conversations powered by hosted AI models.
- Six conversation styles: Warm, Focused, Playful, Calm, Professional and Supportive.
- Conversation history stored in the current browser.
- Optional speech output using browser voices.
- Optional speech recognition where the browser supports the Web Speech Recognition API.
- Copy and read-aloud controls.
- Responsive sidebar, recent conversations, appearance preferences and data deletion.

### Neural sphere

The sphere is a custom Canvas renderer rather than a static image or downloaded model. It combines a dimensional luminous core, inner plasma filaments, orbit lines and fine particles. It changes its energy and colour for idle, listening, thinking and speaking states. While the user speaks, microphone amplitude drives its movement; while ANA speaks, the orb uses a speaking pulse. Pointer movement creates a subtle parallax response.

Microphone access is requested only after the user selects voice input. Browser speech recognition support and its data handling vary by browser and operating system.

## AI provider architecture

### Primary: OpenRouter free models

ANA calls the OpenRouter OpenAI-compatible Chat Completions endpoint from the server. The default model is openrouter/free, which selects an eligible free model for each request. This avoids tying the product to a single free model ID whose availability may change.

The request also sets provider.data_collection to deny, so OpenRouter filters out providers whose data policies allow collection for training. This is a provider-routing preference, not a guarantee that every part of the service retains no operational metadata. Review OpenRouter's privacy controls and the selected provider's current policy before using sensitive information.

### Fallback: Cloudflare Workers AI

The existing Cloudflare Workers AI binding remains available as a fallback when OpenRouter is not configured or cannot serve a request. ANA uses @cf/zai-org/glm-4.7-flash through the AI binding declared in wrangler.jsonc.

Cloudflare's Workers Free plan documents a daily Workers AI Neurons allowance. The allowance is shared by the Cloudflare account; it is not unlimited per ANA visitor. If both providers are unavailable or their free allowances are exhausted, ANA returns a clear error instead of silently calling a paid model.

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shared custom design system |
| Motion | Motion for React |
| Icons | Lucide React |
| Primary AI provider | OpenRouter |
| Default model selection | openrouter/free |
| Optional AI fallback | Cloudflare Workers AI |
| Cloud runtime | Cloudflare Workers |
| Next.js deployment adapter | OpenNext for Cloudflare |
| Local persistence | Browser localStorage |

## Project structure

    .
    ├── app/
    │   ├── api/
    │   │   ├── chat/route.ts       # Validated chat endpoint and provider routing
    │   │   └── health/route.ts     # AI provider configuration status
    │   ├── app/page.tsx            # Assistant workspace route (/app)
    │   ├── error.tsx
    │   ├── globals.css             # Obsidian Aura design system
    │   ├── layout.tsx
    │   ├── loading.tsx
    │   ├── not-found.tsx
    │   └── page.tsx                # Public landing page
    ├── components/
    │   ├── assistant-workspace.tsx
    │   ├── landing-page.tsx
    │   └── neural-orb.tsx
    ├── public/
    │   └── favicon.svg
    ├── instrumentation.ts
    ├── next.config.ts
    ├── open-next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    └── wrangler.jsonc

## Configure OpenRouter

1. Create an account at [OpenRouter](https://openrouter.ai/) and generate an API key.
2. Open the Cloudflare dashboard and select the ANA Worker.
3. Go to **Settings → Variables and Secrets**.
4. Add a **Secret** named OPENROUTER_API_KEY and paste the key as its value.
5. Save the secret and redeploy the Worker if the dashboard requests it.
6. Optionally add a plain-text variable named OPENROUTER_MODEL with the value openrouter/free. The application already uses this value by default, so this variable is not required.

Do not add a real key to .env.example, source files, GitHub commits or browser code. The included .env.example documents the variable names only.

For a local Cloudflare preview, create a private .dev.vars file (already ignored by Git) with OPENROUTER_API_KEY=your_key. The production deployment must receive the key as a Cloudflare Worker Secret.

## Deploy ANA from GitHub to Cloudflare

You do not need to install Node.js, download a model or run a server on your laptop to use the deployed site. The project owner does need to connect the GitHub repository to a Cloudflare account once.

1. Create or sign in to a Cloudflare account and keep it on the Workers Free plan.
2. In Cloudflare Workers & Pages, create a Worker using Git integration and connect this repository.
3. Make sure the repository root is the build root. The deployment uses the included wrangler.jsonc and open-next.config.ts.
4. Use the OpenNext Cloudflare build/deploy flow. The project scripts are:
   - npm run cf:build — build Next.js and adapt the output for Cloudflare.
   - npm run cf:preview — build and preview in the Workers runtime.
   - npm run deploy — build and deploy to Cloudflare Workers.
5. Add OPENROUTER_API_KEY as a Worker Secret using the steps above.
6. Confirm that the AI binding is present if you want Cloudflare fallback enabled.
7. Open the generated workers.dev URL and visit /api/health. It should report available: true and primaryProvider: "openrouter" when the OpenRouter secret is configured.
8. Open the homepage and choose **Enter ANA**.

The included Cloudflare configuration sets the Worker entry point to .open-next/worker.js, serves adapted assets from .open-next/assets, enables nodejs_compat, exposes the Workers AI binding and defines the AI_RATE_LIMITER rate-limit binding.

### Optional developer workflow

A local development environment is optional; it is not needed by visitors. Developers can use Node.js 22+:

    npm install
    npm run dev

To test the Cloudflare runtime locally:

    npm run cf:preview

Cloudflare Workers AI calls made during local preview can consume the connected Cloudflare account's daily allowance. OpenRouter free-model requests also count against the account's free-model allowance.

## Free-tier and abuse safeguards

- The primary model defaults to openrouter/free; custom model IDs must end in :free.
- There is no automatic upgrade path, paid-model fallback, subscription flow or paid provider key.
- If OpenRouter is unconfigured or unavailable, the backend can use the existing Cloudflare Workers AI binding.
- If both free providers are unavailable or rate limited, ANA stops and displays an error. It does not route requests to paid inference.
- The server validates message count, role and request size before inference.
- A Cloudflare Rate Limiting binding caps chat requests at 8 per minute per client IP before either provider is called. Cloudflare describes this limiter as approximate and regional, so it is an abuse-reduction measure rather than a strict global quota.
- Keep the Cloudflare account on its Free plan if you require a zero-cost deployment ceiling.
- Before sharing a public instance widely, add persistent rate limiting or challenge-based abuse controls. Browser-side controls and same-origin checks are not authentication and cannot prevent all scripted requests.

## Privacy and data

- Conversation history, selected mood, theme and voice preference are stored in the current browser's localStorage.
- Clearing browser storage removes these conversations and preferences.
- Conversation text is transmitted to OpenRouter to generate a response. The request asks OpenRouter to avoid providers that collect data for training, but that is not equivalent to a blanket zero-retention guarantee.
- If OpenRouter is unavailable, conversation text may instead be sent to Cloudflare Workers AI when that binding is enabled.
- Microphone access starts only when the user explicitly selects voice input.
- Browser speech recognition may use the browser/platform recognition service; it is not guaranteed to run locally.
- Voice output uses the browser's available speech synthesis voices.
- Do not share passwords, payment credentials or other secrets with ANA.

## V1 boundaries

ANA V1 is a conversational companion, not an autonomous computer agent. It can answer questions, explain, brainstorm, draft, calculate and help plan. It does not send emails, access private accounts, control other applications, browse the user's private files or execute arbitrary code.

## License

No license has been assigned yet. Contact the repository owner before reusing or redistributing this project.
