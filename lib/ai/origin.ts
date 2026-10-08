/** Validate browser requests against the incoming authority, rather than Next's internal bind hostname. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const source = new URL(origin);
    const host = request.headers.get('host') || new URL(request.url).host;
    return ['https:', 'http:'].includes(source.protocol) && !source.username && !source.password && source.host === host;
  } catch {
    return false;
  }
}
