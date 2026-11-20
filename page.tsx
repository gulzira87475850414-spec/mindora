'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supportInstructions } from '@/lib/prompts';
import { AudioLines, ArrowLeft, Bot, CalendarDays, Camera, CameraOff, Check, ChevronRight, CircleHelp, ExternalLink, Flower2, Globe2, Headphones, Heart, HeartHandshake, Home, Info, Leaf, LocateFixed, MapPin, MessageCircle, Mic, MicOff, Moon, Pause, Play, RotateCcw, Send, Settings2, ShieldCheck, Sparkles, Sun, Volume2, VolumeX, Waves, Wind, X } from 'lucide-react';

type Page='talk'|'space'|'breath'|'experts';
type Lang='kk'|'ru';
type Avatar='human'|'robot';
type Scene='rain'|'stars'|'lake';
type Message={role:'user'|'assistant';content:string};
type Connection='off'|'connecting'|'on';
const scenes:{id:Scene;kk:string;ru:string;icon:string;image:string}[]=[
 {id:'rain',kk:'Жаңбырлы орман',ru:'Дождливый лес',icon:'☔',image:'/media/rain.webp'},
 {id:'stars',kk:'Жұлдызды аспан',ru:'Звёздное небо',icon:'✦',image:'/media/stars.webp'},
 {id:'lake',kk:'Тынық көл',ru:'Тихое озеро',icon:'〰',image:'/media/lake.webp'}
];
const moods=[{kk:'Жақсы',ru:'Хорошо',emoji:'😊'},{kk:'Сабырлы',ru:'Спокойно',emoji:'🌿'},{kk:'Мазасыз',ru:'Тревожно',emoji:'☁️'},{kk:'Шаршаңқы',ru:'Устал(а)',emoji:'🌙'}];

function Lotus({size=40}:{size?:number}){return <span className="lotus-mark" style={{fontSize:size}} aria-hidden="true">❀</span>}
function RobotFace(){return <div className="robot-avatar"><div className="robot-antenna"/><div className="robot-head"><span className="robot-eye"/><span className="robot-eye"/><span className="robot-mouth"/></div><div className="robot-body"><div className="robot-heart">♥</div></div></div>}
function SoundWave({live=false}:{live?:boolean}){return <div className={'sound-wave'+(live?' sound-wave-live':'')} aria-hidden="true">{Array.from({length:37},(_,i)=><i key={i} style={{height:`${11+Math.round((Math.abs(Math.sin(i*0.38))*27+Math.abs(Math.cos(i*0.13))*28))}px`,animationDelay:`${i*38}ms`}}/>)}</div>}

export default function Mindora(){
 const [page,setPage]=useState<Page>('talk');
 const [language,setLanguage]=useState<Lang>('kk');
 const [avatar,setAvatar]=useState<Avatar>('human');
 const [languageAsked,setLanguageAsked]=useState(false);
 const [dark,setDark]=useState(false);
 const [settings,setSettings]=useState(false);
 const [mood,setMood]=useState<string>('');
 const [cameraOn,setCameraOn]=useState(false);
 const [scene,setScene]=useState<Scene>('stars');
 const [ambientOn,setAmbientOn]=useState(false);
 const [ambientVol,setAmbientVol]=useState(28);
 const [breathing,setBreathing]=useState(false);
 const [breathTicks,setBreathTicks]=useState(0);
 const [connection,setConnection]=useState<Connection>('off');
 const [voiceStatus,setVoiceStatus]=useState('');
 const [voiceError,setVoiceError]=useState('');
 const [draft,setDraft]=useState('');
 const [sending,setSending]=useState(false);
 const [chatOpen,setChatOpen]=useState(false);
 const [messages,setMessages]=useState<Message[]>([]);
 const [demo,setDemo]=useState<boolean|null>(null);
 const [city,setCity]=useState('');
 const [coords,setCoords]=useState<{lat:number;lon:number}|null>(null);
 const [geoStatus,setGeoStatus]=useState('');
 const cameraRef=useRef<HTMLVideoElement|null>(null);
 const mobileCameraRef=useRef<HTMLVideoElement|null>(null);
 const cameraStreamRef=useRef<MediaStream|null>(null);
 const pcRef=useRef<RTCPeerConnection|null>(null);
 const audioStreamRef=useRef<MediaStream|null>(null);
 const dataChannelRef=useRef<RTCDataChannel|null>(null);
 const audioRef=useRef<HTMLAudioElement|null>(null);
 const endRef=useRef<HTMLDivElement|null>(null);
 const audioContextRef=useRef<AudioContext|null>(null);
 const ambientSourceRef=useRef<AudioBufferSourceNode|null>(null);
 const ambientGainRef=useRef<GainNode|null>(null);
 const tr=(kk:string,ru:string)=>language==='kk'?kk:ru;
 const currentScene=scenes.find(s=>s.id===scene)!;
 const currentMood=moods.find(m=>m.kk===mood);
 const firstGreeting=tr('Сәлем, досым! 💜','Привет, друг! 💜');
 const phase=breathTicks%14;
 const phaseIndex=phase<4?0:phase<8?1:2;
 const phaseSeconds=phaseIndex===0?4-phase:phaseIndex===1?8-phase:14-phase;
 const phaseLabels=language==='kk'?['Тыныс ал','Ұстап тұр','Дем шығар']:['Вдох','Задержи','Выдох'];
 const totalCycles=Math.floor(breathTicks/14);

 useEffect(()=>{
  try{const lang=localStorage.getItem('mindora-language');if(lang==='kk'||lang==='ru'){setLanguage(lang);setLanguageAsked(true);}const ava=localStorage.getItem('mindora-avatar');if(ava==='human'||ava==='robot')setAvatar(ava);}catch{}
 },[]);
 const changeLang=(l:Lang)=>{setLanguage(l);setLanguageAsked(true);try{localStorage.setItem('mindora-language',l);}catch{};if(dataChannelRef.current?.readyState==='open')dataChannelRef.current.send(JSON.stringify({type:'session.update',session:{instructions:supportInstructions+`\nContinue the existing conversation naturally in ${l==='kk'?'Kazakh':'Russian'}. Respect the student's preferred language.`}}));};
 const changeAvatar=(a:Avatar)=>{setAvatar(a);try{localStorage.setItem('mindora-avatar',a);}catch{}};
 useEffect(()=>{if(!breathing)return;const timer=window.setInterval(()=>setBreathTicks(v=>v+1),1000);return()=>clearInterval(timer)},[breathing]);
 useEffect(()=>{
  const stream = cameraOn ? cameraStreamRef.current : null;
  for (const video of [cameraRef.current,mobileCameraRef.current]) {
    if(!video) continue;
    if(video.srcObject !== stream) video.srcObject = stream;
    if(stream) video.play().catch(()=>{});
  }
 },[cameraOn,page]);
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages.length,chatOpen]);

 const stopAmbient=useCallback(()=>{try{ambientSourceRef.current?.stop();ambientSourceRef.current?.disconnect();ambientGainRef.current?.disconnect();audioContextRef.current?.close();}catch{}ambientSourceRef.current=null;ambientGainRef.current=null;audioContextRef.current=null;setAmbientOn(false)},[]);
 const startAmbient=async()=>{
  try{
   stopAmbient();const ctx=new AudioContext();await ctx.resume();const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);const data=buffer.getChannelData(0);
   let last=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=(last+0.025*white)/1.025;data[i]=(last*3.6+white*.12)*.3;}
   const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=scene==='rain'?1250:scene==='lake'?760:510;
   const gain=ctx.createGain();gain.gain.value=ambientVol/100*.10;source.connect(filter).connect(gain).connect(ctx.destination);source.start();audioContextRef.current=ctx;ambientSourceRef.current=source;ambientGainRef.current=gain;setAmbientOn(true);
  }catch{setVoiceError(tr('Дыбысты қосу үшін экранды басып қайта көріңіз.','Нажмите на экран и повторите попытку включить звук.'));}
 };
 useEffect(()=>{if(ambientGainRef.current)ambientGainRef.current.gain.value=ambientVol/100*.10},[ambientVol]);
 useEffect(()=>{if(!ambientOn)return;stopAmbient(); /* scene sound must be re-enabled intentionally */},[scene]); // eslint-disable-line react-hooks/exhaustive-deps

 const toggleCamera=async()=>{
  if(cameraOn){
   cameraStreamRef.current?.getTracks().forEach(t=>t.stop());cameraStreamRef.current=null;
   for (const video of [cameraRef.current,mobileCameraRef.current]) if(video) video.srcObject=null;
   setCameraOn(false);return;
  }
  try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});cameraStreamRef.current=stream;setCameraOn(true);}catch{setVoiceError(tr('Камера қосылмады. Рұқсатты тексеріңіз.','Камера не включилась. Проверьте разрешение.'));}
 };
 const stopVoice=useCallback(()=>{
  try{dataChannelRef.current?.close();pcRef.current?.close();audioStreamRef.current?.getTracks().forEach(t=>t.stop());if(audioRef.current){audioRef.current.pause();audioRef.current.srcObject=null;}}catch{}
  dataChannelRef.current=null;pcRef.current=null;audioStreamRef.current=null;setConnection('off');setVoiceStatus('');
 },[]);
 const selectPage=(p:Page)=>{setPage(p);setSettings(false);if(p==='breath')setChatOpen(false)};
 const actOnTool=(name:string,args:Record<string,string>)=>{
  if(name==='navigate_mindora'&&['talk','space','breath','experts'].includes(args.section)){selectPage(args.section as Page);return {success:true,opened:args.section};}
  if(name==='switch_language'&&['kk','ru'].includes(args.language)){changeLang(args.language as Lang);return {success:true,language:args.language};}
  if(name==='choose_environment'&&['rain','lake','stars'].includes(args.scene)){setScene(args.scene as Scene);setPage('space');return {success:true,scene:args.scene};}
  return {success:false,error:'Unsupported action'};
 };
 const startVoice=async()=>{
  if(connection!=='off')return;
  setVoiceError('');setConnection('connecting');setVoiceStatus(tr('Қосылып жатыр…','Подключение…'));
  let stream:MediaStream|null=null;let pc:RTCPeerConnection|null=null;
  try{
   // Check API configuration before requesting any microphone permission.
   const tokenRes=await fetch('/api/realtime-token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language})});
   const token=await tokenRes.json();if(!tokenRes.ok||!token.value)throw Error(token.error||'No session token');
   // The user's browser must grant microphone access: Siri cannot bypass it.
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});audioStreamRef.current=stream;
   pc=new RTCPeerConnection();pcRef.current=pc;stream.getAudioTracks().forEach(track=>pc!.addTrack(track,stream!));
   if(audioRef.current){audioRef.current.autoplay=true;pc.ontrack=e=>{if(audioRef.current){audioRef.current.srcObject=e.streams[0];audioRef.current.play().catch(()=>setVoiceError(tr('iPhone дыбысты ойнату үшін экранды басуды сұрауы мүмкін.','Для звука на iPhone может понадобиться касание экрана.')));}};}
   const dc=pc.createDataChannel('oai-events');dataChannelRef.current=dc;
   dc.addEventListener('open',()=>{setConnection('on');setVoiceStatus(tr('AI сені тыңдап тұр','AI слушает тебя'));
     // Let the agent begin with the language greeting; the token is created only on a user gesture.
     dc.send(JSON.stringify({type:'response.create',response:{instructions:languageAsked?'Greet the student briefly in the saved language and ask how they feel.':'Greet warmly in Kazakh and ask which language is more comfortable, Kazakh or Russian. You are an AI, not a human psychologist.'}}));
   });
   dc.addEventListener('message',event=>{
    try{
     const v=JSON.parse(event.data);
     if(v.type==='input_audio_buffer.speech_started')setVoiceStatus(tr('Тыңдап тұрмын…','Слушаю…'));
     if(v.type==='response.created')setVoiceStatus(tr('Жауап беріп жатыр…','Отвечаю…'));
     if(v.type==='response.done')setVoiceStatus(tr('Сені тыңдап тұрмын','Слушаю тебя'));
     if(v.type==='conversation.item.input_audio_transcription.completed'&&v.transcript?.trim())setMessages(a=>[...a.slice(-16),{role:'user',content:v.transcript}]);
     if(v.type==='response.output_audio_transcript.done'&&v.transcript?.trim())setMessages(a=>[...a.slice(-16),{role:'assistant',content:v.transcript}]);
     if(v.type==='response.function_call_arguments.done'){
      let args:Record<string,string>={};try{args=JSON.parse(v.arguments||'{}')}catch{}
      const result=actOnTool(v.name,args);
      if(dc.readyState==='open'){dc.send(JSON.stringify({type:'conversation.item.create',item:{type:'function_call_output',call_id:v.call_id,output:JSON.stringify(result)}}));dc.send(JSON.stringify({type:'response.create'}));}
     }
     if(v.type==='error'){console.warn('Realtime event error',v.error?.message);setVoiceError(tr('Дауыстық қызметте қате пайда болды.','Ошибка голосового сервиса.'));}
    }catch(err){console.warn('Realtime message error',err)}
   });
   pc.addEventListener('connectionstatechange',()=>{if(pc?.connectionState==='failed'||pc?.connectionState==='disconnected'){setVoiceError(tr('Дауыс байланысы үзілді. Қайта қосып көріңіз.','Голосовое соединение прервалось.'));stopVoice();}});
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);
   const sdp=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:`Bearer ${token.value}`,'Content-Type':'application/sdp'},body:offer.sdp});
   if(!sdp.ok)throw Error('WebRTC SDP negotiation failed ('+sdp.status+')');
   await pc.setRemoteDescription({type:'answer',sdp:await sdp.text()});
  }catch(err){console.error('Voice connection failed',err);setVoiceError(err instanceof Error?err.message:tr('Микрофонға қосылу мүмкін болмады.','Не удалось подключить микрофон.'));pc?.close();stream?.getTracks().forEach(t=>t.stop());stopVoice();}
 };
 const sendText=async(text?:string)=>{
  const userText=(text||draft).trim();if(!userText||sending)return;
  const next:Message[]=[...messages,{role:'user',content:userText}];setMessages(next);setDraft('');setChatOpen(true);
  if(dataChannelRef.current?.readyState==='open'){
   dataChannelRef.current.send(JSON.stringify({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:userText}]}}));dataChannelRef.current.send(JSON.stringify({type:'response.create'}));return;
  }
  setSending(true);
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,messages:next})});const d=await r.json();if(!r.ok)throw Error(d.error||'Error');setDemo(!!d.demo);setMessages(a=>[...a.slice(-16),{role:'assistant',content:d.answer}]);
   if(/орыс|русск/.test(userText.toLowerCase()))changeLang('ru');else if(/қазақ|казах/.test(userText.toLowerCase()))changeLang('kk');
  }catch(e){setVoiceError(e instanceof Error?e.message:tr('Жауап алу мүмкін болмады.','Не удалось получить ответ.'));}finally{setSending(false)};
 };
 const locate=()=>{setGeoStatus(tr('Орналасу рұқсаты сұралады…','Запрашиваем доступ к геолокации…'));if(!navigator.geolocation){setGeoStatus(tr('Геолокация қолжетімсіз. Қаланы енгізіңіз.','Геолокация недоступна. Укажите город.'));return;}
  navigator.geolocation.getCurrentPosition(p=>{setCoords({lat:p.coords.latitude,lon:p.coords.longitude});setGeoStatus(tr('Орналасу анықталды. Картадан іздеуге болады.','Геолокация получена. Можно искать на карте.'));},()=>setGeoStatus(tr('Орналасуға рұқсат берілмеді. Қаланы енгізіңіз.','Нет доступа к геолокации. Укажите город.')),{timeout:12000,enableHighAccuracy:false});
 };
 const mapsUrl=coords?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`психолог near ${coords.lat},${coords.lon}`)}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('психолог '+(city.trim()||'Қазақстан'))}`;
 const quick=(p:Page)=>{setPage(p);if(p==='breath'){setBreathing(true)};};
 useEffect(()=>()=>{stopVoice();stopAmbient();cameraStreamRef.current?.getTracks().forEach(t=>t.stop())},[stopVoice,stopAmbient]);

 return <div className={'app-shell '+(dark?'night-mode ':'')+(page==='space'?'space-mode':'')}>
   {page==='space'&&<div className="scene-background" style={{backgroundImage:`linear-gradient(180deg,rgba(12,9,31,.48),rgba(15,9,36,.61)), url('${currentScene.image}')`}}/>}
   <div className="ambient-glow glow-one"/><div className="ambient-glow glow-two"/><div className="cosmos-sparkles" aria-hidden="true"/>
   <header className="topbar">
     <button onClick={()=>selectPage('talk')} className="brand" aria-label="Mindora басты бет"><Lotus size={45}/><span><strong>Mindora <em className="brand-v3">V3.1</em></strong><small>{tr('Сенің AI қолдаушың','Твой AI-помощник')}</small></span></button>
     <div className="header-center-note" aria-label={tr('Қолдау кеңістігі','Пространство поддержки')}><span className="header-online-dot"/><span>{tr('Сені тыңдауға дайынмын','Я готова тебя выслушать')}</span><Sparkles size={16}/></div>
     <div className="top-actions"><button className="top-lang" onClick={()=>setSettings(true)}><Globe2 size={17}/><span>{language==='kk'?'Қазақша':'Русский'}</span></button><button aria-label="Баптаулар" className="icon-top" onClick={()=>setSettings(true)}><Settings2 size={19}/></button></div>
   </header>
   <aside className="cinematic-sidebar" aria-label={tr('Негізгі мәзір','Главное меню')}>
     <div className="sidebar-intro"><Flower2 size={23}/><span>{tr('Қолдау','Поддержка')}</span></div>
     <button title={tr('AI-мен сөйлесу','Разговор с AI')} aria-label={tr('AI-мен сөйлесу','Разговор с AI')} className={page==='talk'?'current':''} onClick={()=>selectPage('talk')}><MessageCircle size={25}/><span>{tr('Әңгімелесу','Общение')}</span></button>
     <button title="EmotionSpace" aria-label="EmotionSpace" className={page==='space'?'current':''} onClick={()=>selectPage('space')}><Leaf size={26}/><span>EmotionSpace</span></button>
     <button title={tr('Жаттығулар','Упражнения')} aria-label={tr('Жаттығулар','Упражнения')} className={page==='breath'?'current':''} onClick={()=>selectPage('breath')}><Wind size={27}/><span>{tr('Жаттығулар','Дыхание')}</span></button>
     <button title={tr('Психолог табу','Найти психолога')} aria-label={tr('Психолог табу','Найти психолога')} className={page==='experts'?'current':''} onClick={()=>selectPage('experts')}><CalendarDays size={25}/><span>{tr('Психолог','Психолог')}</span></button>
     <div className="sidebar-divider"/>
     <button title={tr('Көңіл күй','Настроение')} aria-label={tr('Көңіл күй','Настроение')} onClick={()=>{selectPage('talk');setVoiceError(tr('Көңіл күйді оң жақтағы карточкадан өзің таңдай аласың.','Настроение можно выбрать в карточке справа.'));}}><Heart size={26}/><span>{tr('Көңіл күй','Настроение')}</span></button>
     <button title={tr('Баптаулар','Настройки')} aria-label={tr('Баптаулар','Настройки')} onClick={()=>setSettings(true)}><Settings2 size={25}/><span>{tr('Баптаулар','Настройки')}</span></button>
   </aside>
   <div className="mobile-tabs" role="tablist" aria-label="Sections"><button className={page==='talk'?'active':''} onClick={()=>selectPage('talk')}><MessageCircle size={17}/> {tr('AI кеңесші','AI советник')}</button><button className={page==='space'?'active':''} onClick={()=>selectPage('space')}><Leaf size={17}/> EmotionSpace</button><button className={page==='breath'?'active':''} onClick={()=>selectPage('breath')}><Wind size={17}/> {tr('Тыныс алу','Дыхание')}</button><button className={page==='experts'?'active':''} onClick={()=>selectPage('experts')}><HeartHandshake size={17}/> {tr('Психолог','Психолог')}</button></div>

   {page==='talk'&&<main className="main-layout talk-layout">
     <section className="left-panel desktop-side"><div className="glass-bubble welcome-bubble">{firstGreeting}<p>{tr('Мен сені тыңдауға дайынмын.','Я готова тебя выслушать.')}</p></div><div className="glass-bubble prompt-bubble">{tr('Қазір өзіңді қалай сезініп тұрсың? Қаласаң, жай сөйлесейік.','Как ты себя сейчас чувствуешь? Можем просто поговорить.')}</div><p className="tiny-label">✧ {tr('Жылдам әрекеттер','Быстрые действия')}</p><div className="left-actions"><button onClick={()=>quick('breath')}><Wind size={18}/>{tr('Тыныс алу','Дыхание')}</button><button onClick={()=>quick('space')}><Leaf size={18}/>EmotionSpace</button><button onClick={()=>selectPage('experts')}><HeartHandshake size={18}/>{tr('Маман табу','Специалист')}</button></div></section>
     <section className="hero-area"><div className="hero-orbit"/><div className="orbit-glow" aria-hidden="true"/><div className="hero-sparkle hero-sparkle-a"/><div className="hero-sparkle hero-sparkle-b"/><div className={'avatar-container '+(avatar==='human'?'photo-avatar':'')}>
       {avatar==='human'?<img className="counselor" src="/media/counselor-cutout.png" alt="Mindora виртуалды AI-кеңесші аватары"/>:<RobotFace/>}
       </div><div className="avatar-mode-pills"><button className={avatar==='human'?'chosen':''} onClick={()=>changeAvatar('human')}>{tr('Адам бейнесі','Человек')}</button><button className={avatar==='robot'?'chosen':''} onClick={()=>changeAvatar('robot')}><Bot size={15}/> {tr('AI робот','AI робот')}</button></div><SoundWave live={connection==='on'}/><div className="avatar-voice-label">{connection==='on'?voiceStatus:connection==='connecting'?tr('Қосылу…','Подключение…'):tr('Сөйлесуге дайынмын…','Готова к разговору…')}</div>
       {!languageAsked&&<div className="language-welcome glass-panel"><strong>{tr('Сәлем, досым! Қай тілде сөйлескен ыңғайлы?','Привет, друг! На каком языке тебе удобно?')}</strong><div><button onClick={()=>changeLang('kk')}>Қазақша</button><button onClick={()=>changeLang('ru')}>Русский</button></div></div>}
       <div className="mobile-message glass-panel"><p><b>{firstGreeting}</b></p><p>{tr('Мен сені тыңдауға дайынмын. Өзіңді қалай сезініп тұрсың?','Я готова тебя выслушать. Как ты себя чувствуешь?')}</p></div>
       <div className="voice-controls"><button onClick={toggleCamera} aria-label={cameraOn?'Камераны өшіру':'Камераны қосу'} className={cameraOn?'glowing':''}>{cameraOn?<Camera size={21}/>:<CameraOff size={21}/>}</button><button onClick={connection==='on'?stopVoice:startVoice} className={'mic-primary '+(connection==='on'?'mic-on':'')} disabled={connection==='connecting'} aria-label={connection==='on'?'Дауысты тоқтату':'Дауыстық сөйлесуді бастау'}>{connection==='on'?<MicOff size={27}/>:<Mic size={30}/>}</button><button onClick={()=>setChatOpen(v=>!v)} aria-label="Мәтіндік чат"><MessageCircle size={22}/></button><button onClick={()=>{stopVoice();setChatOpen(false)}} aria-label="Қоңырауды аяқтау" className="hangup"><X size={22}/></button></div>
       <p className="voice-hint">{connection==='on'?tr('Тыңдау қосулы • Тоқтату үшін микрофонды бас','Микрофон включён • Нажми, чтобы завершить'):tr('Дауыспен сөйлесу үшін микрофонды бас','Нажми микрофон, чтобы поговорить')}</p>
     </section>
     <section className="right-panel desktop-side"><div className="glass-panel"><div className="side-card-title"><Camera size={19}/>{tr('Студент камерасы','Камера студента')}</div><CameraTile cameraOn={cameraOn} cameraRef={cameraRef} toggleCamera={toggleCamera} language={language}/></div><div className="glass-panel"><div className="side-card-title"><Heart size={19}/>{tr('Қазіргі көңіл күйің','Твоё настроение')}</div><p className="subtle-text">{tr('Өзіңді қалай сезініп тұрсың?','Как ты себя чувствуешь?')}</p><div className="mood-choices">{moods.map(m=><button key={m.kk} onClick={()=>setMood(m.kk)} className={mood===m.kk?'selected':''}>{m.emoji} {language==='kk'?m.kk:m.ru}</button>)}</div><div className="mood-disclaimer">{tr('Көңіл күйді өзің таңдайсың, камера анықтамайды.','Настроение выбираешь ты; камера его не определяет.')}</div></div><div className="glass-panel"><div className="side-card-title"><Sparkles size={19}/>{tr('Келесі қадам','Следующий шаг')}</div><p className="subtle-text">{tr('Қаласаң, бірге қысқа тыныс алу жаттығуын жасайық.','Если хочешь, попробуем дыхательное упражнение.')}</p><button className="primary-action" onClick={()=>quick('breath')}><Play size={17}/>{tr('Жаттығуды бастау','Начать упражнение')}<ChevronRight size={17}/></button></div></section>
     <div className="mobile-quick-actions"><button onClick={()=>quick('breath')}><Wind size={17}/>{tr('Тыныс алу','Дыхание')}</button><button onClick={()=>selectPage('space')}><Leaf size={17}/>{tr('Тыныш орта','Тихая среда')}</button><button onClick={()=>selectPage('experts')}><HeartHandshake size={17}/>{tr('Психолог табу','Найти психолога')}</button></div>
     <div className="mobile-mood glass-panel"><div className="side-card-title"><Heart size={17}/>{tr('Өзіңді қалай сезініп тұрсың?','Как ты себя чувствуешь?')}</div><div className="mood-choices">{moods.map(m=><button className={mood===m.kk?'selected':''} key={m.kk} onClick={()=>setMood(m.kk)}>{m.emoji} {language==='kk'?m.kk:m.ru}</button>)}</div>{mood&&<span className="mood-disclaimer">{tr('Сен таңдадың: ','Ты выбрал(а): ')}{currentMood&&(language==='kk'?currentMood.kk:currentMood.ru)}</span>}</div>
   </main>}

   {page==='space'&&<main className="feature-page space-page"><div className="feature-intro"><div className="eyebrow"><Leaf size={16}/> EMOTIONSPACE</div><h1>{tr('Өзіңе тыныш кеңістік сыйла','Создай своё тихое пространство')}</h1><p>{tr('Жаңбырлы орман, жұлдызды аспан немесе тынық көл. Қай орта саған жайлы?','Дождливый лес, звёздное небо или тихое озеро. Выбери атмосферу для себя.')}</p></div><div className="space-hero"><div className="scene-greeting glass-panel"><span className="small-spark">✦</span> {tr('Қаласаң, осы тыныш жерде бірге отырып сөйлесейік.','Если хочешь, побудем здесь и поговорим.')}</div><div className="scene-title">{currentScene.icon} {language==='kk'?currentScene.kk:currentScene.ru}</div><SoundWave live={ambientOn}/></div><div className="scene-choice glass-panel"><div className="section-row"><strong>{tr('Қоршаған ортаны таңда','Выбери атмосферу')}</strong><span>{tr('Өзің қалаған уақытта ауыстыр','Меняй в любой момент')}</span></div><div className="scene-grid">{scenes.map(s=><button key={s.id} onClick={()=>setScene(s.id)} className={'scene-option '+(scene===s.id?'selected':'')}><img src={s.image} alt=""/><span>{s.icon} {language==='kk'?s.kk:s.ru}</span>{scene===s.id&&<Check className="scene-check" size={18}/>}</button>)}</div><div className="sound-settings"><button className="ambient-button" onClick={()=>ambientOn?stopAmbient():startAmbient()}>{ambientOn?<Pause size={18}/>:<Play size={18}/>} {ambientOn?tr('Фондық дыбысты тоқтату','Остановить звук'):tr('Фондық дыбысты қосу','Включить фоновый звук')}</button><Volume2 size={17}/><input type="range" min={0} max={100} value={ambientVol} onChange={e=>setAmbientVol(Number(e.target.value))} aria-label="Дыбыс деңгейі" /></div><p className="scene-note">{tr('Дыбыс — осы демода синтезделген тыныш фон.','Звук в демо — синтезированный спокойный фон.')}</p><button className="primary-action" onClick={()=>quick('breath')}><Wind size={17}/>{tr('AI-мен бірге тыныс алайық','Подышим вместе с AI')}<ChevronRight size={18}/></button></div></main>}

   {page==='breath'&&<main className="feature-page breath-page"><div className="feature-intro"><div className="eyebrow"><Wind size={17}/>{tr('AI-МЕН БІРГЕ ТЫНЫС АЛУ','ДЫХАНИЕ С AI')}</div><h1>{tr('Бірнеше минут тек өзің үшін','Несколько минут для себя')}</h1><p>{tr('Өзіңе ыңғайлы қарқында тыныс ал. Егер жайсыздық сезінсең, бірден тоқтат.','Дыши в комфортном темпе. Если чувствуешь дискомфорт, остановись.')}</p></div><div className="breath-layout"><div className="breath-guide"><div className="mini-avatar">{avatar==='human'?<img src="/media/counselor-cutout.png" alt="AI кеңесші"/>:<Bot size={50}/>}</div><div className="glass-bubble">{tr('Мен осындамын. Асықпай, өз ырғағыңмен тыныс ал.','Я рядом. Дыши спокойно, в своём ритме.')}</div><div className="breath-prompt">4 {tr('сек дем ал','сек вдох')} → 4 {tr('сек ұстап тұр','сек задержи')} → 6 {tr('сек дем шығар','сек выдох')}</div></div><div className="breath-core"><div className={'breathing-ring phase-'+phaseIndex+(breathing?' breathing-active':'')}><div className="breathing-inner"><Wind size={33}/><strong>{phaseLabels[phaseIndex]}</strong><b>{phaseSeconds}</b><span>{tr('секунд','секунд')}</span></div></div><div className="breath-stages"><span className={phaseIndex===0?'active':''}>{tr('Тыныс ал','Вдох')} · 4</span><span className={phaseIndex===1?'active':''}>{tr('Ұстап тұр','Задержи')} · 4</span><span className={phaseIndex===2?'active':''}>{tr('Дем шығар','Выдох')} · 6</span></div><div className="breath-control"><button onClick={()=>{setBreathing(false);setBreathTicks(0)}} aria-label="Қайта бастау"><RotateCcw size={19}/></button><button onClick={()=>setBreathing(v=>!v)} className="primary-circle">{breathing?<Pause size={27}/>:<Play size={27}/>}</button><button onClick={()=>selectPage('talk')} aria-label="Кеңесшіге оралу"><MessageCircle size={19}/></button></div><p className="breath-counter">{tr('Аяқталған циклдер','Завершено циклов')}: {totalCycles}</p></div><div className="breath-side glass-panel"><div className="side-card-title"><Heart size={20}/>{tr('Қолдауың осы жерде','Поддержка рядом')}</div><p>{tr('Жаттығуды тоқтату немесе әңгімеге қайта оралу үшін батырманы баса аласың.','Ты можешь остановить упражнение или вернуться к разговору.')}</p><button className="secondary-action" onClick={()=>selectPage('talk')}><MessageCircle size={17}/>{tr('AI-мен сөйлесу','Поговорить с AI')}</button><button className="secondary-action" onClick={()=>selectPage('experts')}><HeartHandshake size={17}/>{tr('Маман табу','Найти специалиста')}</button></div></div></main>}

   {page==='experts'&&<main className="feature-page experts-page"><div className="feature-intro"><div className="eyebrow"><HeartHandshake size={17}/>{tr('НАҚТЫ КӨМЕККЕ БАҒЫТТАУ','ПОИСК ПОМОЩИ')}</div><h1>{tr('Сен жалғыз емессің','Ты не один(одна)')}</h1><p>{tr('Мен қолдау көрсете аламын, ал кәсіби психолог қажет болғанда тиісті маманды бірге табамыз.','Я могу поддержать тебя, а когда нужна профессиональная помощь, мы вместе найдём специалиста.')}</p></div><div className="experts-grid"><div className="glass-panel expert-assistant"><div className="mini-avatar">{avatar==='human'?<img src="/media/counselor-cutout.png" alt="AI кеңесші"/>:<Bot size={52}/>}</div><div className="glass-bubble">{tr('Қаласаң, өзіңе жақын психологтарды картадан тауып берейін. Орналасқан жеріңді бөлісу міндетті емес.','Если хочешь, найдём психологов поблизости. Делиться геолокацией необязательно.')}</div><div className="notice-line"><Info size={18}/><span>{tr('Mindora — AI көмекші, лицензияланған психолог емес.','Mindora — AI-помощник, не лицензированный психолог.')}</span></div></div><div className="glass-panel search-expert"><div className="side-card-title"><MapPin size={20}/>{tr('Жақын жердегі мамандар','Специалисты рядом')}</div><p className="subtle-text">{tr('Қаланы қолмен жаз немесе өз рұқсатыңмен орналасуды анықта.','Введи город или разреши определить местоположение.')}</p><label className="city-label" htmlFor="city">{tr('Қалаң','Твой город')}</label><input id="city" className="city-input" placeholder={tr('Мысалы: Қызылорда','Например: Кызылорда')} value={city} onChange={e=>{setCity(e.target.value);setCoords(null)}}/><button className="secondary-action" onClick={locate}><LocateFixed size={18}/>{tr('Менің рұқсатыммен орналасуды анықтау','Определить моё местоположение')}</button>{geoStatus&&<p className="geo-status">{geoStatus}</p>}<a className="primary-action" target="_blank" rel="noopener noreferrer" href={mapsUrl}><MapPin size={17}/>{tr('Google Maps-та психологтарды іздеу','Найти психологов в Google Maps')}<ExternalLink size={18}/></a><p className="mood-disclaimer">{tr('Мамандардың нақты мекенжайын, біліктілігін және қабылдау уақытын картадан тексеріңіз. Жазылу автоматты орындалмайды.','Проверь адрес, квалификацию и часы приёма специалистов. Запись не выполняется автоматически.')}</p></div><div className="glass-panel urgent-card"><div className="side-card-title"><Heart size={20}/>{tr('Шұғыл көмек','Срочная помощь')}</div><p>{tr('Өзіңе немесе басқа адамға дәл қазір қауіп төніп тұрса, жедел қызметке хабарлас немесе жаныңдағы сенімді адамға айт.','Если есть непосредственная опасность для тебя или другого человека, обратись в экстренную службу или к близкому человеку.')}</p><a href="tel:112" className="emergency-call">112 · {tr('Шұғыл көмекке қоңырау шалу','Позвонить в экстренную службу')}</a></div></div></main>}

   {cameraOn&&<aside className="mobile-camera-pip" aria-label={tr('Менің бейнем','Моё видео')}>
     <video ref={mobileCameraRef} autoPlay muted playsInline className="mobile-camera-video" aria-label={tr('Өз бейнең','Твоё изображение')}/>
     <div className="mobile-camera-caption"><span className="mobile-camera-live-dot"/>{tr('Менің бейнем','Моё видео')}</div>
     <button className="mobile-camera-close" onClick={toggleCamera} aria-label={tr('Камераны өшіру','Выключить камеру')} title={tr('Камераны өшіру','Выключить камеру')}><X size={17}/></button>
   </aside>}
   {chatOpen&&<section className="chat-drawer" aria-label="Мәтіндік әңгіме"><div className="chat-header"><span><MessageCircle size={19}/>{tr('Mindora-мен әңгіме','Чат с Mindora')}</span><button onClick={()=>setChatOpen(false)} aria-label="Жабу"><X size={19}/></button></div><div className="chat-messages"><div className="chat-msg assistant">{tr('Сәлем, досым! Мен AI көмекшімін. Саған қай тілде сөйлескен ыңғайлы?','Привет, друг! Я AI-помощник. На каком языке тебе удобно общаться?')}</div>{messages.map((m,i)=><div key={i} className={'chat-msg '+m.role}>{m.content}</div>)}{sending&&<div className="chat-msg assistant">{tr('Ойланып жатырмын…','Думаю…')}</div>}<div ref={endRef}/></div><form onSubmit={e=>{e.preventDefault();sendText()}} className="chat-form"><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={tr('Не мазалап жүр? Жаза бер…','Что тебя беспокоит? Напиши…')} maxLength={2000}/><button type="submit" disabled={!draft.trim()||sending} aria-label="Жіберу"><Send size={18}/></button></form>{demo&&<div className="demo-notice">{tr('Демо жауаптар: нақты AI үшін API кілтін орнатыңыз.','Демо-ответы: для AI добавьте API-ключ.')}</div>}</section>}
   {voiceError&&<div className="error-toast" role="alert"><Info size={18}/><span>{voiceError}</span><button onClick={()=>setVoiceError('')}><X size={16}/></button></div>}
   <footer className="page-footer"><ShieldCheck size={16}/><span>{tr('AI психологты алмастырмайды. Камера мен микрофон тек рұқсатпен қосылады.','AI не заменяет психолога. Камера и микрофон включаются с разрешения.')}</span><span className="version-mark">V3.1</span></footer>
   <nav className="mobile-bottom" aria-label="Бөлімдер"><button className={page==='talk'?'current':''} onClick={()=>selectPage('talk')}><Home size={22}/><span>{tr('Басты','Главная')}</span></button><button className={page==='space'?'current':''} onClick={()=>selectPage('space')}><Leaf size={22}/><span>EmotionSpace</span></button><button className={page==='breath'?'current':''} onClick={()=>selectPage('breath')}><Flower2 size={22}/><span>{tr('Жаттығу','Дыхание')}</span></button><button className={page==='experts'?'current':''} onClick={()=>selectPage('experts')}><HeartHandshake size={22}/><span>{tr('Психолог','Психолог')}</span></button></nav>
   <audio ref={audioRef} autoPlay playsInline />
   {settings&&<div className="modal-backdrop" onClick={()=>setSettings(false)}><div role="dialog" aria-modal="true" aria-label="Баптаулар" className="settings-modal glass-panel" onClick={e=>e.stopPropagation()}><div className="settings-heading"><h2><Settings2 size={21}/>{tr('Баптаулар','Настройки')}</h2><button onClick={()=>setSettings(false)} aria-label="Жабу"><X size={21}/></button></div><div className="settings-item"><strong>{tr('Сөйлесу тілі','Язык разговора')}</strong><div className="segmented"><button className={language==='kk'?'selected':''} onClick={()=>changeLang('kk')}>Қазақша</button><button className={language==='ru'?'selected':''} onClick={()=>changeLang('ru')}>Русский</button></div></div><div className="settings-item"><strong>{tr('Виртуалды бейне','Виртуальный аватар')}</strong><div className="segmented"><button className={avatar==='human'?'selected':''} onClick={()=>changeAvatar('human')}>{tr('Адам','Человек')}</button><button className={avatar==='robot'?'selected':''} onClick={()=>changeAvatar('robot')}>{tr('Робот','Робот')}</button></div></div><div className="settings-item"><strong>{tr('Түнгі режим','Ночной режим')}</strong><div className="segmented"><button className={!dark?'selected':''} onClick={()=>setDark(false)}><Sun size={16}/>{tr('Әдеттегі','Обычный')}</button><button className={dark?'selected':''} onClick={()=>setDark(true)}><Moon size={16}/>{tr('Қараңғы','Тёмный')}</button></div></div><p className="mood-disclaimer">{tr('Камера мен микрофон тек өз рұқсатыңмен қосылады. Камера бейнесі эмоцияны автоматты анықтау үшін қолданылмайды.','Камера и микрофон включаются только с твоего согласия. Видео не используется для автоматического определения эмоций.')}</p><button className="primary-action" onClick={()=>setSettings(false)}><Check size={18}/>{tr('Дайын','Готово')}</button></div></div>}
 </div>;
}

function CameraTile({cameraOn,cameraRef,toggleCamera,language}:{cameraOn:boolean;cameraRef:React.RefObject<HTMLVideoElement|null>;toggleCamera:()=>void;language:Lang}){return <div className="camera-tile">{cameraOn?<video ref={cameraRef} autoPlay muted playsInline className="camera-video"/>:<div className="camera-placeholder"><CameraOff size={27}/><span>{language==='kk'?'Камера өшірулі':'Камера выключена'}</span></div>}<button className="camera-toggle" onClick={toggleCamera}>{cameraOn?<><CameraOff size={15}/>{language==='kk'?'Өшіру':'Выключить'}</>:<><Camera size={15}/>{language==='kk'?'Қосу':'Включить'}</>}</button></div>}
