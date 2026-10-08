import 'server-only';
import { demoReply,requestSchema } from './core';
export function configuration(){const mode=process.env.AI_MODE==='live'?'live':'demo';return {mode,provider:process.env.AI_PROVIDER||'openai',model:process.env.AI_MODEL||'gpt-4o-mini',configured:!!process.env.AI_API_KEY};}
export async function respond(data: ReturnType<typeof requestSchema.parse>){
 const config=configuration();if(data.demo||config.mode==='demo')return {content:demoReply(data.messages.at(-1)!.content,data.language),mode:'demo'};
 if(!config.configured)throw new Error('No API key configured. Add AI_API_KEY on the server or use demo mode.');
 const base=new URL(process.env.AI_BASE_URL||'https://api.openai.com/v1');if(base.protocol!=='https:'||base.username||base.password)throw new Error('AI_BASE_URL must be an HTTPS endpoint without embedded credentials.');
 const response=await fetch(base.toString().replace(/\/$/,'')+'/chat/completions',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.AI_API_KEY}`},body:JSON.stringify({model:config.model,messages:[{role:'system',content:`You are JARVIS, a thoughtful personal assistant. Reply in ${data.language==='ro'?'Romanian':'English'}. Be clear, useful and honest. Never claim tools or access you do not have.`},...data.messages],max_tokens:1600}),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(response.status===401?'Provider rejected the server API key.':response.status===429?'Provider rate limit reached. Please try again shortly.':'AI provider is unavailable. Check your server configuration.');
 const result=await response.json();const content=result.choices?.[0]?.message?.content;if(typeof content!=='string'||!content.trim())throw new Error('Provider returned an empty response.');return {content,mode:'live'};
}
