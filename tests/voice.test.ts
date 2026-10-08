import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeTranscript,selectVoice,speechLocale,recognitionError,wakeWordCapability} from '../lib/voice/contracts';
import {speechChunks} from '../lib/voice/speech';
test('recognition locales and voice choice support Romanian and English',()=>{
 assert.equal(speechLocale('ro'),'ro-RO');assert.equal(speechLocale('en'),'en-US');
 const voices=[{lang:'en-GB'},{lang:'ro-RO'},{lang:'en-US'}];assert.equal(selectVoice(voices,'ro'),voices[1]);assert.equal(selectVoice(voices,'en'),voices[2]);assert.equal(selectVoice([{lang:'ro-MD'}],'ro')?.lang,'ro-MD');assert.equal(selectVoice([{lang:'fr-FR'}],'ro'),undefined);
});
test('transcription preserves a draft and respects the API input limit',()=>{assert.equal(mergeTranscript('Existing idea','Salut lume'),'Existing idea Salut lume');assert.equal(mergeTranscript('', ' hello '),'hello');assert.equal(mergeTranscript('a'.repeat(11999),'more').length,12000)});
test('mobile speech chunks preserve content and remain short',()=>{const input=('Salut! This is a sentence.\n').repeat(50);const chunks=speechChunks(input);assert.ok(chunks.every(c=>c.length<=220));assert.equal(chunks.join(' '),input.replace(/\s+/g,' ').trim());assert.equal(speechChunks('x'.repeat(500)).join(''),'x'.repeat(500));assert.deepEqual(speechChunks('  '),[])});
test('denied permission and missing support have useful recovery; wake word is not faked',()=>{assert.match(recognitionError('not-allowed'),/permission was denied/);assert.match(recognitionError('network'),/text chat/);assert.equal(wakeWordCapability.available,false)});
