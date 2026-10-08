import {test,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {configuration,DEFAULT_GROQ_MODEL,respond} from '../lib/ai/provider';
import {AIError} from '../lib/ai/errors';
import {requestSchema} from '../lib/ai/core';
import {POST} from '../app/api/chat/route';
const variables=['AI_MODE','AI_PROVIDER','AI_BASE_URL','AI_MODEL','AI_API_KEY','GROQ_API_KEY'] as const;
let original:Record<string,string|undefined>={};let key='';
beforeEach(()=>{original=Object.fromEntries(variables.map(name=>[name,process.env[name]]));variables.forEach(name=>delete process.env[name]);key=randomUUID();process.env.AI_MODE='groq';process.env.GROQ_API_KEY=key});
afterEach(()=>{for(const name of variables){if(original[name]===undefined)delete process.env[name];else process.env[name]=original[name]}});
const conversation=[{role:'user',content:'My name is Ana.'},{role:'assistant',content:'Hello Ana.'},{role:'user',content:'What is my name?'}];
const data=requestSchema.parse({messages:conversation,language:'ro'});
const failure=(status:number,code=''):typeof fetch=>async()=>Response.json({error:{code,message:`Do not echo: ${key}`}}, {status});

test('Groq mode selects a production default and status never exposes either key',()=>{process.env.AI_API_KEY=randomUUID();const publicConfig=configuration();assert.equal(publicConfig.mode,'groq');assert.equal(publicConfig.provider,'groq');assert.equal(publicConfig.model,DEFAULT_GROQ_MODEL);assert.equal(publicConfig.configured,true);assert.equal(JSON.stringify(publicConfig).includes(key),false);assert.equal('GROQ_API_KEY' in publicConfig,false);assert.equal('AI_API_KEY' in publicConfig,false)});
test('Groq preserves all session messages and both language instructions; endpoint cannot be redirected by env',async()=>{
 process.env.AI_BASE_URL='https://example.com';
 for(const language of ['ro','en'] as const){const result=await respond({...data,language},async(input,init)=>{assert.equal(input,'https://api.groq.com/openai/v1/chat/completions');assert.equal((init?.headers as Record<string,string>).Authorization,`Bearer ${key}`);const payload=JSON.parse(init!.body as string);assert.deepEqual(payload.messages.slice(1),conversation);assert.match(payload.messages[0].content,language==='ro'?/Romanian/:/English/);assert.equal(payload.model,DEFAULT_GROQ_MODEL);assert.equal(init?.redirect,'error');return Response.json({choices:[{message:{content:language==='ro'?'Te numești Ana.':'Your name is Ana.'}}]})});assert.equal(result.mode,'groq');assert.ok(result.content)}
});
test('demo mode and explicit demo override never call a provider',async()=>{const never:typeof fetch=async()=>{throw Error('unexpected network call')};process.env.AI_MODE='demo';delete process.env.GROQ_API_KEY;assert.equal((await respond(data,never)).mode,'demo');process.env.AI_MODE='groq';assert.equal((await respond({...data,demo:true},never)).mode,'demo')});
test('Groq requires GROQ_API_KEY even when the legacy key exists',async()=>{delete process.env.GROQ_API_KEY;process.env.AI_API_KEY=randomUUID();assert.equal(configuration().configured,false);await assert.rejects(()=>respond(data),e=>e instanceof AIError&&e.code==='missing_key'&&/GROQ_API_KEY/.test(e.message))});
test('provider failures are safe and actionable',async()=>{
 for(const [status,upstream,expected] of [[401,'','invalid_key'],[429,'','rate_limit'],[404,'','model_unavailable'],[400,'model_decommissioned','model_unavailable'],[403,'','access_denied'],[500,'','provider_unavailable'],[400,'','request_rejected']] as const){await assert.rejects(()=>respond(data,failure(status,upstream)),e=>e instanceof AIError&&e.code===expected&&!e.message.includes(key))}
 for(const [error,expected] of [[new TypeError(`private network details ${key}`),'network_error'],[new DOMException('timeout','TimeoutError'),'timeout'],[new DOMException('aborted','AbortError'),'timeout']] as const){await assert.rejects(()=>respond(data,async()=>{throw error}),e=>e instanceof AIError&&e.code===expected&&!e.message.includes(key))}
 await assert.rejects(()=>respond(data,async()=>new Response('not json')),e=>e instanceof AIError&&e.code==='invalid_response');await assert.rejects(()=>respond(data,async()=>Response.json({choices:[]})),e=>e instanceof AIError&&e.code==='empty_response');
});
test('legacy compatible endpoint remains available with live mode',async()=>{process.env.AI_MODE='live';process.env.AI_API_KEY=key;process.env.AI_MODEL='custom-model';process.env.AI_BASE_URL='https://example.com/v1';const reply=await respond(data,async(input,init)=>{assert.equal(input,'https://example.com/v1/chat/completions');assert.equal(JSON.parse(init!.body as string).model,'custom-model');return Response.json({choices:[{message:{content:'Working'}}]})});assert.equal(reply.mode,'live')});
test('chat route returns a friendly missing-key error rather than crashing or falling back to demo',async()=>{delete process.env.GROQ_API_KEY;const response=await POST(new Request('https://jarvis.vercel.app/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}));assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');const body=await response.json();assert.equal(body.code,'missing_key');assert.match(body.error,/GROQ_API_KEY/)});
