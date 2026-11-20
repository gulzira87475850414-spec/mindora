'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,Check,Headphones,Play,Square,Volume2,Globe2,ShieldCheck} from 'lucide-react';
import './voice-test.css';

type Voice = 'marin'|'shimmer'|'coral';
type Lang = 'kk'|'ru';
const choices:{id:Voice;label:string;description:string}[]=[
 {id:'marin',label:'Marin',description:'Жылы әрі анық дауыс'},
 {id:'shimmer',label:'Shimmer',description:'Нәзік, жұмсақ дауыс'},
 {id:'coral',label:'Coral',description:'Жанды, ашық интонация'},
];
const samples:Record<Lang,string>={
 kk:'Сәлем, досым! Мен Миндорамын. Әңгімемізді қазақша жалғастырайық. Қазір көңіл күйің қандай? Өзіңе уақыт бөліп, терең тыныс ал. Үмітіңді үзбе, мен сені тыңдауға дайынмын.',
 ru:'Привет, мой друг! Я Миндора. Мне важно, чтобы тебе было спокойно и удобно. Как ты себя чувствуешь сегодня? Я могу выслушать тебя, не торопясь.',
};
export default function VoiceTest(){
 const [selected,setSelected]=useState<Voice>('marin');
 const [language,setLanguage]=useState<Lang>('kk');
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 const audioRef=useRef<HTMLAudioElement|null>(null);
 const pcRef=useRef<RTCPeerConnection|null>(null);
 const channelRef=useRef<RTCDataChannel|null>(null);
 const seqRef=useRef(0);
 useEffect(()=>{try{const v=localStorage.getItem('mindora-voice');if(v==='marin'||v==='shimmer'||v==='coral')setSelected(v);const l=localStorage.getItem('mindora-language');if(l==='kk'||l==='ru')setLanguage(l);}catch{}},[]);
 const stop=useCallback(()=>{
   seqRef.current++;
   try{channelRef.current?.close();pcRef.current?.close();if(audioRef.current){audioRef.current.pause();audioRef.current.srcObject=null;}}catch{}
   channelRef.current=null;pcRef.current=null;setBusy(false);
 },[]);
 useEffect(()=>()=>{stop()},[stop]);
 const test=async()=>{
   if(busy)return;
   stop(); const n=seqRef.current;setBusy(true);setError('');setStatus(language==='kk'?'Дауыс қосылып жатыр…':'Подключение голоса…');
   let pc:RTCPeerConnection|null=null;
   try{
     const tokenRes=await fetch('/api/realtime-token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,voice:selected,preview:true})});
     const token=await tokenRes.json(); if(!tokenRes.ok||!token.value)throw Error(token.error||'API token unavailable');
     if(n!==seqRef.current)return;
     pc=new RTCPeerConnection(); pcRef.current=pc;
     pc.addTransceiver('audio',{direction:'recvonly'});
     pc.addEventListener('track',(e)=>{if(audioRef.current){audioRef.current.srcObject=e.streams[0];audioRef.current.play().catch(()=>setError(language==='kk'?'Дыбысты қосу үшін «Тыңдау» батырмасын қайта басыңыз.':'Нажмите «Прослушать» ещё раз.'));}});
     const dc=pc.createDataChannel('oai-events');channelRef.current=dc;
     dc.addEventListener('open',()=>{
       if(n!==seqRef.current)return;
       setBusy(false);setStatus(language==='kk'?'Үлгі мәтінді тыңдаңыз':'Слушайте образец');
       // No microphone/camera. We only request this fixed synthetic text, not student information.
       dc.send(JSON.stringify({type:'response.create',response:{instructions:`In ${language==='kk'?'Kazakh':'Russian'}, read aloud exactly this text, with beautiful warm natural diction. Do not explain or preface it. Text: ${samples[language]}`}}));
     });
     dc.addEventListener('message',(e)=>{
       try{const evt=JSON.parse(e.data);
         if(evt.type==='response.done'){setStatus(language==='kk'?'Үлгі аяқталды • Қайта тыңдауға болады':'Готово • Можно прослушать снова');setBusy(false);}
         if(evt.type==='error'){setError(language==='kk'?'Дыбыс шығаруда қате. Басқа дауысты тексеріңіз.':'Не удалось воспроизвести голос.');setBusy(false);}
       }catch{}
     });
     pc.addEventListener('connectionstatechange',()=>{if(pc?.connectionState==='failed')setError('WebRTC connection failed');});
     const offer=await pc.createOffer();await pc.setLocalDescription(offer);
     const sdp=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{'Authorization':`Bearer ${token.value}`,'Content-Type':'application/sdp'},body:offer.sdp});
     if(!sdp.ok)throw Error(`WebRTC connection: ${sdp.status}`);
     const answer=await sdp.text();if(n!==seqRef.current){pc.close();return;}
     await pc.setRemoteDescription({type:'answer',sdp:answer});
   }catch(e){if(n===seqRef.current){setError(e instanceof Error?e.message:String(e));stop();}else pc?.close();}
 };
 const choose=(v:Voice)=>{stop();setSelected(v);setStatus('');setError('');};
 const apply=()=>{try{localStorage.setItem('mindora-voice',selected);}catch{}window.location.href='/';};
 return <main className="vl-wrap">
  <div className="vl-aura"/>
  <nav className="vl-top"><a href="/" onClick={stop}><ArrowLeft size={18}/> Mindora</a><span className="vl-tag"><Headphones size={15}/> Voice Lab</span></nav>
  <header className="vl-head"><div className="vl-eyebrow">MINDORA • ДАУЫС СЫНАУ</div><h1>Mindora қандай дауыспен сөйлесін?</h1><p>Үш дауысты бірдей мәтінмен тыңдап, қазақ тіліндегі дыбыстардың айтылуын салыстырыңыз.</p></header>
  <div className="vl-grid">
   <section className="vl-photo"><img src="/media/counselor-cutout.png" alt="Mindora виртуалды кеңесші"/><div className="vl-wave" aria-hidden="true">{Array.from({length:23},(_,i)=><i key={i} style={{height:`${12+28*Math.abs(Math.sin(i*0.62))}px`,animationDelay:`${i*38}ms`}}/>)}</div></section>
   <section className="vl-panel"><div className="vl-label"><Globe2 size={17}/> Сынақ тілі</div><div className="vl-tabs"><button className={language==='kk'?'active':''} onClick={()=>{stop();setLanguage('kk')}}>Қазақша</button><button className={language==='ru'?'active':''} onClick={()=>{stop();setLanguage('ru')}}>Русский</button></div>
    <div className="vl-label">Дауысты таңдаңыз</div><div className="vl-choices">{choices.map(v=><button key={v.id} className={'vl-choice '+(selected===v.id?'active':'')} onClick={()=>choose(v.id)}><span><strong>{v.label}</strong><small>{v.description}</small></span>{selected===v.id&&<Check size={18}/>}</button>)}</div>
    <div className="vl-label">Барлық дауыс үшін бір мәтін</div><div className="vl-script">{samples[language]}</div>
    <div className="vl-actions"><button className="vl-play" disabled={busy} onClick={test}><Play size={19}/>{busy?'Қосылып жатыр…':'Дауысты тыңдау'}</button><button className="vl-stop" onClick={()=>{stop();setStatus('Тоқтатылды')}}><Square size={16}/> Тоқтату</button></div>
    <p className="vl-status" aria-live="polite">{error||status||'Микрофон қажет емес. Тек Mindora дауысын тыңдайсыз.'}</p>
    <button className="vl-save" onClick={apply}><Check size={18}/> {selected} дауысын Mindora үшін таңдау</button>
    <p className="vl-note"><ShieldCheck size={17}/> Дыбыс OpenAI Realtime API арқылы жасалады және API балансынан ақы алынуы мүмкін. Бұл бет микрофонды, камераны қоспайды. Дауыс өзгерісі келесі сөйлесу сессиясында іске қосылады.</p>
   </section>
  </div><audio ref={audioRef} autoPlay playsInline/><footer className="vl-footer">Mindora — AI қолдаушы, кәсіби психологтың орнына жүрмейді.</footer>
 </main>
}
