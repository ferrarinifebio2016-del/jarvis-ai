import {selectVoice,speechLocale,type VoiceLanguage} from './contracts';
export function speechChunks(text:string):string[] {
 const chunks:string[]=[];let remaining=text.replace(/\s+/g,' ').trim();
 while(remaining){let end=Math.min(220,remaining.length);if(end<remaining.length){const space=remaining.lastIndexOf(' ',end);if(space>0)end=space;}chunks.push(remaining.slice(0,end).trim());remaining=remaining.slice(end).trim();}
 return chunks;
}
/** A small queue avoids very long utterances on mobile. Call only after user opt-in or an explicit playback gesture. */
export function playSpeech(text:string,language:VoiceLanguage,callbacks:{start:()=>void;end:()=>void;error:(message:string)=>void}):()=>void {
 if(typeof window==='undefined'||!('speechSynthesis' in window)){callbacks.error('Speech playback is unavailable in this browser.');return()=>{};}
 const synth=window.speechSynthesis;const chunks=speechChunks(text);let cancelled=false;let timer:ReturnType<typeof setTimeout>|undefined;let utterance:SpeechSynthesisUtterance|undefined;
 synth.cancel();
 const next=()=>{if(cancelled)return;const chunk=chunks.shift();if(!chunk){callbacks.end();return;}
 try {
 utterance=new SpeechSynthesisUtterance(chunk);utterance.lang=speechLocale(language);const voice=selectVoice(synth.getVoices(),language);if(voice)utterance.voice=voice;
 utterance.onstart=()=>{clearTimeout(timer);if(!cancelled)callbacks.start()};
 utterance.onend=()=>{clearTimeout(timer);if(!cancelled)next()};
 utterance.onerror=()=>{clearTimeout(timer);if(!cancelled){cancelled=true;callbacks.error('Playback was blocked or interrupted. Tap Read aloud to retry; your browser may require a direct tap.')}};
 timer=setTimeout(()=>{if(!cancelled){cancelled=true;synth.cancel();callbacks.error('Playback did not start. Tap Read aloud to enable voice on this device.')}},5000);
 synth.speak(utterance);synth.resume();
 } catch {clearTimeout(timer);cancelled=true;synth.cancel();callbacks.error('Speech playback could not start. Tap Read aloud to retry in a supported browser.')}
 };
 next();return()=>{cancelled=true;clearTimeout(timer);synth.cancel();utterance=undefined};
}
