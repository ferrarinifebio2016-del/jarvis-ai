import { requestSchema } from '@/lib/ai/core';
import { isSameOrigin } from '@/lib/ai/origin';
import { respond } from '@/lib/ai/provider';
export const runtime='nodejs';
// Leave headroom for the provider's 30-second timeout on Vercel.
export const maxDuration=60;
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'Cross-origin request rejected.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>100000)return Response.json({error:'Request too large.'},{status:413});
 try{const raw=await request.text();if(raw.length>100000)return Response.json({error:'Request too large.'},{status:413});let body:unknown;try{body=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON request.'},{status:400})}const parsed=requestSchema.safeParse(body);if(!parsed.success)return Response.json({error:'Invalid messages. Send 1–60 messages, up to 12,000 characters each.'},{status:400});return Response.json(await respond(parsed.data),{headers:{'Cache-Control':'no-store'}});}catch(error){const message=error instanceof Error?error.message:'';const safe=['No API key','AI_BASE_URL','Provider rejected','Provider rate','AI provider','Provider returned'].some(s=>message.startsWith(s));return Response.json({error:safe?message:'Unable to complete the request. Please try again.'},{status:502});}
}
