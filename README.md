# ANA — A Different Kind of Intelligence

ANA is a browser-based AI companion built with the Next.js App Router, React and TypeScript. It combines thoughtful conversation, user-selected communication styles and a distinctive glowing sphere that responds to voice and assistant activity.

The first release focuses on a premium public landing page, an AI workspace, optional browser voice, local conversation history and a small set of useful preferences.

## Product principles

- **Web only:** ANA runs in a modern browser. There is no native mobile or desktop app.
- **No local model:** AI inference runs remotely through OpenRouter. Users do not download or run an AI model on their devices.
- **Free-tier first:** ANA defaults to OpenRouter's free-model router.
- **No paid-model routing:** The model is restricted to openrouter/free or a model ID ending in :free.
- **No trials or upgrade prompts:** There are no trial periods, subscriptions, pricing tiers or upgrade screens in the product.
- **No exposed provider keys:** The OpenRouter key is read only by the server-side Next.js Route Handler. It is never sent to browser code.
- **Vercel-native deployment:** ANA uses standard Next.js routes and does not require Cloudflare Workers, Wrangler or the OpenNext Cloudflare adapter.

> **Free usage is limited.** OpenRouter's free model variants currently allow up to 20 requests per minute and 50 requests per day on an account without purchased credits. This allowance is shared across all visitors using the same ANA API key, and failed attempts count too. Buying at least $10 in credits increases the free-model daily cap to 1,000, but that is not a strictly zero-cost option. Availability and limits can change. See [OpenRouter free models](https://openrouter.ai/collections/free-models).

## Experience

### Premium public website

The landing page uses the ANA Obsidian Aura design system: deep ink surfaces, electric violet and blue light, elegant typography, original orb artwork, restrained section reveals and interactive personality examples.

### AI workspace

- Chat with a hosted AI model through OpenRouter.
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
| Styling | Tailwind CSS 4 + custom design system |
| Motion | Motion for React |
| Icons | Lucide React |
| AI provider | OpenRouter |
| Default model | openrouter/free |
| Hosting and server routes | Vercel |
| Local persistence | Browser localStorage |

## AI architecture

ANA calls OpenRouter's OpenAI-compatible Chat Completions endpoint from app/api/chat/route.ts. The default model is openrouter/free, which selects an eligible free model for each request. You can optionally set OPENROUTER_MODEL to a specific free model variant whose ID ends in :free.

The request asks OpenRouter to route only to providers that do not collect data for training (provider.data_collection: deny). This is a routing preference, not a promise of zero operational logging or universal zero data retention. Review OpenRouter and the selected provider's current privacy terms before using sensitive information.

The backend validates message count, roles and request size, restricts model selection to free models, and returns clear errors when the key, model or free-tier capacity is unavailable. There is no silent paid-model fallback.

## Deploy from GitHub to Vercel

You do not need to install Node.js, download a model or run a server on your laptop to deploy or use the hosted site. Import the repository into Vercel once, then Vercel can automatically deploy new commits from main.

1. Create an account at [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Connect your GitHub account and import RAJ-SUHANDANI/Ana.
3. Confirm the Framework Preset is **Next.js** and the Root Directory is the repository root. Vercel automatically detects the build command and output settings.
4. Open **Project → Settings → Environment Variables**.
5. Add OPENROUTER_API_KEY and paste your OpenRouter API key. Choose the Secret type and enable it for Production and Preview (and Development if you use Vercel's local tooling).
6. Optionally add OPENROUTER_MODEL with the value openrouter/free. This is already the application default, so it is not required.
7. Save the variables and deploy. If you add or change a variable after deploying, redeploy so the new value is available.
8. Visit the Vercel deployment URL and open /api/health. It should return available: true and provider: openrouter when the key and model setting are valid.
9. Open the homepage and choose **Enter ANA**.

After the initial GitHub import, pushes to the configured production branch (main by default) can trigger production deployments. Vercel can also create preview deployments for other branches and pull requests.

### Local development (optional)

Visitors and hosted Vercel deployments do not need a local model or a local server running on your laptop. Developers who want to run the Next.js app locally can use Node.js 22+.

Create a private .env.local file in the project root with:

    OPENROUTER_API_KEY=your_openrouter_api_key
    OPENROUTER_MODEL=openrouter/free

Then run npm install and npm run dev. The .env.local file is ignored by Git. Never commit API keys or paste them into frontend code.

## Cost and usage notes

- OpenRouter's free-model quota is shared by every visitor using the same key. It is suitable for development and small-scale experiments, but a public launch can exhaust the daily allowance quickly.
- The default openrouter/free router can select among eligible free models, but their availability and capacity can change.
- The backend rejects non-free model IDs. It never automatically upgrades to a paid model.
- Vercel plan limits and fair-use terms still apply. Check the current [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) for personal-project eligibility and included usage.
- Before sharing a public instance widely, consider adding persistent per-IP rate limiting or a challenge-based abuse control. Do not rely on browser-side controls as security.

## Privacy and data

- Conversation history, selected mood, theme and voice preference are stored in the current browser's localStorage.
- Clearing browser storage removes these conversations and preferences.
- Conversation text is transmitted to OpenRouter to generate a reply.
- The request asks OpenRouter to avoid providers that collect data for training, but that is not a blanket zero-retention guarantee.
- Microphone access starts only after the user explicitly selects voice input.
- Browser speech recognition may use the browser/platform recognition service; it is not guaranteed to run locally.
- Voice output uses the browser's available speech synthesis voices.
- Do not share passwords, payment credentials or other secrets with ANA.

## V1 boundaries

ANA V1 is a conversational companion, not an autonomous computer agent. It can answer questions, explain, brainstorm, draft, calculate and help plan. It does not send emails, access private accounts, control other applications, browse the user's private files or execute arbitrary code.

## License

No license has been assigned yet. Contact the repository owner before reusing or redistributing this project.
