"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, LibraryBig, Search, ShieldCheck } from "lucide-react";

type Lang = "kk" | "ru";
type Filter = "all" | Lang;
type Resource = {
  id: string;
  title: string;
  author: string;
  descriptionKk: string;
  descriptionRu: string;
  lang: Lang;
  kind: "textbook" | "guide" | "article";
  url: string;
  origin: string;
};

// Curated official publication pages (links only; copyrighted files are not copied).
const resources: Resource[] = [
  {
    id: "history", lang: "kk", kind: "textbook",
    title: "Қазіргі психология тарихы", author: "Дуэйн Шульц, Сидней Эллен Шульц", origin: "OpenU.kz",
    descriptionKk: "Психология ғылымының қалыптасуы мен негізгі бағыттары туралы оқулық.",
    descriptionRu: "Учебник об истории и основных направлениях психологической науки.",
    url: "https://openu.kz/kz/book/kazirgi-psihologiya-tarihy"
  },
  {
    id: "social", lang: "kk", kind: "textbook",
    title: "Әлеуметтік психология", author: "Дэвид Майерс, Жан Туенж", origin: "OpenU.kz",
    descriptionKk: "Адамдар арасындағы қарым-қатынас пен әлеуметтік мінез-құлықты түсіндіреді.",
    descriptionRu: "О социальном поведении и взаимодействии между людьми.",
    url: "https://openu.kz/kz/book/aleumettik-psihologiya"
  },
  {
    id: "social-animal", lang: "kk", kind: "textbook",
    title: "Көпке ұмтылған жалғыз. Әлеуметтік психологияға кіріспе", author: "Эллиот Аронсон", origin: "OpenU.kz",
    descriptionKk: "Топ ықпалы, қарым-қатынас және адам мінез-құлқы туралы танымдық еңбек.",
    descriptionRu: "О влиянии группы, общении и человеческом поведении.",
    url: "https://openu.kz/kz/book/kopke-umtylgan-zhalgyz-aleumettik-psihologiyaga-kirispe"
  },
  {
    id: "internet", lang: "kk", kind: "textbook",
    title: "Интернет психологиясы", author: "Патрисия Уоллейс", origin: "OpenU.kz",
    descriptionKk: "Интернет ортасының эмоцияға, қарым-қатынасқа және мінез-құлыққа ықпалы.",
    descriptionRu: "О влиянии онлайн-среды на общение, эмоции и поведение.",
    url: "https://openu.kz/kz/book/internet-psihologiyasy"
  },
  {
    id: "stress-guide", lang: "ru", kind: "guide",
    title: "Важные навыки в периоды стресса", author: "Всемирная организация здравоохранения", origin: "ВОЗ · PDF",
    descriptionKk: "Стресті басқарудың практикалық дағдылары берілген суретті нұсқаулық.",
    descriptionRu: "Иллюстрированное пособие с практическими навыками управления стрессом.",
    url: "https://www.who.int/docs/default-source/mental-health/sh-2020-rus-3-web.pdf"
  },
  {
    id: "first-aid", lang: "ru", kind: "guide",
    title: "Первая психологическая помощь: руководство для работников на местах", author: "Всемирная организация здравоохранения", origin: "ВОЗ · PDF",
    descriptionKk: "Кәсіби және ерікті көмек көрсетушілерге арналған әдістемелік нұсқаулық.",
    descriptionRu: "Методическое руководство для специалистов и помощников, не замена личной консультации.",
    url: "https://iris.who.int/bitstream/handle/10665/44615/9789244548202_rus.pdf"
  },
  {
    id: "stress-faq", lang: "ru", kind: "article",
    title: "Стресс: вопросы и ответы", author: "Всемирная организация здравоохранения", origin: "ВОЗ",
    descriptionKk: "Күйзелістің белгілері және көмекке жүгіну туралы түсінікті ақпарат.",
    descriptionRu: "Понятно о проявлениях стресса и о том, когда стоит обратиться за помощью.",
    url: "https://www.who.int/ru/news-room/questions-and-answers/item/stress"
  },
  {
    id: "online-mental", lang: "ru", kind: "article",
    title: "5 способов улучшить психическое здоровье в интернете", author: "ЮНИСЕФ Қазақстан", origin: "UNICEF",
    descriptionKk: "Онлайн ортада өзіне және басқаларға қамқорлық жасауға арналған ұсыныстар.",
    descriptionRu: "Практические рекомендации о заботе о себе и других в интернете.",
    url: "https://www.unicef.org/kazakhstan/Новостные-заметки/5-способов-улучшить-психическое-здоровье-в-интернете"
  }
];

export default function LibraryPanel({language, onBack}:{language:Lang;onBack:()=>void}){
  const [filter,setFilter] = useState<Filter>("all");
  const [search,setSearch] = useState("");
  const tr=(kk:string,ru:string)=>language==="kk"?kk:ru;
  const shown=useMemo(()=>resources.filter(r=>(filter==="all"||r.lang===filter)&&
    (r.title+" "+r.author+" "+r.origin+" "+r.descriptionKk+" "+r.descriptionRu).toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())),[filter,search]);
  const kindName=(kind:Resource["kind"])=>kind==="textbook"?tr("Оқулық","Учебник"):kind==="guide"?tr("Нұсқаулық","Пособие"):tr("Мақала","Статья");
  return <main className="feature-page mindora-library" aria-label={tr("Психологиялық кітапхана","Психологическая библиотека")}>
    <div className="feature-intro">
      <div className="eyebrow"><LibraryBig size={17}/>{tr("ПСИХОЛОГИЯЛЫҚ КІТАПХАНА","ПСИХОЛОГИЧЕСКАЯ БИБЛИОТЕКА")}</div>
      <h1>{tr("Оқуға арналған сенімді материалдар","Проверенные материалы для чтения")}</h1>
      <p>{tr("Қазақша және орысша психология оқулықтары мен пайдалы нұсқаулықтарды таңда. Әр материал ресми сайттан ашылады.","Выбирай учебники по психологии и полезные пособия на казахском и русском. Каждый материал открывается на официальном сайте.")}</p>
    </div>
    <div className="mindora-library-toolbar glass-panel">
      <div className="mindora-library-filters" role="group" aria-label={tr("Тіл бойынша сүзгі","Фильтр по языку")}>
        {(["all","kk","ru"] as Filter[]).map(f=><button key={f} aria-pressed={filter===f} className={filter===f?"selected":""} onClick={()=>setFilter(f)}>{f==="all"?tr("Барлығы","Все"):f==="kk"?"Қазақша":"Русский"}</button>)}
      </div>
      <label className="mindora-library-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr("Кітап немесе тақырып іздеу","Поиск книги или темы")} aria-label={tr("Кітап іздеу","Поиск книги")}/></label>
    </div>
    <div className="mindora-library-grid" aria-live="polite">
      {shown.map(r=><article className="mindora-book-card glass-panel" key={r.id}>
        <div className="mindora-book-cover" aria-hidden="true"><BookOpen size={34}/><span>{r.lang==="kk"?"ҚАЗ":"РУС"}</span></div>
        <div className="mindora-book-content">
          <div className="mindora-book-meta"><span>{kindName(r.kind)}</span><span>{r.lang==="kk"?"Қазақша":"Русский"}</span><span>{r.origin}</span></div>
          <h2>{r.title}</h2><p className="mindora-book-author">{r.author}</p>
          <p className="mindora-book-desc">{language==="kk"?r.descriptionKk:r.descriptionRu}</p>
          <a className="mindora-book-open" href={r.url} target="_blank" rel="noopener noreferrer"><BookOpen size={16}/>{tr("Ресми сайтта оқу","Читать на официальном сайте")}<ExternalLink size={16}/></a>
        </div>
      </article>)}
    </div>
    {shown.length===0&&<div className="glass-panel mindora-library-empty">{tr("Іздеу бойынша материал табылмады.","По запросу ничего не найдено.")}</div>}
    <div className="mindora-library-footer glass-panel"><ShieldCheck size={20}/><span>{tr("Материалдар білім алу мен өзіндік қолдауға арналған. Олар кәсіби психологиялық көмекті алмастырмайды. Кейбір кітаптарды оқу үшін бастапқы сайтқа тіркелу қажет болуы мүмкін.","Материалы предназначены для обучения и самопомощи и не заменяют профессиональную психологическую поддержку. Некоторые книги могут потребовать входа на сайт издателя.")}</span></div>
    <button className="mindora-library-back" onClick={onBack}><ArrowLeft size={17}/>{tr("AI-кеңесшіге қайту","Вернуться к AI-советнику")}</button>
  </main>;
}
