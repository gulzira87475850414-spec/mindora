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
    id: "unicef-mental-talk", lang: "kk", kind: "article",
    title: "Психикалық денсаулық туралы әңгіменің басталуы: 14–18 жас", author: "UNICEF Қазақстан", origin: "UNICEF · Ашық мақала",
    descriptionKk: "Жасөспірімдердің көңіл күйі мен психикалық денсаулығы туралы әңгіме бастауға арналған ата-аналар мен тәлімгерлерге бағытталған материал.",
    descriptionRu: "Материал ЮНИСЕФ для родителей и наставников о разговоре с подростком о психическом здоровье.",
    url: "https://www.unicef.org/kazakhstan/kk/%D0%BE%D2%9B%D0%B8%D2%93%D0%B0%D0%BB%D0%B0%D1%80/%D0%BF%D1%81%D0%B8%D1%85%D0%B8%D0%BA%D0%B0%D0%BB%D1%8B%D2%9B-%D0%B4%D0%B5%D0%BD%D1%81%D0%B0%D1%83%D0%BB%D1%8B%D2%9B-%D1%82%D1%83%D1%80%D0%B0%D0%BB%D1%8B-%D3%99%D2%A3%D0%B3%D1%96%D0%BC%D0%B5%D0%BD%D1%96%D2%A3-%D0%B1%D0%B0%D1%81%D1%82%D0%B0%D0%BB%D1%83%D1%8B-14-18-%D0%B6%D0%B0%D1%81"
  },
  {
    id: "unicef-four-ways", lang: "kk", kind: "article",
    title: "Жасөспірім балаңыздың психикалық денсаулығын қолдаудың төрт әдісі", author: "UNICEF Қазақстан", origin: "UNICEF · Ашық мақала",
    descriptionKk: "Студент пен жасөспірімді тыңдау, қолдау және күйзелісті басқару жөнінде ата-аналарға арналған кеңестер.",
    descriptionRu: "Советы ЮНИСЕФ для родителей о поддержке подростков и преодолении стресса.",
    url: "https://www.unicef.org/kazakhstan/kk/%D0%BE%D2%9B%D0%B8%D2%93%D0%B0%D0%BB%D0%B0%D1%80/%D0%B6%D0%B0%D1%81%D3%A9%D1%81%D0%BF%D1%96%D1%80%D1%96%D0%BC-%D0%B1%D0%B0%D0%BB%D0%B0%D2%A3%D1%8B%D0%B7%D0%B4%D1%8B%D2%A3-%D0%BF%D1%81%D0%B8%D1%85%D0%B8%D0%BA%D0%B0%D0%BB%D1%8B%D2%9B-%D0%B4%D0%B5%D0%BD%D1%81%D0%B0%D1%83%D0%BB%D1%8B%D2%93%D1%8B%D0%BD-%D2%9B%D0%BE%D0%BB%D0%B4%D0%B0%D1%83%D0%B4%D1%8B%D2%A3-%D1%82%D3%A9%D1%80%D1%82-%D3%99%D0%B4%D1%96%D1%81%D1%96"
  },
  {
    id: "unicef-stress-signs", lang: "kk", kind: "article",
    title: "Баланың қатты күйзелісте екенін қалай түсінуге болады", author: "UNICEF Қазақстан", origin: "UNICEF · Ашық мақала",
    descriptionKk: "Күйзелістің сыртқы белгілері және баламен бірге қолдануға болатын қолдау жаттығулары туралы ақпарат.",
    descriptionRu: "О возможных признаках стресса и упражнениях для совместной поддержки ребенка.",
    url: "https://www.unicef.org/kazakhstan/kk/%D0%BE%D2%9B%D0%B8%D2%93%D0%B0%D0%BB%D0%B0%D1%80/%D0%B1%D0%B0%D0%BB%D0%B0%D0%BD%D1%8B%D2%A3-%D2%9B%D0%B0%D1%82%D1%82%D1%8B-%D0%BA%D2%AF%D0%B9%D0%B7%D0%B5%D0%BB%D1%96%D1%81%D1%82%D0%B5-%D0%B5%D0%BA%D0%B5%D0%BD%D1%96%D0%BD-%D2%9B%D0%B0%D0%BB%D0%B0%D0%B9-%D1%82%D2%AF%D1%81%D1%96%D0%BD%D1%83%D0%B3%D0%B5-%D0%B1%D0%BE%D0%BB%D0%B0%D0%B4%D1%8B"
  },
  {
    id: "unicef-mental-report", lang: "kk", kind: "guide",
    title: "Жасөспірімдердің психикалық денсаулығын нығайту және суицидтің алдын алу", author: "UNICEF Қазақстан", origin: "UNICEF · Есеп / PDF",
    descriptionKk: "Қазақстандағы мектептер мен денсаулық сақтау ұйымдарына арналған зерттеу-есеп. Студентке жеке диагноз қою үшін арналмаған.",
    descriptionRu: "Исследовательский отчет для образовательных и медицинских специалистов Казахстана.",
    url: "https://www.unicef.org/kazakhstan/kk/%D0%B5%D1%81%D0%B5%D0%BF%D1%82%D0%B5%D1%80/%D0%B6%D0%B0%D1%81%D3%A9%D1%81%D0%BF%D1%96%D1%80%D1%96%D0%BC%D0%B4%D0%B5%D1%80%D0%B4%D1%96%D2%A3-%D0%BF%D1%81%D0%B8%D1%85%D0%B8%D0%BA%D0%B0%D0%BB%D1%8B%D2%9B-%D0%B4%D0%B5%D0%BD%D1%81%D0%B0%D1%83%D0%BB%D1%8B%D2%93%D1%8B%D0%BD-%D0%BD%D1%8B%D2%93%D0%B0%D0%B9%D1%82%D1%83-%D0%B6%D3%99%D0%BD%D0%B5-%D1%81%D1%83%D0%B8%D1%86%D0%B8%D0%B4%D1%82%D1%96%D2%A3-%D0%B0%D0%BB%D0%B4%D1%8B%D0%BD-%D0%B0%D0%BB%D1%83-%D0%B6%D2%AF%D0%B9%D0%B5%D0%B3%D0%B5-%D0%B5%D0%BD%D0%B3%D1%96%D0%B7%D1%83"
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
    url: "https://www.unicef.org/kazakhstan/%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%BD%D1%8B%D0%B5-%D0%B7%D0%B0%D0%BC%D0%B5%D1%82%D0%BA%D0%B8/5-%D1%81%D0%BF%D0%BE%D1%81%D0%BE%D0%B1%D0%BE%D0%B2-%D1%83%D0%BB%D1%83%D1%87%D1%88%D0%B8%D1%82%D1%8C-%D0%BF%D1%81%D0%B8%D1%85%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5-%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5-%D0%B2-%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%BD%D0%B5%D1%82%D0%B5"
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
      <p>{tr("Қазақша және орысша сенімді оқу материалдарын таңда. Әр материал бастапқы ресми сайттан ашылады.","Выбирай проверенные материалы по психологии на казахском и русском. Все ссылки ведут к официальным первоисточникам.")}</p>
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
