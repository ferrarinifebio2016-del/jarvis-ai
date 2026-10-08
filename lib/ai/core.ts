import { z } from 'zod';
export const requestSchema=z.object({messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().trim().min(1).max(12000)})).min(1).max(60),language:z.enum(['en','ro']).default('en'),demo:z.boolean().default(false)});
export type Message={id:string;role:'user'|'assistant';content:string;createdAt:string};
export function demoReply(input:string,language:'en'|'ro'){
 if(language==='ro') return `Sunt JARVIS, în modul demonstrativ. Am primit: „${input.slice(0,300)}”.\n\nPot să te ajut să organizezi idei și să pregătești un plan. Începe prin a defini obiectivul, apoi împarte-l în trei pași mici și alege primul pas pentru astăzi.\n\nAcesta este un răspuns demonstrativ. Configurează un furnizor AI pe server pentru conversații reale.`;
 if(/plan|day|focus/i.test(input))return 'Let’s make room for what matters.\n\n1. Choose one outcome you want to finish today.\n2. Reserve a 45-minute focus block and silence distractions.\n3. Break the outcome into three small steps. Start with the easiest.\n\nWhat is your most important outcome?\n\nDemo response · Connect an AI provider for personalized reasoning.';
 return `I’m here and ready. You asked: “${input.slice(0,300)}”.\n\nIn demo mode, I can show you how the workspace feels. Try planning your day, exploring an idea, or switching to Romanian. Connect your server-side AI provider to unlock real conversations. `;
}
