import { NextResponse } from 'next/server';
import { supportInstructions,realtimeTools } from '@/lib/prompts';
export const runtime='nodejs';
export async function POST(req:Request){
 const key=process.env.OPENAI_API_KEY;
 if(!key)return NextResponse.json({error:'OPENAI_API_KEY орнатылмаған. Демо режимі ғана қолжетімді.'},{status:503});
 try{
  const origin=req.headers.get('origin'); if(origin && new URL(origin).host!==req.headers.get('host'))return NextResponse.json({error:'Origin rejected'},{status:403});
  const body=await req.json().catch(()=>({}));const language=body.language==='ru'?'ru':'kk';const voice=['marin','shimmer','coral'].includes(body.voice)?body.voice:'marin';const preview=body.preview===true;
  const res=await fetch('https://api.openai.com/v1/realtime/client_secrets',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({session:{type:'realtime',model:process.env.OPENAI_REALTIME_MODEL||'gpt-realtime-2.1',instructions:preview?'You are testing voice pronunciation. Speak the provided short passage in its language, with a gentle warm pace. Do not add commentary, medical advice, or extra words.':supportInstructions+`\nCurrent language: ${language==='ru'?'Russian':'Kazakh'}. If the user hasn't yet answered which language they prefer, ask them first.`,audio:{output:{voice},input:{transcription:{model:'gpt-transcribe'},turn_detection:{type:'server_vad'}}},...(preview?{}:{tools:realtimeTools,tool_choice:'auto'})}}),signal:AbortSignal.timeout(15000)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){console.error('Realtime token error',res.status,JSON.stringify(data).slice(0,320));return NextResponse.json({error:'Дауыстық AI сессиясын бастау мүмкін болмады.'},{status:502});}
  return NextResponse.json({value:data.value},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Token request failed',e);return NextResponse.json({error:'Дауыс қызметіне қосылу мүмкін болмады.'},{status:500});}
}
