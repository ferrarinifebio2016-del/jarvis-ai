import 'server-only';
import { demoReply, requestSchema } from './core';
import { AIError } from './errors';

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export function configuration() {
  const requested = process.env.AI_MODE?.trim().toLowerCase();
  const mode = requested === 'groq' ? 'groq' : requested === 'live' ? 'live' : 'demo';
  const groq = mode === 'groq' || (mode === 'live' && process.env.AI_PROVIDER === 'groq');
  return {
    mode,
    provider: groq ? 'groq' : process.env.AI_PROVIDER || 'openai',
    model: process.env.AI_MODEL?.trim() || (groq ? DEFAULT_GROQ_MODEL : 'gpt-4o-mini'),
    configured: Boolean((groq ? process.env.GROQ_API_KEY : process.env.AI_API_KEY)?.trim()),
  };
}

export async function respond(data: ReturnType<typeof requestSchema.parse>, transport: typeof fetch = fetch) {
  const config = configuration();
  if (data.demo || config.mode === 'demo') {
    return { content: demoReply(data.messages.at(-1)!.content, data.language), mode: 'demo' };
  }
  const groq = config.provider === 'groq';
  const providerName = groq ? 'Groq' : 'AI provider';
  const keyName = groq ? 'GROQ_API_KEY' : 'AI_API_KEY';
  const apiKey = (groq ? process.env.GROQ_API_KEY : process.env.AI_API_KEY)?.trim();
  if (!apiKey) throw new AIError('missing_key', `${providerName} is not configured yet. Add ${keyName} in the server environment and redeploy, or use demo mode.`, 503);

  let endpoint = GROQ_ENDPOINT;
  if (!groq) {
    try {
      const base = new URL(process.env.AI_BASE_URL || 'https://api.openai.com/v1');
      if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error();
      endpoint = base.toString().replace(/\/$/, '') + '/chat/completions';
    } catch {
      throw new AIError('configuration_error', 'The AI endpoint is not configured correctly. Use an HTTPS base URL without embedded credentials, query parameters, or fragments.', 503);
    }
  }

  try {
    const response = await transport(endpoint, {
      method: 'POST', redirect: 'error', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'system', content: `You are JARVIS, a thoughtful personal assistant. Converse naturally in ${data.language === 'ro' ? 'Romanian' : 'English'}. Keep the context of this conversation. Be clear, useful and honest. Never claim tools or access you do not have.` }, ...data.messages],
        ...(groq ? { max_completion_tokens: 2048 } : { max_tokens: 1600 }),
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      // Inspect only error codes for classification. Never forward raw provider messages.
      const body = await response.json().catch(() => null);
      const code = typeof body?.error?.code === 'string' ? body.error.code : '';
      if (response.status === 401) throw new AIError('invalid_key', `${providerName} could not authenticate. Check ${keyName} in your server settings and redeploy.`, 503);
      if (response.status === 429) throw new AIError('rate_limit', `${providerName} is busy or your account limit was reached. Please wait a moment and try again.`, 429);
      if (response.status === 404 || /model.*(not_found|decommissioned|not_available|permission)|model_not_found/.test(code)) throw new AIError('model_unavailable', `The selected ${providerName} model is unavailable or not enabled for your account. Choose a supported AI_MODEL in server settings and redeploy.`, 503);
      if (response.status === 403) throw new AIError('access_denied', `${providerName} denied access. Check your account and model permissions, then try again.`, 503);
      if (response.status >= 500) throw new AIError('provider_unavailable', `${providerName} is temporarily unavailable. Please try again shortly.`, 503);
      throw new AIError('request_rejected', `${providerName} could not process this conversation. Try a shorter message or a new chat; check the model configuration if it continues.`, 502);
    }
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new AIError('empty_response', `${providerName} returned no reply. Please try again or choose another supported model.`, 502);
    return { content, mode: config.mode };
  } catch (error) {
    if (error instanceof AIError) throw error;
    if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) throw new AIError('timeout', `${providerName} took too long to reply. Please try again.`, 504);
    if (error instanceof SyntaxError) throw new AIError('invalid_response', `${providerName} returned an unreadable reply. Please try again shortly.`, 502);
    throw new AIError('network_error', `Unable to reach ${providerName}. Please try again shortly; if it continues, check the server's network access.`, 502);
  }
}
