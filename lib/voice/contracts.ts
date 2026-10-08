export type VoiceLanguage = 'en' | 'ro';
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
export const speechLocale = (language: VoiceLanguage) => language === 'ro' ? 'ro-RO' : 'en-US';
export function mergeTranscript(draft: string, transcript: string) { return [draft.trim(), transcript.trim()].filter(Boolean).join(' ').slice(0, 12000); }
export function selectVoice<T extends {lang: string; default?: boolean}>(voices: T[], language: VoiceLanguage): T | undefined {
 const locale = speechLocale(language).toLowerCase();
 return voices.find(v => v.lang.toLowerCase() === locale) || voices.find(v => v.lang.toLowerCase().split('-')[0] === language);
}
export function recognitionError(code: string): string {
 const errors: Record<string,string> = {
  'not-allowed': 'Microphone permission was denied. Allow microphone access in browser/site settings, then try again.',
  'service-not-allowed': 'Your browser blocked speech recognition. Check site permissions or use text chat.',
  'audio-capture': 'No microphone is available. Check your device and microphone settings.',
  'no-speech': 'No speech was detected. Tap the microphone and try again.',
  network: 'Speech recognition could not connect. Check your connection or use text chat.',
  'language-not-supported': 'This browser does not support recognition for the selected language. Try another browser or type your message.',
 };
 return errors[code] || 'Voice input failed. Please try again or use text chat.';
}
/** Extension point: a future authenticated server adapter can transcribe ephemeral audio (e.g. Groq Whisper). No implementation or key is bundled in the client. */
export interface SpeechToTextProvider { transcribe(audio: Blob, language: VoiceLanguage, signal: AbortSignal): Promise<string> }
/** Future foreground wake-word engines must report actual microphone activity and stop on page hiding. No always-listening engine is currently installed. */
export interface WakeWordProvider { readonly foregroundOnly: true; start(onWake: () => void, signal: AbortSignal): Promise<void>; stop(): void }
export const wakeWordCapability = {available: false, reason: 'Wake word is not enabled. Use the microphone button for explicit, foreground listening.'} as const;
