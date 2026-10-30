# ANA — A Different Kind of Intelligence

ANA is a web-based AI companion built with the **Next.js App Router**, TypeScript and a custom visual identity. It centres on thoughtful conversation, user-selected communication styles and a distinctive glowing sphere that responds to voice and assistant activity.

The first release is deliberately focused: a premium public landing page, a functional AI workspace, optional browser voice, local conversation history and a small set of useful preferences.

## Product principles

- **Web only:** ANA runs in a modern browser. There is no native mobile or desktop app.
- **No local model:** AI inference runs remotely through the Cloudflare Workers AI binding. Users do not download or run an AI model on their device.
- **No paid AI API keys:** The app does not require OpenAI, Anthropic, Gemini or other paid provider keys.
- **No trials or upgrade prompts:** No trial periods, subscriptions, pricing tiers or upgrade screens.
- **Free-tier first:** ANA is designed for Cloudflare's Workers Free plan. It does not intentionally fall back to a paid inference service.
- **Honest capabilities:** V1 answers questions, explains, brainstorms, writes and helps plan. It does not claim to control accounts or complete external actions it cannot perform.

> **Free usage is limited.** Cloudflare Workers AI currently documents 10,000 Neurons per day at no charge on the Workers Free plan. This is a shared account allowance, not an unlimited allowance per user. When the quota is exhausted, AI requests fail until the allowance resets. Provider pricing and limits can change. Keep Cloudflare billing disabled if a strict zero-cost deployment is required. See [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Experience

### Premium public website
The landing page uses the ANA Obsidian Aura design system: deep ink surfaces, electric violet and blue light, elegant typography, original orb artwork, restrained section reveals and interactive personality examples.

### AI workspace
- Text conversations powered by a hosted language model.
- Six conversation styles: Warm, Focused, Playful, Calm, Professional and Supportive.
- Conversation history stored in the current browser.
- Optional speech output using browser voices.
- Optional speech recognition where the browser supports the Web Speech Recognition API.
- Copy and read-aloud controls.
- Responsive sidebar, recent conversations, appearance preferences and data deletion.

### Neural sphere
The sphere is a custom Canvas renderer rather than a static image or downloaded model. It combines a dimensional luminous core, inner plasma filaments, orbit lines and fine particles. It changes its energy and colour for idle, listening, thinking and speaking states. While the user speaks, microphone amplitude drives its movement; while ANA speaks, the orb uses a speaking pulse. Pointer movement creates a subtle parallax response.

Microphone access is requested only after the user selects voice input. Browser speech recognition support and its data handling vary by browser and operating system.

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shared custom design system |
| Motion | Motion for React |
| Icons | Lucide React |
| AI inference | Cloudflare Workers AI |
| AI model | `@cf/zai-org/glm-4.7-flash` |
| Cloud runtime | Cloudflare Workers |
| Next.js deployment adapter | OpenNext for Cloudflare |
| Local persistence | Browser localStorage |

The app does not use a local model, local database server or paid AI provider. The Cloudflare AI binding is accessed only by the server-side Next.js Route Handler; no provider credential is exposed to the browser.

## Project structure

```text
.
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Validated chat endpoint and Workers AI call
│   │   └── health/route.ts     # AI binding status
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
```

## Deploy ANA from GitHub to Cloudflare

You do not need to install Node.js, download a model or run a server on your laptop to use the deployed site. The project owner does need to connect the GitHub repository to a Cloudflare account once.

1. Create or sign in to a Cloudflare account and keep it on the **Workers Free** plan.
2. In Cloudflare Workers & Pages, create a Worker using the Git integration and connect this repository.
3. Make sure the repository root is the build root. The deployment uses the included `wrangler.jsonc` and `open-next.config.ts`.
4. Use the OpenNext Cloudflare build/deploy flow. The project scripts are:
   - `npm run cf:build` — build Next.js and adapt the output for Cloudflare.
   - `npm run cf:preview` — build and preview in the Workers runtime.
   - `npm run deploy` — build and deploy to Cloudflare Workers.
5. Confirm the AI binding named `AI` is present. It is declared in `wrangler.jsonc`.
6. Open the generated `workers.dev` URL. Visit `/api/health`; it should report `available: true` when the binding is correctly enabled.
7. Open the homepage and choose **Enter ANA**.

The included Cloudflare configuration sets the Worker entry point to `.open-next/worker.js`, serves the adapted assets from `.open-next/assets`, enables `nodejs_compat`, exposes the Workers AI binding and defines the `AI_RATE_LIMITER` rate-limit binding.

### Optional developer workflow

A local development environment is optional; it is not needed by visitors. Developers can use Node.js 22+:

```bash
npm install
npm run dev
```

To test the Cloudflare runtime locally:

```bash
npm run cf:preview
```

Workers AI calls made during local preview can use the connected Cloudflare account and consume its daily AI allowance. Avoid unnecessary model calls when preserving the free allowance matters.

## Free-tier and abuse safeguards

- The only model provider in this version is the Cloudflare Workers AI binding.
- There is no provider fallback, paid API key, auto-upgrade path or subscription flow.
- The server validates the message count, role and request size before inference.
- A Cloudflare Rate Limiting binding caps chat requests at 8 per minute per client IP before inference. Cloudflare describes this limiter as approximate and regional, so it is an abuse-reduction measure rather than a strict global quota.
- The model output is bounded with a token limit.
- Quota/capacity errors become a clear unavailable message rather than a paid fallback.
- Keep Workers Free billing disabled if you require a hard zero-cost ceiling.
- Before sharing a public instance widely, add persistent rate limiting or challenge-based abuse controls. Browser-side controls and same-origin checks are not authentication and cannot prevent all scripted requests.

## Privacy and data

- Conversation history, selected mood, theme and voice preference are stored in the current browser's localStorage.
- Clearing browser storage removes these conversations and preferences.
- Conversation text is transmitted to Cloudflare Workers AI through the ANA server route to generate a reply.
- Microphone access starts only when the user explicitly selects voice input.
- Browser speech recognition may use the browser/platform recognition service; it is not guaranteed to run locally.
- Voice output uses the browser's available speech synthesis voices.
- Do not share passwords, payment credentials or other secrets with ANA.

## V1 boundaries

ANA V1 is a conversational companion, not an autonomous computer agent. It can answer questions, explain, brainstorm, draft, calculate and help plan. It does not send emails, access private accounts, control other applications, browse the user's private files or execute arbitrary code.

## License

No license has been assigned yet. Contact the repository owner before reusing or redistributing this project.
