# JARVIS
A cinematic personal AI dashboard with an animated cyan core, circular HUD rings, glass panels, voice visualization, and a collapsible mobile sidebar with bottom controls. Reduced-motion preferences are respected. The microphone indicator is explicitly off; the waveform reflects processing and browser speech playback, not microphone capture.

A responsive personal AI assistant built with Next.js App Router, TypeScript, Tailwind CSS and Node.js. Includes a futuristic dashboard, English/Romanian conversations, browser-local history, export, speech playback, and an explicitly labeled demo that needs no credentials.

## First run (beginner friendly)
1. Install Node.js 22 LTS or newer from https://nodejs.org.
2. Open a terminal in this project folder.
3. Run `npm install` (or `npm ci` when using the included lockfile).
4. Run `npm run dev`.
5. Open http://localhost:3000. Demo mode works immediately.

## Connect real AI
Copy `.env.example` to `.env.local` (Windows: copy it using your file manager). Set these variables, using your own provider key:

```env
AI_MODE=live
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_API_KEY=your-own-key
```

For Groq, set `AI_PROVIDER=groq`, `AI_BASE_URL=https://api.groq.com/openai/v1`, and `AI_MODEL=llama-3.3-70b-versatile`. Choose a model available in your provider account. Any compatible HTTPS base endpoint exposing `/chat/completions` is supported. Restart the server after editing environment variables. Settings offers a temporary demo override when the server is in live mode. Language can be switched using EN/RO beside the composer.

Keys are read only in server modules. Never prefix them with NEXT_PUBLIC_, commit them, or enter them into client source. The browser talks only to `/api/chat`. Provider URLs cannot be supplied by the browser. Live mode without a key shows a setup error rather than silently returning demo output. “Provider configured” means configuration exists, not that an authenticated connection has been tested; a successful chat verifies that.

## Production and checks
```sh
npm test
npm run typecheck
npm run build
npm start
```
Open http://localhost:3000 after `npm start`. Deploy to a Node.js platform supporting Next.js, and configure the environment variables in its secret settings. Keep a personal deployment private or protect it with authentication and a platform rate limit before allowing others to use a paid key. No user authentication or shared durable database is included.

## Features and structure
- `app/page.tsx`: responsive workspace, conversation switching, prompt starters, loading/error states, language, settings and history management.
- `app/api/chat/route.ts`: same-origin request check, body/message limits, validation, and safe provider error responses.
- `app/api/status/route.ts`: non-secret configuration status.
- `lib/ai`: interchangeable demo/live provider, timeout and OpenAI-compatible request.
- `lib/memory`: bounded browser history and recovery from corrupt storage. Last 60 messages of the active chat are sent as context. Last 30 chats are kept locally.
- `lib/voice`: optional browser speech synthesis; voices depend on browser/OS. Microphone transcription is a future integration.
- `lib/tools`: typed registry for future integrations; no tools execute today.
- `tests`: input validation, demo languages, and local history recovery.

Enter sends a message; Shift+Enter adds a line. History is stored unencrypted in this browser; export it from Memory before clearing site data. Only messages in a live conversation are sent to your configured AI provider. Demo responses are deterministic samples, not AI-generated. No fake credentials, system telemetry, calendar access, or integrations are included.

## Deploy from GitHub to Vercel (exact steps)

The source lives at https://github.com/ferrarinifebio2016-del/jarvis-ai on `main`. Vercel hosts the interface and the server-side Next.js API routes together. You do not need to run a cloud development server or forward a port.

### 1. Import the repository

1. Open https://vercel.com/new and sign in with **Continue with GitHub**.
2. Under **Import Git Repository**, find **jarvis-ai** in the `ferrarinifebio2016-del` account and click **Import**.
3. If it is missing, click **Adjust GitHub App Permissions** (or **Install** beside GitHub), grant Vercel access to **jarvis-ai**, then return and select **Import**.
4. On **Configure Project**, keep the project name `jarvis-ai`, select the desired Vercel team/personal account, and confirm **Framework Preset: Next.js**.
5. Leave **Root Directory** at the repository root (`./`), not `app/`.
6. Under **Build and Output Settings**, use **Build Command: npm run build**, **Install Command: npm ci**, and leave **Output Directory** at the Next.js default. Do not select a static export. The committed `vercel.json` supplies the install/build commands.
7. Use **Node.js 22.x**. It is declared in `package.json`; confirm it in **Settings → Build and Deployment → Node.js Version** if your project UI exposes an override.

### 2. Choose demo or real AI

For the first deployment, expand **Environment Variables**, add `AI_MODE` with value `demo`, then click **Deploy**. No API key is needed; omission of all variables also defaults to demo. Wait until the deployment is **Ready**, then click **Visit** to open your actual HTTPS application URL.

For real OpenAI chat, add these environment variables before deployment (or later in **Project → Settings → Environment Variables**):

| Name | OpenAI value | Groq value |
| --- | --- | --- |
| `AI_MODE` | `live` | `live` |
| `AI_PROVIDER` | `openai` | `groq` |
| `AI_BASE_URL` | `https://api.openai.com/v1` | `https://api.groq.com/openai/v1` |
| `AI_MODEL` | `gpt-4o-mini` | `llama-3.3-70b-versatile` |
| `AI_API_KEY` | Paste your own OpenAI key | Paste your own Groq key |

Choose a currently available model in your provider account. Select **Production** for live credentials. Keep **Preview** deployments in demo mode by setting `AI_MODE=demo` for Preview and omitting the key there; Development credentials are optional. Mark `AI_API_KEY` as **Sensitive** if Vercel offers that option. Never add a `NEXT_PUBLIC_` prefix or commit a real `.env` file. Do not enter keys into chat or the browser interface.

After changing environment variables, go to **Deployments → latest production deployment → ⋯ → Redeploy**, confirm the production environment, and click **Redeploy**. Variables take effect in the new deployment. For future code changes, pushes to `main` automatically create production deployments; confirm **Settings → Environments → Production → Branch Tracking** uses `main` (older UI: **Settings → Git → Production Branch**).

### 3. Verify the deployed application

1. Click **Visit** on the Ready deployment.
2. Send “Help me plan my day.” Demo returns a clearly labeled sample; live mode should return an actual provider answer.
3. Switch **EN** to **RO** beside the composer and send “Salut, ajută-mă să planific ziua.”
4. Reload the page to verify browser-local chat persistence. History is specific to that browser and deployment domain.
5. If a live request fails, check your own key, provider endpoint, and model in Environment Variables; redeploy after correcting them. Missing keys and provider errors are shown in the interface. For build/runtime errors, open **Deployments → deployment → Build Logs** or the project's **Logs** tab. Do not paste credentials into logs or support messages.

The chat route uses the Node.js runtime with a 60-second Vercel function budget and a 30-second provider timeout. No build-time API key is required. Provider configuration is loaded on the server at runtime; the status endpoint exposes only mode/provider/model and whether a key exists.

Before enabling a paid provider on a publicly accessible deployment, configure Vercel Deployment Protection where your plan supports it, or add application authentication and request rate limiting. Server-side secret storage hides the key, but the chat endpoint itself is not authenticated. Demo deployments can be shared without a provider key.
