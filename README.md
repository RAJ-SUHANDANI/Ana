# ANA — A Different Kind of Intelligence

ANA is a browser-based AI companion designed around thoughtful conversation, adaptive communication styles and a distinctive, voice-reactive glowing sphere.

The first release focuses on three experiences: a premium public landing page, a focused AI workspace and simple user preferences. It is intentionally small enough to maintain while establishing a distinctive visual identity.

## Product principles

- **Web only:** Use ANA in a modern browser; no native application is required.
- **No local AI installation:** Language-model inference runs through a hosted Cloudflare Workers AI binding.
- **No paid AI API keys:** The project does not call paid OpenAI, Anthropic, Gemini or similar inference APIs.
- **No trials or upgrade prompts:** No trial periods, subscriptions, pricing tiers or upgrade screens.
- **Free-tier first:** The project does not intentionally fall back to paid inference. When the provider's free allowance is exhausted, AI requests return an unavailable response.
- **Honest capabilities:** ANA can answer questions, explain, brainstorm, draft and help plan. It does not claim to control accounts or complete external actions it cannot perform.

> **Free-service note:** Cloudflare Workers AI currently documents a free allowance of 10,000 Neurons per day on the Workers Free plan. This is an account-level shared allowance, not unlimited usage per visitor. Provider limits and model availability can change. ANA does not switch to paid inference. See [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Experience

### Public website
The landing page uses an Obsidian Aura visual system, editorial typography, custom animated sphere artwork, restrained scroll reveals and interactive personality examples.

### AI workspace
- Text conversations with a hosted language model.
- Warm, Focused, Playful, Calm, Professional and Supportive styles.
- Browser-local conversation history.
- Optional speech output through browser voices.
- Optional speech input where the Web Speech Recognition API is available.
- Copy and read-aloud actions.
- Responsive layout and keyboard shortcuts.

### Neural sphere
The sphere is an original Canvas 2D rendering with luminous layers, internal energy filaments, orbital lines and pointer response. In the workspace its colour and energy respond to listening, thinking and speaking states. Microphone input and speech output are browser capabilities and vary by browser.

## Technology

- Semantic HTML, CSS and modern JavaScript modules.
- Canvas 2D for the animated sphere.
- Cloudflare Workers for the API boundary.
- Cloudflare Workers AI for hosted inference.
- Browser localStorage for conversation history and preferences.
- Cloudflare Worker static assets for deployment.

This first version deliberately avoids a large framework and heavy 3D runtime. No model is downloaded or run on the user's device.

## Repository structure

```text
.
├── index.html
├── app.html
├── styles.css
├── favicon.svg
├── src/
│   ├── app.js
│   ├── landing.js
│   └── orb.js
├── worker/
│   └── index.js
├── wrangler.jsonc
└── package.json
```

## Deployment

The repository is configured for Cloudflare Workers with static assets and a Workers AI binding. You can connect GitHub to Cloudflare and deploy from its dashboard. The owner will need to create a free Cloudflare account and authorize the repository.

1. In Cloudflare, create a Worker and connect this repository through the Git integration.
2. Use the included `wrangler.jsonc` configuration and enable the Workers AI binding named `AI`.
3. Set the allowed origin variable to the exact URL from which ANA will be served. The sample is `https://ana.pages.dev`; replace it with the actual Worker or custom Pages hostname.
4. Deploy the Worker. Open its generated URL and check `/api/health`.
5. Visit the homepage and open the AI workspace.

Cloudflare's dashboard and Git integration options can change. The repository includes the Worker configuration as the deployment source of truth.

### Optional developer workflow

Local development is not required to use or deploy ANA. Developers who choose to work locally can use Node.js and Wrangler:

```bash
npm install
npm run dev
```

Cloudflare documents that Workers AI requests made during local development still access the Cloudflare account and consume AI usage. Avoid test inference requests if you need to preserve the daily free allowance.

## Free-tier safeguards

- The Worker calls only the configured Workers AI binding.
- No paid provider fallback is implemented.
- Request message count and character size are bounded.
- Provider quota/capacity errors are returned as clear unavailable responses.
- Do not enable paid billing if maintaining a strict zero-cost deployment is required.
- Before sharing a public deployment widely, configure origin restrictions and add abuse protection/rate limiting. CORS is not authentication and does not stop non-browser clients.

## Privacy

- Conversation history and preferences are stored in this browser.
- Clearing browser data can remove saved conversations.
- Conversation text is sent to the configured Cloudflare Worker for inference.
- Microphone use starts only when the user selects voice input.
- Browser speech recognition may use a browser/platform service; it is not guaranteed to be local or available everywhere.
- Do not share passwords, payment credentials or other secrets with ANA.

## V1 boundaries

ANA V1 is a conversational assistant, not an autonomous computer agent. It can answer questions, explain concepts, brainstorm, write and help plan. It does not send email, access private accounts, control other applications or execute arbitrary code.

## License

No license has been assigned yet. Contact the repository owner before reusing or redistributing this project.
