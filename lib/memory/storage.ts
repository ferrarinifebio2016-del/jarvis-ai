import type { Message } from '../ai/core';
export type Conversation={id:string;title:string;messages:Message[]};
export const STORAGE_KEY='jarvis.conversations.v1';
export function readConversations(raw:string|null):Conversation[]{try{const data=JSON.parse(raw||'[]');if(!Array.isArray(data))return [];return data.filter(c=>typeof c.id==='string'&&typeof c.title==='string'&&Array.isArray(c.messages)&&c.messages.every((m:Message)=>typeof m.id==='string'&&['user','assistant'].includes(m.role)&&typeof m.content==='string')).slice(0,30);}catch{return []}}
