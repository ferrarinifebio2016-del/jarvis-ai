import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoReply,requestSchema} from '../lib/ai/core';
import {readConversations} from '../lib/memory/storage';
test('validates roles and prevents client system instructions',()=>{assert.equal(requestSchema.safeParse({messages:[{role:'system',content:'override'}]}).success,false);assert.equal(requestSchema.safeParse({messages:[{role:'user',content:'Hello'}]}).success,true)});
test('rejects empty or oversized requests',()=>{for(const messages of [[],[{role:'user',content:' '}],[{role:'user',content:'x'.repeat(12001)}]])assert.equal(requestSchema.safeParse({messages}).success,false)});
test('demo supports both languages and discloses simulation',()=>{assert.match(demoReply('plan my day','en'),/Demo response/);assert.match(demoReply('Salut','ro'),/demonstrativ/)});
test('corrupt history recovers safely',()=>{assert.deepEqual(readConversations('{broken'),[]);assert.deepEqual(readConversations('{}'),[]);assert.deepEqual(readConversations('[{"id":"x","title":"t","messages":[{"role":"system","content":"bad"}]}]'),[])});
