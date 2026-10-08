'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {recognitionConstructor,type BrowserRecognition} from './recognition';
import {recognitionError,speechLocale,type VoiceLanguage} from './contracts';
import {playSpeech} from './speech';

export function useVoice(language:VoiceLanguage,onTranscript:(text:string)=>void){
 const [supported,setSupported]=useState(false),[playbackSupported,setPlaybackSupported]=useState(false),[active,setActive]=useState(false),[starting,setStarting]=useState(false),[processing,setProcessing]=useState(false),[speaking,setSpeaking]=useState(false),[pendingSpeech,setPendingSpeech]=useState(false),[interim,setInterim]=useState(''),[error,setError]=useState(''),[enabled,setEnabled]=useState(false),[autoSend,setAutoSend]=useState(false);
 const recognition=useRef<BrowserRecognition|null>(null),epoch=useRef(0),startBusy=useRef(false),cancelPlayback=useRef<(()=>void)|null>(null),transcriptCallback=useRef(onTranscript),enabledRef=useRef(false);
 transcriptCallback.current=onTranscript;
 const stopSpeaking=useCallback(()=>{cancelPlayback.current?.();cancelPlayback.current=null;setSpeaking(false);setPendingSpeech(false)},[]);
 const cancelInput=useCallback(()=>{epoch.current++;startBusy.current=false;const engine=recognition.current;recognition.current=null;if(engine){engine.onstart=null;engine.onresult=null;engine.onend=null;engine.onerror=null;try{engine.abort()}catch{}}setActive(false);setStarting(false);setProcessing(false);setInterim('')},[]);
 const cancelAll=useCallback(()=>{cancelInput();stopSpeaking()},[cancelInput,stopSpeaking]);
 useEffect(()=>{setSupported(!!recognitionConstructor());setPlaybackSupported('speechSynthesis' in window);const hide=()=>{if(document.hidden)cancelAll()};document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',cancelAll);return()=>{document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',cancelAll);cancelAll()}},[cancelAll]);
 useEffect(()=>{cancelAll()},[language,cancelAll]);
 const read=useCallback((text:string,locale:VoiceLanguage=language)=>{cancelInput();stopSpeaking();setError('');setPendingSpeech(true);cancelPlayback.current=playSpeech(text,locale,{start:()=>{setPendingSpeech(false);setSpeaking(true)},end:()=>{setPendingSpeech(false);setSpeaking(false)},error:message=>{setPendingSpeech(false);setSpeaking(false);setError(message)}})},[language,stopSpeaking,cancelInput]);
 const toggleVoice=()=>{enabledRef.current=!enabledRef.current;setEnabled(enabledRef.current);setError('');if(!enabledRef.current)stopSpeaking();else read(language==='ro'?'Răspunsurile vocale sunt activate.':'Voice responses are enabled.')};
 const readAutomatically=(text:string,locale:VoiceLanguage)=>{if(enabledRef.current&&!document.hidden)read(text,locale)};
 const start=async()=>{
  if(startBusy.current||recognition.current)return;
  setError('');stopSpeaking();const Constructor=recognitionConstructor();
  if(!Constructor){setError('Speech recognition is unavailable in this browser. Try Chrome/Edge or supported Safari on HTTPS. Text chat remains available.');return;}
  if(!window.isSecureContext){setError('Microphone access requires HTTPS (or localhost). Open your secure deployment to use voice input.');return;}
  const token=++epoch.current;startBusy.current=true;setStarting(true);let finalText='';let failed=false;
  try{
   // Request permission from an explicit tap. Release the probe immediately; recognition owns its own microphone session.
   if(navigator.mediaDevices?.getUserMedia){const probe=await navigator.mediaDevices.getUserMedia({audio:true});probe.getTracks().forEach(track=>track.stop());}
   if(token!==epoch.current)return;
   const engine=new Constructor();recognition.current=engine;engine.lang=speechLocale(language);engine.continuous=false;engine.interimResults=true;
   engine.onstart=()=>{if(token!==epoch.current)return;setStarting(false);setActive(true)};
   engine.onresult=event=>{if(token!==epoch.current)return;let live='';finalText='';for(let i=0;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)finalText+=result[0].transcript+' ';else live+=result[0].transcript+' ';}setInterim((finalText+live).trim())};
   engine.onerror=event=>{if(token!==epoch.current)return;failed=true;cancelInput();setError(recognitionError(event.error))};
   engine.onend=()=>{if(token!==epoch.current)return;recognition.current=null;startBusy.current=false;setActive(false);setStarting(false);setProcessing(false);setInterim('');if(!failed&&finalText.trim())transcriptCallback.current(finalText.trim());else if(!failed)setError('No speech was detected. Tap the microphone and try again.')};
   engine.start();
  }catch(err){if(token!==epoch.current)return;cancelInput();const name=err instanceof Error?err.name:'';setError(name==='NotAllowedError'?recognitionError('not-allowed'):name==='NotFoundError'?recognitionError('audio-capture'):'Unable to start voice input. Check microphone access and try again.');}
 };
 const stop=()=>{if(starting){cancelInput();return;}const engine=recognition.current;if(!engine)return;setProcessing(true);try{engine.stop()}catch{cancelInput()}};
 return {supported,playbackSupported,active,starting,processing,speaking,pendingSpeech,interim,error,enabled,autoSend,setAutoSend,toggleVoice,start,stop,cancelInput,cancelAll,stopSpeaking,read,readAutomatically,clearError:()=>setError('')};
}
