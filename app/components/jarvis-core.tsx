import { AudioLines, BrainCircuit, Cpu, Mic, MicOff } from 'lucide-react';
import type { CSSProperties } from 'react';
import type {VoiceState} from '@/lib/voice/contracts';

export function JarvisCore({compact,state,language,micActive}:{compact:boolean;state:VoiceState;language:'en'|'ro';micActive:boolean}) {
 const thinking=state==='processing',speaking=state==='speaking',listening=state==='listening';
 const label=state==='error'?(language==='ro'?'EROARE VOCALĂ':'VOICE ERROR'):listening?(language==='ro'?'ASCULT · MICROFON ACTIV':'LISTENING · MICROPHONE ACTIVE'):thinking?(language==='ro'?'PROCESEZ':'PROCESSING'):speaking?(language==='ro'?'REDARE VOCALĂ':'VOICE OUTPUT'):(language==='ro'?'ÎN AȘTEPTARE':'AWAITING YOUR COMMAND');
 return <section className={`hudscene ${compact?'compact':''} ${thinking||speaking||listening?'engaged':''} state-${state}`} aria-label="JARVIS intelligence core">
  <div className="coreannotation annotationleft"><span>NEURAL INTERFACE</span><strong>J.A.R.V.I.S.</strong><div className="annotationline"/><small>PERSONAL INTELLIGENCE</small></div>
  <div className="core" aria-hidden="true"><div className="corehalo"/><div className="orbit orbit1"/><div className="orbit orbit2"/><div className="orbit orbit3"/><div className="orbit orbit4"/><div className="orbit orbit5"/><div className="corecenter"><div className="coremesh"/><AudioLines size={56} strokeWidth={1}/><span>JARVIS</span></div><span className="corepoint"/><span className="corecross cross1"/><span className="corecross cross2"/></div>
  <div className="coreannotation annotationright"><span>INTERFACE STATE</span><strong>{state.toUpperCase()}</strong><div className="annotationline"/><small>{micActive?'MICROPHONE ACTIVE':speaking?'SPEECH PLAYBACK':'MICROPHONE OFF'}</small></div>
  <div className="voiceline"><span className="wavecaption">{label}</span><div className={`waveform ${speaking||listening?'speaking':''} ${thinking?'thinkingwave':''}`} aria-hidden="true">{Array.from({length:39},(_,i)=><i key={i} style={{'--height':`${5+((i*17+11)%31)}px`,'--delay':`${(i%9)*-.13}s`} as CSSProperties}/>)}</div></div>
 </section>
}
export function HudStatus({ai,memory,system,warning,microphone,micActive}:{ai:string;memory:string;system:string;warning:boolean;microphone:string;micActive:boolean}) {
 return <div className="hudstatus" aria-label="System status"><div className={warning?'warning':''}><Cpu size={15}/><span>AI ENGINE<strong>{ai}</strong></span><i/></div><div className={micActive?'micstatusactive':'inactive'}>{micActive?<Mic size={15}/>:<MicOff size={15}/>}<span>MICROPHONE<strong>{microphone}</strong></span><i/></div><div><BrainCircuit size={15}/><span>MEMORY<strong>{memory}</strong></span><i/></div><div className={warning?'warning':''}><AudioLines size={15}/><span>SYSTEM<strong>{system}</strong></span><i/></div></div>
}
