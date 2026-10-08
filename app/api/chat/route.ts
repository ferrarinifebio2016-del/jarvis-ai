import { requestSchema } from '@/lib/ai/core';
import { isSameOrigin } from '@/lib/ai/origin';
import { respond } from '@/lib/ai/provider';
import { AIError } from '@/lib/ai/errors';
export const runtime = 'nodejs';
// Leave headroom for the provider's 30-second timeout on Vercel.
export const maxDuration = 60;
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Cross-origin request rejected.' }, { status: 403, headers });
  if (Number(request.headers.get('content-length') || 0) > 100000) return Response.json({ error: 'Request too large.' }, { status: 413, headers });
  try {
    const raw = await request.text();
    if (raw.length > 100000) return Response.json({ error: 'Request too large.' }, { status: 413, headers });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400, headers }); }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Invalid messages. Send 1–60 messages, up to 12,000 characters each.' }, { status: 400, headers });
    return Response.json(await respond(parsed.data), { headers });
  } catch (error) {
    if (error instanceof AIError) return Response.json({ error: error.message, code: error.code }, { status: error.status, headers });
    return Response.json({ error: 'Unable to complete the request. Please try again.' }, { status: 502, headers });
  }
}
