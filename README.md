# Mindora V2 — дизайн жаңартуы (20.11.2026)

Бұл нұсқа Vercel-де жарияланған Mindora жобасының **интерфейсін** жақсартады. Ағымдағы Next.js функциялары сақталған.

## Өзгергені

- Компьютерде сол жақ **вертикалды навигация**: Әңгімелесу, EmotionSpace, Жаттығулар, Психолог, Көңіл күй, Баптаулар.
- **Қыздың тікбұрышты фоны өңделді**: мөлдір `counselor-cutout.png` қосылды, портрет фонмен үйлеседі.
- Үлкен жарық шеңбер, нәзік жарқыл, glassmorphism, карточка мен батырма стильдері жақсартылды.
- Телефонда шағын экранға бейімделген алдыңғы мобильді навигация сақталды.
- API кілті, камера рұқсаттары, тыныс алу таймері, EmotionSpace, психолог іздеу логикасы өзгерген жоқ.

## Бар Vercel сайтына жаңарту (оңай тәсіл)

1. `mindora-v2-update.zip` файлын жүктеп, Windows-та **Извлечь все** жасаңыз.
2. Бар репозиторийді ашыңыз: `https://github.com/gulzira87475850414-spec/mindora`.
3. **Add file → Upload files** түймесін басыңыз.
4. ZIP-тен ашылған папканың ішіндегі **`app` және `public`** папкаларын GitHub жүктеу аймағына сүйреп апарыңыз. Файлдар репозиторийдің негізгі деңгейінде қалуы қажет.
5. Файлдардың өзгергенін тексеріп, **Commit changes** басыңыз.
6. Vercel GitHub репозиторийіне байланысқан болса, `main` тармағына енгізілген commit автоматты түрде жаңа deployment іске қосады. **Deployments** ішіндегі **Ready** күйін күтіңіз, кейін сайтты жаңартыңыз (`Ctrl+F5`).

Егер GitHub веб-жүктеу интерфейсі бұрыннан бар файлды алмастыруға мүмкіндік бермесе, `app/page.tsx` және `app/globals.css` файлдарын жеке өңдеп, `public/media/counselor-cutout.png` файлын жүктеу қажет. Балама — GitHub Desktop арқылы өзгерген папкаларды көшіру, Commit және Push.

> Дизайн нұсқасы. Жарияланған сайттағы дауыстық AI үшін `OPENAI_API_KEY` қажет. Қыздың бейнесі статикалық, дыбысқа синхрондалған видеоаватар емес. Vercel сайтында ақырғы визуалды және функционалдық тексеруді жүргізіңіз.

---

# Mindora — Vercel-ге дайын AI-психологиялық қолдау веб-платформасы

**Стек:** Next.js App Router + React + TypeScript + CSS, OpenAI Responses API және Realtime API (WebRTC). **PWA:** Android/iPhone басты экранына ярлык қосуға арналған manifest + иконкалар.

## 1. Vercel-ге орналастыру

1. Осы папканы GitHub репозиторийіне салыңыз (`package.json` түбірде қалсын).
2. [vercel.com/new](https://vercel.com/new) арқылы GitHub репозиторийін таңдаңыз.
3. Framework Preset: **Next.js**. Build: **npm run build**. Root Directory: **./**.
4. Vercel → Project → Settings → Environment Variables ішінен `OPENAI_API_KEY` қосыңыз. Жоба **API кілтінсіз де ашылады**, бірақ онда тек қарапайым **демо мәтіндік жауаптар** жұмыс істейді, нақты AI дауысы қосылмайды.
5. Deploy басыңыз. HTTPS автоматты түрде беріледі. Кілтті кейін қоссаңыз, қайта Deploy жасаңыз.

## 2. Компьютерде іске қосу

Node.js 20+ қажет.

```bash
npm install
cp .env.example .env.local
# Windows PowerShell: Copy-Item .env.example .env.local
# .env.local файлына OPENAI_API_KEY мәнін жазыңыз
npm run dev
```

Браузер: http://localhost:3000

## 3. MVP-де НЕ жұмыс істейді

- Мобильді және компьютерлік бейімделген Mindora интерфейсі; соңғы мақұлданған дизайнға ұқсас.
- Қазақша ↔ орысша интерфейсті кез келген уақытта ауыстыру; тіл параметрі браузерде сақталады.
- Адам бейнесіндегі аватар ↔ CSS робот бейнесін таңдау (әзірге **синхронды сөйлейтін адам видеосы емес, статикалық сурет**).
- `OPENAI_API_KEY` қосылғанда **нақты AI мәтіндік чат** (`/api/chat`, Responses API).
- Кілт қосылғанда пайдаланушы микрофонды басып, рұқсат берген соң **нақты уақыттағы AI дауысымен сөйлесу** (`/api/realtime-token`, WebRTC). Realtime сессиясында платформаның беттерін ашатын 3 tool бар.
- Сөйлесу арқылы тіл ауыстыру, жаттығу, EmotionSpace және маман бетіне өтуге арналған агенттік tool шақырулары.
- Камера студенттің рұқсатымен қосылады: тек құрылғының **жергілікті алдын ала көрінісі**, видео серверге жіберілмейді, эмоция танылмайды.
- Көңіл күйді студенттің **өзі таңдауы** (дерекқорға жазылмайды).
- EmotionSpace: 3 виртуалды орта, жергілікті суреттер және Web Audio арқылы синтезделетін жұмсақ фондық шу.
- Co-Breathing: 4–4–6 визуалды таймер, тоқтату/қайта қосу.
- Психолог іздеу: қала енгізу немесе геолокацияға нақты рұқсат сұрау → Google Maps нәтижелерін жаңа бетте ашу.
- Қазақстандағы шұғыл көмекке `tel:112` батырмасы.
- Мобильді интерфейсті басты экранға қосуға арналған `manifest.webmanifest` және иконкалар.

## 4. Әзірге НЕ қосылмаған

- Tavus не басқа видеоаватар генераторы: қазіргі әйел аватары — мақұлданған дизайннан алынған **статикалық сурет**.
- Телефон құлыптаулы кезде Siri-ден микрофонды ешбір басусыз ояту: **iOS веб/PWA шектеуі**, оған кепіл берілмейді. iPhone-дағы Shortcuts арқылы `Open URL` әрекетін қолданып сайтты Siri арқылы ашуға болады; iOS рұқсат/басуды сұрауы мүмкін.
- Психологтардың verified базасы, нақты бос уақытын тексеру, төлем немесе қабылдауға шын тіркеу.
- Дауыстың/бейненің мінез-құлқынан эмоцияны автоматты анықтау (әдейі жоқ, сенімді емес).
- Өндірістік деңгейдегі аккаунт, rate limiting, privacy/security аудит, клиникалық сараптама, кризистік жергілікті маршруттар, backend журнал/сақтау саясаты.

## 5. Құпиялылық және қауіпсіздік

Mindora — медициналық маман емес. Сөйлесулер браузердің `localStorage`-ына жазылмайды (тек таңдалған тіл мен аватар сақталады); мәтін мен дауыс үшін OpenAI API-іне деректер жіберіледі. OpenAI API-інің нақты деректерді өңдеу және сақтау шарттарын бөлек тексеріңіз. Қоғамдық іске қосуға дейін заңдық құжаттар, оқушылардың жас санаттары, келісім рәсімі, abuse prevention және дәрігер/психологпен бірге қауіпсіздік тестілері қажет. **Қазір тек пилот/демо ретінде пайдаланыңыз.**

Дауыстық сессия браузердің микрофон рұқсатынсыз басталмайды. iPhone-да аудионы ойнату үшін қосымша басу қажет болуы мүмкін.

## 6. iPhone-да ярлык және Siri

1. Сайтты Safari арқылы ашыңыз → Share → **Add to Home Screen**.
2. **Shortcuts** → жаңа shortcut → **Open URL** → Vercel URL-ін көрсетіңіз.
3. Shortcut-қа, мысалы, «Mindora-ны аш» атауын беріңіз.
4. Siri арқылы shortcut-ты іске қосыңыз. Сайт ашылған соң микрофон рұқсаты немесе батырманы басу қажет болуы мүмкін.

## 7. Баптаулар

`.env.example`:

- `OPENAI_API_KEY` — міндетті (нақты AI үшін)
- `OPENAI_TEXT_MODEL` — әдепкіде `gpt-5.4-mini`
- `OPENAI_REALTIME_MODEL` — әдепкіде `gpt-realtime-2.1`

Тұтынатын API-лер **ақылы** болуы мүмкін; сұраныстар санын шектеңіз. Қоғамдық релизге дейін IP/user rate limits және auth қосыңыз. Realtime WebRTC тек HTTPS/localhost контекстінде микрофонға қол жеткізе алады.

## 8. Құрылым

```text
app/page.tsx                    Барлық интерфейс / құралдар
app/globals.css                 Мобильді/desktop дизайн
app/api/chat/route.ts           Текст AI сервер endpoint
app/api/realtime-token/route.ts Қысқа мерзімді Voice token
lib/prompts.ts                  Психологиялық қауіпсіздік промпттары және tools
public/media/                  Аватар және орта суреттері
public/icons/                  PWA белгішелері
public/manifest.webmanifest     Мобильді сайт манифесті
```

Түпнұсқа дизайны — осы әңгімеде жасалған Mindora макеттері. Скриндегі студент суреті қолданылмайды: нақты камера тек рұқсатпен көрсетіледі.


## Mindora V3 (visual refresh)

- Removed duplicate desktop top navigation; desktop uses the vertical left sidebar.
- Enlarged and integrated the existing counselor PNG with a brighter halo.
- Improved glass cards, purple gradients, typography, and microphone emphasis.
- On phones, the avatar and voice controls take priority; bottom navigation stays available.
- Existing voice, text, camera, environment and breathing functionality is unchanged.
- Small `V3` label beside the Mindora logo confirms the update.

To update the GitHub repository, upload `app/page.tsx` and `app/globals.css` **at their original paths**. Verify both appear in the changed files before committing. GitHub's web interface may not replace existing files with an upload in all cases; if it refuses, edit the existing file or use GitHub Desktop. Vercel automatically deploys a new commit on `main`.
