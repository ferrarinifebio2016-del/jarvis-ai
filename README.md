# JARVIS
A cinematic personal AI dashboard with an animated cyan core, circular HUD rings, glass panels, voice visualization, and a collapsible mobile sidebar with bottom controls. Reduced-motion preferences are respected. The microphone indicator reflects actual browser listening; the waveform reflects listening, processing, and speech playback.

A responsive personal AI assistant built with Next.js App Router, TypeScript, Tailwind CSS and Node.js. Includes a futuristic dashboard, English/Romanian conversations, browser-local history, export, speech playback, and an explicitly labeled demo that needs no credentials.

## First run (beginner friendly)
1. Install Node.js 22 LTS or newer from https://nodejs.org.
2. Open a terminal in this project folder.
3. Run `npm install` (or `npm ci` when using the included lockfile).
4. Run `npm run dev`.
5. Open http://localhost:3000. Demo mode works immediately.

## Connect Groq (real AI)
Copy `.env.example` to `.env.local` (Windows: copy it using your file manager). Create your own API key at https://console.groq.com/keys. Set:

```env
AI_MODE=groq
GROQ_API_KEY=
AI_MODEL=openai/gpt-oss-20b
```

Paste your real key after `GROQ_API_KEY=` only in your local `.env.local` or the Vercel secret setting. The example deliberately contains no key. `AI_MODEL` is optional: leaving it empty uses `openai/gpt-oss-20b`, currently listed among [Groq's production models](https://console.groq.com/docs/models). Choose another supported chat model if needed; account/model availability can change.

Restart the local server after editing environment variables. Set `AI_MODE=demo` to restore the existing free demo behavior. Settings can also temporarily select demo responses while the server is in Groq mode. Language can be switched using EN/RO beside the composer. Each request sends the active conversation's last 60 messages in their original order, plus an English or Romanian system instruction; other chats are not mixed into the session. Existing browser-local history and voice controls are preserved.

Groq is called only from the server-side `/api/chat` route. `GROQ_API_KEY` is read in a `server-only` module. The endpoint is fixed to `https://api.groq.com/openai/v1/chat/completions`; Groq mode ignores `AI_BASE_URL` and `AI_PROVIDER`. Neither the key nor raw upstream error bodies are returned to the browser. Never prefix keys with `NEXT_PUBLIC_`, commit them, or enter them into client source. `/api/status` exposes only mode/provider/model and whether a key is configured. “Provider configured” means a key exists, not that it was authenticated; a successful chat verifies that.

Missing/invalid keys, rate limits, unavailable models, denied access, timeouts, network failures, and malformed/empty replies show friendly errors in the existing UI. The draft is restored after a failed request, so you can retry. Real mode never silently switches to demo on provider failure.

For the existing generic OpenAI-compatible integration, `AI_MODE=live` remains available with `AI_API_KEY`, `AI_PROVIDER`, `AI_BASE_URL`, and `AI_MODEL`. Legacy `AI_PROVIDER=groq` in live mode also uses `GROQ_API_KEY`; migrate Groq deployments to `AI_MODE=groq`.

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
- `lib/ai`: server-only demo/Groq/compatible providers, timeout, and sanitized typed errors.
- `lib/memory`: bounded browser history and recovery from corrupt storage. Last 60 messages of the active chat are sent as context. Last 30 chats are kept locally.
- `lib/voice`: browser recognition and speech synthesis controller, permission handling, state cleanup, and future server transcription/wake-word interfaces. Voices and recognition languages depend on browser/OS.
- `lib/tools`: typed registry for future integrations; no tools execute today.
- `tests`: input validation, provider routing/history/languages/error handling, voice helpers, origin security, and local history recovery.

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

For real Groq chat on an existing Vercel project:

1. Open the **Vercel dashboard → jarvis-ai → Settings → Environment Variables**.
2. Add or edit `AI_MODE` with value `groq` for **Production**.
3. Add `GROQ_API_KEY` and paste your own key from https://console.groq.com/keys. Select **Production**, and mark it **Sensitive** where offered. Do not put the key in GitHub, source files, the chat interface, or `NEXT_PUBLIC_` variables.
4. Add `AI_MODEL` with value `openai/gpt-oss-20b` for **Production**, or remove a stale model value to use the default. In particular, remove or replace an old `gpt-4o-mini` value: it is an OpenAI API model, not the Groq default.
5. Remove old `AI_API_KEY`, `AI_PROVIDER`, and `AI_BASE_URL` values if they were only used for Groq; Groq mode does not need them. Keep unrelated provider settings only if you intend to use generic `live` mode later.
6. For **Preview**, set `AI_MODE=demo` and omit `GROQ_API_KEY`. Development credentials are optional and separate.
7. Click **Save** for each variable. Then **Deployments → latest production deployment → ⋯ → Redeploy → Redeploy**. Environment changes do not affect an already running deployment.
8. When it is **Ready**, click **Visit** and send a message. Test EN and RO; the current HUD, browser voice input, and speech playback work with the returned assistant text.

| Variable | Production value | Preview value |
| --- | --- | --- |
| `AI_MODE` | `groq` | `demo` |
| `GROQ_API_KEY` | Your own secret Groq key | Omit |
| `AI_MODEL` | `openai/gpt-oss-20b` (or omit for default) | Optional |

Do not send your key to anyone for troubleshooting. Invalid-key errors mean checking the secret and redeploying; rate limits mean waiting/checking account usage; unavailable-model errors mean selecting an active model your Groq account can use. No real API key is required during the build.

After changing environment variables, go to **Deployments → latest production deployment → ⋯ → Redeploy**, confirm the production environment, and click **Redeploy**. Variables take effect in the new deployment. For future code changes, pushes to `main` automatically create production deployments; confirm **Settings → Environments → Production → Branch Tracking** uses `main` (older UI: **Settings → Git → Production Branch**).

### 3. Verify the deployed application

1. Click **Visit** on the Ready deployment.
2. Send “Help me plan my day.” Demo returns a clearly labeled sample; live mode should return an actual provider answer.
3. Switch **EN** to **RO** beside the composer and send “Salut, ajută-mă să planific ziua.”
4. Reload the page to verify browser-local chat persistence. History is specific to that browser and deployment domain.
5. If a live request fails, check your own key, provider endpoint, and model in Environment Variables; redeploy after correcting them. Missing keys and provider errors are shown in the interface. For build/runtime errors, open **Deployments → deployment → Build Logs** or the project's **Logs** tab. Do not paste credentials into logs or support messages.

The chat route uses the Node.js runtime with a 60-second Vercel function budget and a 30-second provider timeout. No build-time API key is required. Provider configuration is loaded on the server at runtime; the status endpoint exposes only mode/provider/model and whether a key exists.

Before enabling a paid provider on a publicly accessible deployment, configure Vercel Deployment Protection where your plan supports it, or add application authentication and request rate limiting. Server-side secret storage hides the key, but the chat endpoint itself is not authenticated. Demo deployments can be shared without a provider key.

## Voice interaction

1. Open JARVIS on HTTPS (Vercel) or localhost. Choose EN or RO before starting.
2. Tap **Speak** beside the HUD command input. Allow the browser microphone prompt. The HUD shows permission requested, then **Listening** with an active microphone indicator.
3. Speak one utterance. Recognition ends automatically after a phrase; tap **Stop** to finish earlier. Tap **Cancel** while permission is pending to cancel the session. Final text is added to your existing draft. Review it and send normally. No interim or raw audio is saved by JARVIS.
4. In Settings, optionally turn on **Auto-send transcription**. Only successful final transcription is sent; recognition errors, canceled sessions, and page hiding never auto-send. It defaults to off.
5. Tap **Voice off** to enable automatic spoken responses, or **Read aloud** on any assistant message for manual playback. **Stop audio** stops current speech. Turning voice off stops speech and suppresses automatic reading of new replies. Manual Read aloud remains available.

The HUD has Idle, Listening, Processing, Speaking, and Error states. Recognition and playback are canceled when switching language, conversation, or panels, leaving the page, or hiding the tab. Starting the microphone stops speech to avoid transcribing JARVIS itself. Sending text also stops microphone input. Permissions are requested only by an explicit microphone tap; there is no automatic listening.

Browser support varies. Web Speech recognition is available in some Chrome/Edge and Safari versions, including some Android/iPhone configurations. It may use the browser vendor's online speech service: audio may leave the device, and permission to JARVIS does not make vendor recognition offline. It may require network access and supported OS languages. If unavailable or denied, JARVIS gives recovery instructions and text chat still works. Embedded browsers may need opening the site directly in a supported browser.

Speech synthesis first selects an exact `ro-RO` or `en-US` voice, then another voice of the same language, then asks the browser for its language default. Install Romanian voices in device settings if none are available. Mobile browsers, especially iOS Safari, may block automatic playback until a direct tap: tap **Read aloud**. Short utterance chunks help mobile playback; blocked or failed speech shows an error instead of a fake speaking indicator. Real iPhone/Android audio and physical microphone quality need testing on those devices.

No raw recordings, audio files, voice keys, or server speech services are enabled. Only text transcriptions become chat messages and follow the existing local-history/provider behavior. `SpeechToTextProvider` in `lib/voice/contracts.ts` is the extension point for a future server-side Groq Whisper adapter: that adapter should use ephemeral audio, explicit consent, and a server-only environment key.

**Wake word:** no experimental always-listening mode is shipped because browser background recognition is not reliable. A typed foreground-only `WakeWordProvider` interface is ready for a future engine. Any implementation must require explicit opt-in, expose actual microphone activity, and stop on page hiding.
