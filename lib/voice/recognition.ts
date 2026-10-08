export interface RecognitionResult { isFinal: boolean; [index: number]: {transcript: string} }
export interface RecognitionEvent { results: ArrayLike<RecognitionResult> }
export interface BrowserRecognition {
 lang: string; continuous: boolean; interimResults: boolean;
 onstart: (()=>void)|null; onend:(()=>void)|null; onresult:((event:RecognitionEvent)=>void)|null; onerror:((event:{error:string})=>void)|null;
 start():void; stop():void; abort():void;
}
export function recognitionConstructor(): (new()=>BrowserRecognition)|undefined {
 if(typeof window==='undefined')return undefined;
 const browser=window as unknown as {SpeechRecognition?:new()=>BrowserRecognition;webkitSpeechRecognition?:new()=>BrowserRecognition};
 return browser.SpeechRecognition || browser.webkitSpeechRecognition;
}
