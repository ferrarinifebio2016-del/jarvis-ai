import { configuration } from '@/lib/ai/provider';
export const dynamic='force-dynamic';
export function GET(){return Response.json(configuration(),{headers:{'Cache-Control':'no-store'}})}
