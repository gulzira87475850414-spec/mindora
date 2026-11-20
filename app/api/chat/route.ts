import { NextResponse } from 'next/server';
import { supportInstructions } from '@/lib/prompts';
export const runtime='nodejs';
export const maxDuration=30;
type Msg={role:'user'|'assistant';content:string};
const demo = (language:string, text:string)=>{
 const t=text.toLocaleLowerCase(); const ru=language==='ru';
 if(/тыныс|дем ал|breath|дыхани/.test(t))return ru?'Попробуем короткое дыхательное упражнение. Открой раздел «Дыхание».':'Қаласаң, тыныс алу жаттығуын бірге жасайық. «Тыныс алу» бөліміне өт.';
 if(/психолог|маман|специалист/.test(t))return ru?'Можно обратиться к специалисту. Нажми «Найти психолога», чтобы посмотреть варианты на карте.':'Кәсіби маманмен сөйлесу пайдалы болуы мүмкін. «Психолог табу» бөлімін ашып, картадан іздеп көр.';
 if(/орыс|русск/.test(t))return 'Конечно, можем продолжить на русском. Что тебя беспокоит?';
 if(/қазақ|казах/.test(t))return 'Әрине, қазақша сөйлесейік. Қазір өзіңді қалай сезініп тұрсың?';
 return ru?'Я рядом и готова тебя выслушать. Что сейчас беспокоит больше всего?':'Мен сені тыңдауға дайынмын. Қазір сені ең көп мазалайтын не?';
};
export async function POST(req:Request){
 try{
  const origin=req.headers.get('origin'); if(origin && new URL(origin).host!==req.headers.get('host')) return NextResponse.json({error:'Origin rejected'},{status:403});
  const body=await req.json();
  const language=body.language==='ru'?'ru':'kk';
  const raw=Array.isArray(body.messages)?body.messages:[];
  const messages:Msg[]=raw.slice(-12).filter((m:unknown):m is Msg=>!!m&&typeof m==='object'&&'role' in m&&'content' in m&&(m.role==='user'||m.role==='assistant')&&typeof m.content==='string').map((m:Msg)=>({role:m.role,content:m.content.slice(0,2000)}));
  if(!messages.length||messages[messages.length-1].role!=='user')return NextResponse.json({error:'Invalid message'},{status:400});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({answer:demo(language,messages[messages.length-1].content),demo:true});
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_TEXT_MODEL||'gpt-5.4-mini',instructions:supportInstructions+`\nUser selected language: ${language==='ru'?'Russian':'Kazakh'}.`,input:messages,store:false,max_output_tokens:350}),signal:AbortSignal.timeout(26000)});
  if(!res.ok){const details=await res.text(); console.error('Chat API error',res.status,details.slice(0,240));return NextResponse.json({error:'AI қызметі уақытша қолжетімсіз.'},{status:502});}
  const data=await res.json(); const answer=(data.output||[]).flatMap((o:{content?:{type:string;text?:string}[]})=>o.content||[]).filter((c:{type:string})=>c.type==='output_text').map((c:{text?:string})=>c.text||'').join('\n').trim();
  return NextResponse.json({answer:answer||demo(language,messages[messages.length-1].content),demo:false});
 }catch(e){console.error('Chat route failed',e);return NextResponse.json({error:'Байланыс орнатылмады. Қайта көріңіз.'},{status:500});}
}
