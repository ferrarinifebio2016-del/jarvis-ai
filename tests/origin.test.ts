import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isSameOrigin} from '../lib/ai/origin';

test('accepts browser authority when Next uses its bind hostname',()=>{
 assert.equal(isSameOrigin(new Request('http://0.0.0.0:3000/api/chat',{headers:{host:'localhost:3000',origin:'http://localhost:3000'}})),true);
 assert.equal(isSameOrigin(new Request('http://internal/api/chat',{headers:{host:'jarvis.vercel.app',origin:'https://jarvis.vercel.app'}})),true);
});
test('rejects external, malformed, and different-port origins',()=>{
 for(const origin of ['https://evil.example','null','http://localhost:4000','ftp://localhost:3000','http://user:pass@localhost:3000'])assert.equal(isSameOrigin(new Request('http://0.0.0.0:3000/api/chat',{headers:{host:'localhost:3000',origin}})),false);
});
