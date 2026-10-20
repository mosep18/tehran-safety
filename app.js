(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const main = $('#appMain');
  const toastEl = $('#toast');
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const load = (key, fallback) => { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch (_) { return fallback; } };
  let lang = load('ts_lang','fa'); if (!['fa','en'].includes(lang)) lang='fa';
  let currentScreen='home', activeTab='home', previousScreen='home', screenStack=[], currentSection=1, currentQuick='explosion', sourcePart=0, checklistFilter='home', searchQuery='', sourceQuery='', installPrompt=null;
  let checked = load('ts_checked', {});
  const appSettings = load('ts_settings', {reminders:false, compact:false});

  const ui = {
    en: {
      brand:'Tehran Safety', subtitle:'PREPARE · SURVIVE · RECOVER', home:'Home', guide:'Handbook', checklists:'Checklists', more:'More',
      heroTitle:'Be ready. Stay safer.', heroText:'Practical civilian safety guidance for preparation, sheltering, evacuation and recovery.',
      based:'BASED ON THE SUPPLIED HANDBOOK', offline:'Works offline', updated:'Source dated 19 Oct 2026',
      urgentTitle:'Quick actions', urgentSub:'Start here when you need a clear next step.', explosion:'Explosion nearby', explosionSub:'Protect yourself from glass and debris', smoke:'Toxic smoke', smokeSub:'Reduce exposure indoors', leave:'Need to leave?', leaveSub:'Use your family evacuation plan',
      progressTitle:'Your readiness checklist', progressSub:'Build the essentials a little at a time.', progressAction:'Open checklists', topics:'Explore the handbook', allTopics:'All sections', moreTools:'Useful tools', plan:'72-hour household plan', planSub:'Water, supplies and a safe place', verify:'Check a warning', verifySub:'Separate confirmed information from rumours',
      sourceNotice:'This app is an offline guide, not a live alert service. The situation timeline reflects the supplied document and is not continuously verified.',
      guideTitle:'Handbook', guideSub:'12 sections from the supplied safety handbook.', searchPlaceholder:'Search guidance, supplies, symptoms…',
      checklistTitle:'Checklists', checklistSub:'Tick off tasks as you prepare. Progress is saved on this device.',
      tabHome:'Home', tabGoBag:'Go-bag', tabFamily:'Family plan', tabMonthly:'Monthly', tabAfter:'After attack',
      homeList:'Home preparedness', goBag:'Go-bag — one per person', family:'Family communication plan', monthly:'Monthly readiness check', after:'After an attack',
      done:'completed', clearProgress:'Reset this list', resetConfirm:'Reset this checklist progress on this device?',
      moreTitle:'Resources & settings', emergency:'Emergency numbers', ambulance:'Ambulance', police:'Police', fire:'Fire service', verifyNumbers:'Verify local emergency numbers before relying on them.',
      original:'Read the full original handbook', originalSub:'English source text extracted from the provided 27-page PDF.', openPdf:'Open original PDF', about:'About this app', privacy:'Privacy', noAccounts:'No account is needed. Checklists and language preference stay on this device.',
      language:'Language', persian:'فارسی', english:'English', appearance:'Display', compact:'Compact cards', notifications:'Notifications', notificationsSub:'This offline build does not send live emergency alerts.',
      back:'Back', readSource:'Read original English section', actions:'What to do', remember:'Keep in mind', startChecklist:'Open relevant checklist', saveNote:'Your progress is saved on this device.', sourceTitle:'Original handbook text', sourceSub:'The supplied English PDF text, grouped by its 12 parts.', searchSource:'Find a phrase in the original text…', sourcePartAll:'All parts', pdfDisclaimer:'The original PDF is included in the project assets.',
      noResults:'No matching guidance was found.', result:'result', results:'results', clearSearch:'Clear search', install:'Install app', installTip:'Use the browser menu and choose “Install app” or “Add to Home screen”.',
      warningTitle:'Five checks before sharing a warning', warningQuestions:[
        'Who is the original source? Can I find its own statement?',
        'Do at least two independent, reliable sources confirm it?',
        'What is the date, and is it still current?',
        'Could the post be old footage or an unsourced screenshot?',
        'What would I lose by taking a few minutes to verify it?'
      ],
      appNote:'Safety information is general and does not replace instructions from local authorities or medical professionals. Verify current guidance and local numbers.',
      detailsLabel:'Section', source:'Source', emergencyCaution:'If you are in immediate danger, prioritize reaching cover and following verified local emergency instructions.',
      sourceDisputed:'The source notes that casualty totals and some accounts are disputed or incomplete. Treat estimates as estimates.',
      pdfButton:'Open the supplied PDF', installTitle:'Install on Android', installBody:'On Android, open this app from a secure web address in Chrome, then use the browser menu → Install app / Add to Home screen. For a native APK build, see the Android source project README.'
    },
    fa: {
      brand:'ایمنی تهران', subtitle:'آمادگی · بقا · بازیابی', home:'خانه', guide:'راهنما', checklists:'چک‌لیست‌ها', more:'بیشتر',
      heroTitle:'آماده باش؛ ایمن‌تر بمان.', heroText:'راهنمای کاربردی ایمنی غیرنظامیان برای آمادگی، پناه‌گیری، تخلیه و بازگشت به شرایط عادی.',
      based:'بر پایهٔ دفترچهٔ ارائه‌شده', offline:'قابل استفاده آفلاین', updated:'تاریخ منبع: ۲۷ مهر ۱۴۰۵',
      urgentTitle:'اقدام سریع', urgentSub:'برای تصمیم فوری، از این راهنماها شروع کن.', explosion:'انفجار در نزدیکی', explosionSub:'محافظت از خود در برابر شیشه و آوار', smoke:'دود سمی', smokeSub:'کاهش تماس با دود در فضای بسته', leave:'باید خارج شوی؟', leaveSub:'از برنامهٔ تخلیهٔ خانواده استفاده کن',
      progressTitle:'چک‌لیست آمادگی', progressSub:'وسایل و اقدامات ضروری را مرحله‌به‌مرحله آماده کن.', progressAction:'باز کردن چک‌لیست‌ها', topics:'بخش‌های دفترچه', allTopics:'همهٔ بخش‌ها', moreTools:'ابزارهای کاربردی', plan:'برنامهٔ ۷۲ ساعتهٔ خانواده', planSub:'آب، اقلام ضروری و محل امن', verify:'بررسی هشدار', verifySub:'خبر تأییدشده را از شایعه جدا کن',
      sourceNotice:'این برنامه راهنمای آفلاین است، نه سامانهٔ هشدار زنده. گزارش وضعیت در سند اصلی درج شده و به‌صورت پیوسته راستی‌آزمایی نمی‌شود.',
      guideTitle:'راهنمای ایمنی', guideSub:'۱۲ بخش برگرفته از دفترچهٔ ارائه‌شده.', searchPlaceholder:'جست‌وجوی راهنما، وسایل، علائم…',
      checklistTitle:'چک‌لیست‌ها', checklistSub:'هنگام آماده‌سازی موارد را علامت بزن. پیشرفت روی همین دستگاه ذخیره می‌شود.',
      tabHome:'خانه', tabGoBag:'کیف خروج', tabFamily:'برنامه خانواده', tabMonthly:'بازبینی ماهانه', tabAfter:'پس از حمله',
      homeList:'آمادگی خانه', goBag:'کیف خروج؛ یک عدد برای هر نفر', family:'برنامهٔ ارتباط خانواده', monthly:'بازبینی ماهانهٔ آمادگی', after:'پس از حمله',
      done:'انجام‌شده', clearProgress:'بازنشانی این فهرست', resetConfirm:'پیشرفت همین چک‌لیست روی این دستگاه پاک شود؟',
      moreTitle:'منابع و تنظیمات', emergency:'شماره‌های اضطراری', ambulance:'اورژانس', police:'پلیس', fire:'آتش‌نشانی', verifyNumbers:'پیش از اتکا به شماره‌ها، آن‌ها را در محل خود تأیید کن.',
      original:'مطالعهٔ متن کامل دفترچهٔ اصلی', originalSub:'متن انگلیسی استخراج‌شده از فایل PDF ارائه‌شده، ۲۷ صفحه.', openPdf:'باز کردن PDF اصلی', about:'دربارهٔ برنامه', privacy:'حریم خصوصی', noAccounts:'نیازی به حساب کاربری نیست. زبان و وضعیت چک‌لیست‌ها روی همین دستگاه ذخیره می‌شوند.',
      language:'زبان', persian:'فارسی', english:'English', appearance:'نمایش', compact:'کارت‌های فشرده', notifications:'اعلان‌ها', notificationsSub:'این نسخهٔ آفلاین هشدار اضطراری زنده ارسال نمی‌کند.',
      back:'بازگشت', readSource:'مطالعهٔ متن انگلیسی این بخش', actions:'اقدامات پیشنهادی', remember:'نکتهٔ مهم', startChecklist:'باز کردن چک‌لیست مرتبط', saveNote:'پیشرفت روی همین دستگاه ذخیره می‌شود.', sourceTitle:'متن اصلی دفترچه', sourceSub:'متن انگلیسی PDF ارائه‌شده، بر اساس ۱۲ بخش.', searchSource:'جست‌وجو در متن اصلی…', sourcePartAll:'همهٔ بخش‌ها',
      noResults:'مطلبی با این عبارت پیدا نشد.', result:'نتیجه', results:'نتیجه', clearSearch:'پاک کردن جست‌وجو', install:'نصب برنامه', installTip:'از منوی مرورگر گزینهٔ «نصب برنامه» یا «افزودن به صفحهٔ اصلی» را انتخاب کن.',
      warningTitle:'پیش از انتشار هشدار، این ۵ مورد را بررسی کن', warningQuestions:[
        'منبع اصلی خبر چیست؟ آیا می‌توانم بیانیهٔ خود منبع را پیدا کنم؟',
        'آیا دست‌کم دو منبع مستقل و معتبر آن را تأیید کرده‌اند؟',
        'تاریخ خبر چیست و آیا هنوز اعتبار دارد؟',
        'ممکن است تصویر قدیمی یا اسکرین‌شات بدون منبع باشد؟',
        'اگر چند دقیقه برای بررسی صبر کنم، چه چیزی را از دست می‌دهم؟'
      ],
      appNote:'اطلاعات ایمنی عمومی است و جایگزین دستور مقام‌های محلی یا متخصصان پزشکی نیست. راهنمای جاری و شماره‌های محلی را بررسی کن.',
      detailsLabel:'بخش', source:'منبع', emergencyCaution:'اگر خطر فوری وجود دارد، ابتدا به محل پوشیده و امن برو و دستورهای اضطراری محلیِ تأییدشده را دنبال کن.',
      sourceDisputed:'در منبع آمده است که آمار تلفات و برخی روایت‌ها مورد اختلاف یا ناقص‌اند؛ ارقام تخمینی را قطعی تلقی نکن.',
      pdfButton:'باز کردن PDF ارائه‌شده', installTitle:'نصب روی اندروید', installBody:'در اندروید، برنامه را از یک نشانی امن در Chrome باز کن و از منوی مرورگر «نصب برنامه / افزودن به صفحهٔ اصلی» را بزن. برای ساخت APK بومی، فایل README پروژهٔ اندروید را ببین.'
    }
  };
  const t = key => ui[lang][key] ?? ui.en[key] ?? key;

  const sections = [
    {id:1,icon:'◉',color:'#fff0e6',ink:'#d96827',en:'What Tehran lived through and current context',fa:'تجربه‌های تهران و وضعیت گزارش‌شده',descEn:'What residents reported, and how to treat a dated situation summary.',descFa:'گزارش‌های ساکنان و نحوهٔ برخورد با خلاصهٔ وضعیتِ تاریخ‌دار.',introEn:'The supplied booklet describes residents’ reported experiences during the 39-day war and summarizes a changing political and security context as of 19 October 2026. It is background material, not a live status feed.',introFa:'دفترچهٔ ارائه‌شده تجربه‌های گزارش‌شدهٔ ساکنان در جریان جنگ ۳۹روزه و وضعیت سیاسی‌ـ‌امنیتی تا ۱۹ اکتبر ۲۰۲۶ را خلاصه می‌کند. این مطالب برای زمینهٔ تاریخی‌اند، نه گزارش زندهٔ وضعیت.',actionsEn:['Treat casualty totals and individual accounts as estimates or disputed where the source says so.','Do not assume a ceasefire guarantees safety or that a rumour predicts an attack.','Use current, verified local instructions to make decisions today.'],actionsFa:['آمار تلفات و روایت‌های فردی را هرجا منبع گفته است، تخمینی یا مورد اختلاف در نظر بگیر.','آتش‌بس را تضمین امنیت و شایعه را پیش‌بینی حمله تلقی نکن.','برای تصمیم امروز، دستورهای جاری و تأییدشدهٔ محلی را مبنا قرار بده.'],noteEn:'The app does not predict whether or when conflict will resume.',noteFa:'این برنامه پیش‌بینی نمی‌کند درگیری چه زمانی یا آیا از سر گرفته می‌شود.'},
    {id:2,icon:'⌂',color:'#e6f6ef',ink:'#168461',en:'Prepare the home for 72 hours',fa:'آماده‌سازی خانه برای ۷۲ ساعت',descEn:'Shelter spot, water, supplies and a go-bag.',descFa:'محل پناه، آب، اقلام ضروری و کیف خروج.',introEn:'Aim to manage at home for at least 72 hours and to leave with one ready bag per person. Build supplies gradually and adapt the list to your household.',introFa:'هدف این است که دست‌کم ۷۲ ساعت در خانه دوام بیاوری و برای هر نفر یک کیف خروج آماده داشته باشی. اقلام را به‌تدریج تهیه و متناسب با خانواده تنظیم کن.',actionsEn:['Choose the lowest, most interior place away from glass; avoid balconies and large windows.','Keep drinking water: the source suggests 4 litres per person per day for at least 3 days.','Store ready-to-eat food, torches, batteries, power banks, radio, hygiene supplies and first aid.','Keep copies of IDs, prescriptions, cash and paper emergency contacts.','Secure heavy furniture, keep shoes and a torch near beds, and learn safe utility shut-offs.'],actionsFa:['پایین‌ترین بخش داخلی ساختمان را دور از شیشه انتخاب کن؛ از بالکن و پنجره‌های بزرگ دور بمان.','آب آشامیدنی نگه دار؛ منبع برای دست‌کم سه روز، روزانه ۴ لیتر به‌ازای هر نفر پیشنهاد می‌کند.','غذای آماده، چراغ‌قوه، باتری، پاوربانک، رادیو، اقلام بهداشتی و کمک‌های اولیه آماده کن.','رونوشت مدارک، نسخهٔ داروها، پول نقد و شماره‌های اضطراری کاغذی نگه دار.','وسایل سنگین را مهار کن، کنار تخت کفش و چراغ‌قوه بگذار و محل قطع ایمن انشعابات را یاد بگیر.'],noteEn:'Never use a fuel-burning stove or generator in a sealed room because of carbon monoxide.',noteFa:'اجاق سوختی یا ژنراتور را در اتاق بسته به کار نینداز؛ مونوکسیدکربن می‌تواند مرگبار باشد.'},
    {id:3,icon:'➜',color:'#eaf2ff',ink:'#266ac7',en:'Plan evacuation before you need it',fa:'برنامه‌ریزی تخلیه پیش از نیاز',descEn:'Pre-agreed triggers, destinations and a 15-minute list.',descFa:'معیارهای ازپیش‌تعیین‌شده، مقصدها و فهرست خروج ۱۵ دقیقه‌ای.',introEn:'Decide calmly what would make your household leave, where you would go, and what conditions make staying safer. Neither choice is risk-free.',introFa:'در آرامش تعیین کن چه شرایطی باعث خروج خانواده می‌شود، کجا می‌روید و چه وقت ماندن امن‌تر است. هیچ‌کدام از این دو انتخاب بدون خطر نیست.',actionsEn:['Identify two safe destinations in different directions and confirm that hosts can receive you.','Plan more than one route; keep a paper map and fuel where practical.','Leave earlier when a verified evacuation warning applies to your district, the building is unsafe, or essential care is unavailable.','If leaving, take documents, medicines, bags, water, cash and contacts; shut utilities only if safe.','If roads are more dangerous or you have no safe destination, sheltering in place can be a legitimate choice.'],actionsFa:['دو مقصد امن در جهت‌های متفاوت مشخص کن و از آمادگی میزبان مطمئن شو.','بیش از یک مسیر در نظر بگیر؛ در صورت امکان نقشهٔ کاغذی و سوخت کافی داشته باش.','اگر هشدار تخلیهٔ تأییدشده برای منطقه‌ات صادر شد، ساختمان ناایمن است یا مراقبت ضروری در دسترس نیست، زودتر خارج شو.','هنگام خروج مدارک، دارو، کیف‌ها، آب، پول و شماره‌ها را بردار؛ فقط اگر ایمن است انشعابات را قطع کن.','اگر جاده‌ها خطرناک‌ترند یا مقصد امن نداری، ماندن و پناه‌گرفتن می‌تواند انتخاب معقولی باشد.'],noteEn:'Do not attempt to follow a route merely because a social post recommends it; verify the current route and destination.',noteFa:'صرفاً به‌خاطر توصیهٔ یک پست شبکهٔ اجتماعی وارد مسیر نشو؛ مسیر و مقصد فعلی را بررسی کن.'},
    {id:4,icon:'☁',color:'#fff1e5',ink:'#c96825',en:'Toxic smoke and radiological events',fa:'دود سمی و رویدادهای پرتوی',descEn:'Reduce exposure and follow verified instructions.',descFa:'کاهش تماس با آلودگی و پیروی از دستورهای تأییدشده.',introEn:'The source emphasizes indoor shelter and verified official information for toxic smoke or a suspected radiological release. Do not travel toward a suspected site to investigate.',introFa:'منبع برای دود سمی یا احتمال انتشار مواد پرتوزا بر پناه‌گیری داخل ساختمان و پیروی از اطلاعات رسمیِ تأییدشده تأکید می‌کند. برای بررسی به محل مشکوک نزدیک نشو.',actionsEn:['Go indoors; close windows, doors and vents, and turn off systems that draw outside air.','If you must go outside, use a well-fitting N95/FFP2 mask if available; change clothes on return.','If oily or black rain contacts skin, do not rub; rinse with water and remove contaminated clothing.','After being outdoors during a suspected release, remove outer clothing, bag it, and wash skin and hair gently.','Take potassium iodide only when instructed by authorities; it does not protect against all radiation.'],actionsFa:['به داخل ساختمان برو؛ درها، پنجره‌ها و دریچه‌ها را ببند و سامانه‌هایی را که هوای بیرون می‌کشند خاموش کن.','اگر خروج ضروری است و ماسک مناسب داری، از N95/FFP2 استفاده کن؛ پس از برگشت لباس را عوض کن.','اگر باران سیاه یا روغنی به پوست رسید، آن را نمال؛ با آب بشوی و لباس آلوده را خارج کن.','پس از حضور بیرون در رویداد پرتوی مشکوک، لباس رویی را درآور و کیسه کن و پوست و مو را آرام بشوی.','قرص یدید پتاسیم را فقط با دستور مقام مسئول مصرف کن؛ این قرص از همهٔ انواع پرتو محافظت نمی‌کند.'],noteEn:'Seek urgent care for persistent breathlessness, chest pain, severe cough or eye injury. Do not tightly seal a room for a long time if doing so stops necessary fresh air.',noteFa:'برای تنگی نفس مداوم، درد قفسهٔ سینه، سرفهٔ شدید یا آسیب چشم کمک پزشکی فوری بگیر. اتاق را برای مدت طولانی طوری درزبندی نکن که هوای لازم قطع شود.'},
    {id:5,icon:'⚠',color:'#fff0f0',ink:'#c53a47',en:'Explosions, collapse and fire',fa:'انفجار، ریزش ساختمان و آتش‌سوزی',descEn:'Stay low, protect your head and keep away from glass.',descFa:'پایین بمان، از سر محافظت کن و از شیشه فاصله بگیر.',introEn:'Flying glass, fragments and falling debris cause many injuries. You do not need to identify the sound or weapon before taking basic cover.',introFa:'شیشهٔ پرتاب‌شده، ترکش و آوار باعث بسیاری از آسیب‌ها می‌شوند. پیش از پناه‌گیری لازم نیست صدا یا نوع سلاح را تشخیص بدهی.',actionsEn:['Move away from windows and glass doors; do not go to a balcony or window to film.','Drop low and cover your head and neck; use a sturdy table or interior wall if available.','Stay under cover for several minutes because debris or another blast may follow.','Outside, lie low behind solid cover and move away from damaged buildings when safe.','If trapped, limit dust, signal by tapping or whistle, and avoid flames if gas may be present.','Do not re-enter a damaged building; avoid lifts and downed cables.'],actionsFa:['از پنجره و در شیشه‌ای دور شو؛ برای فیلم‌گرفتن به بالکن یا پنجره نرو.','پایین برو و سر و گردن را بپوشان؛ در صورت امکان زیر میز محکم یا کنار دیوار داخلی پناه بگیر.','چند دقیقه زیر پوشش بمان؛ ممکن است آوار یا انفجار دیگری رخ دهد.','اگر بیرون هستی، پشت پوشش محکم روی زمین بخواب و وقتی امن شد از ساختمان آسیب‌دیده دور شو.','اگر گرفتار شدی، گردوغبار را کم کن و با ضربه به لوله/دیوار یا سوت علامت بده؛ اگر احتمال نشت گاز هست شعله ایجاد نکن.','وارد ساختمان آسیب‌دیده نشو؛ از آسانسور و کابل‌های افتاده دوری کن.'],noteEn:'Do not approach a strike site to watch, film or help without training; secondary strikes and unstable structures are dangerous.',noteFa:'برای تماشا، فیلم‌برداری یا کمک بدون آموزش به محل اصابت نزدیک نشو؛ حملهٔ مجدد و سازهٔ ناپایدار خطرناک‌اند.'},
    {id:6,icon:'⌁',color:'#eaf5ff',ink:'#2874c7',en:'Communications during an outage',fa:'ارتباطات هنگام قطع اینترنت',descEn:'Prepare offline contacts, maps, radio and power.',descFa:'شماره‌های کاغذی، نقشه، رادیو و شارژ را آماده کن.',introEn:'Plan as if mobile data, power, card payments or calls could become unreliable. Agree on a simple family check-in procedure before an outage.',introFa:'طوری برنامه‌ریزی کن که اینترنت موبایل، برق، پرداخت کارتی یا تماس‌ها ممکن است مختل شوند. پیش از قطعی، روش سادهٔ اعلام سلامت خانواده را توافق کنید.',actionsEn:['Write important phone numbers and addresses on paper.','Choose one contact outside your city/district to relay brief “I am OK” messages.','Set fixed check-in times rather than redialling continuously.','Download offline maps and keep a paper map and printed safety checklist.','Charge power banks and use a battery or hand-crank radio; verify station schedules in advance.','Do not forward unverified images, voice notes or claimed evacuation alerts.'],actionsFa:['شماره‌ها و نشانی‌های مهم را روی کاغذ بنویس.','یک نفر خارج از شهر/منطقه را برای انتقال پیام کوتاه «سالمم» تعیین کن.','زمان مشخص برای اعلام وضعیت بگذار؛ پیوسته و پشت‌سرهم تماس نگیر.','نقشهٔ آفلاین دانلود کن و نقشهٔ کاغذی و چک‌لیست چاپی داشته باش.','پاوربانک را شارژ کن و رادیوی باتری‌خور یا هندلی داشته باش؛ زمان پخش شبکه‌ها را از قبل بررسی کن.','عکس، پیام صوتی یا هشدار تخلیهٔ تأییدنشده را بازنشر نکن.'],noteEn:'Do not share or film locations of strikes, checkpoints or military positions.',noteFa:'مکان اصابت‌ها، ایست‌های بازرسی یا مواضع نظامی را منتشر نکن و از آن‌ها فیلم نگیر.'},
    {id:7,icon:'♡',color:'#f3eaff',ink:'#7c50b1',en:'Stress, fear and mental wellbeing',fa:'ترس، اضطراب و سلامت روان',descEn:'Ground your body, protect sleep and stay connected.',descFa:'بدن را آرام کن، از خواب محافظت کن و در ارتباط بمان.',introEn:'Fear, poor sleep and exhaustion can be normal reactions to danger. Aim to keep functioning, connected and aware of when more help is needed.',introFa:'ترس، بدخوابی و خستگی می‌توانند واکنش طبیعی به خطر باشند. هدف این است که عملکرد روزمره و ارتباطت حفظ شود و بدانی چه زمانی کمک بیشتری لازم است.',actionsEn:['Breathe out slowly; try inhaling for 4 counts and exhaling for 6–8 counts several times.','Ground yourself by naming five things you see, four you feel, three you hear, two you smell and one you taste.','Keep a simple routine for waking, eating, washing and sleeping when conditions allow.','Limit news to a few scheduled checks from reliable sources.','Avoid using alcohol, extra caffeine or sleep medication to self-treat stress; use medicines only as prescribed.','Seek help for prolonged inability to sleep, panic that prevents functioning, flashbacks or thoughts of self-harm.'],actionsFa:['آهسته بازدم کن؛ چند بار ۴ شماره دم و ۶ تا ۸ شماره بازدم را امتحان کن.','پنج چیز دیدنی، چهار چیز لمس‌کردنی، سه صدا، دو بو و یک مزه را نام ببر تا به زمان حال برگردی.','در حد امکان برای بیدارشدن، غذا، شست‌وشو و خواب برنامهٔ ساده حفظ کن.','خبرها را فقط چند نوبت مشخص و از منابع قابل‌اعتماد بررسی کن.','برای خوددرمانی اضطراب از الکل، کافئین اضافه یا داروی خواب استفاده نکن؛ دارو را فقط طبق تجویز مصرف کن.','اگر چند شب نمی‌توانی بخوابی، اضطراب عملکردت را مختل کرده، دچار بازتجربهٔ مداوم یا فکر آسیب به خود شده‌ای، کمک بگیر.'],noteEn:'If someone may harm themselves, stay with them if safe, reduce access to means of harm and contact local emergency or crisis services.',noteFa:'اگر احتمال آسیب‌زدن فرد به خودش وجود دارد، در صورت ایمن‌بودن کنارش بمان، دسترسی به وسایل آسیب‌زا را کم کن و با خدمات اضطراری یا بحران محلی تماس بگیر.'},
    {id:8,icon:'✓',color:'#e6f6ef',ink:'#168461',en:'Verified warnings versus rumours',fa:'هشدار تأییدشده در برابر شایعه',descEn:'Check source, date and independent confirmation.',descFa:'منبع، تاریخ و تأیید مستقل را بررسی کن.',introEn:'No single indicator can predict war with certainty. Combine several reliable signals and act on a pre-agreed household plan rather than on one alarming post.',introFa:'هیچ نشانهٔ واحدی نمی‌تواند جنگ را با قطعیت پیش‌بینی کند. چند علامت معتبر را کنار هم بگذار و بر اساس برنامهٔ ازپیش‌توافق‌شده عمل کن، نه یک پست ترسناک.',actionsEn:['Find the original statement rather than relying on a screenshot.','Check at least two independent, reputable sources.','Confirm the date, location and whether the claim is still current.','Treat certainty such as “it starts tonight at 2 am” as a red flag without evidence.','Use a family traffic-light plan: maintain readiness, increase preparations if several signals worsen, and follow verified emergency instructions when danger is immediate.'],actionsFa:['به‌جای اسکرین‌شات، بیانیه یا منبع اصلی را پیدا کن.','خبر را با دست‌کم دو منبع معتبر و مستقل بررسی کن.','تاریخ، مکان و جاری‌بودن خبر را تأیید کن.','ادعای قطعی مثل «امشب ساعت ۲ شروع می‌شود» را بدون مدرک نشانهٔ هشدار بدان.','برای خانواده وضعیت سبز/زرد/قرمز تعریف کن: آمادگی را حفظ کن، با بدترشدن چند علامت آماده‌سازی را افزایش بده و هنگام خطر فوری از دستورهای اضطراری تأییدشده پیروی کن.'],noteEn:'Absence of a rumour is not proof of safety; a rumour alone is not proof of danger. Verify and prepare calmly.',noteFa:'نبود شایعه نشانهٔ قطعی امنیت نیست و وجود شایعه هم خطر را ثابت نمی‌کند؛ بررسی کن و آرام آماده باش.'},
    {id:9,icon:'◖',color:'#fff4dc',ink:'#aa7515',en:'Sounds are not a reliable forecast',fa:'صداها پیش‌بینی قابل‌اعتماد نیستند',descEn:'React safely first; do not try to identify a weapon.',descFa:'اول ایمن واکنش نشان بده؛ دنبال تشخیص سلاح نباش.',introEn:'Echoes, terrain, weather and different sound sources make it difficult to identify an event from sound alone. A quiet sky is not a guarantee of safety.',introFa:'بازتاب صدا، پستی‌وبلندی، هوا و منابع صوتی متفاوت تشخیص رخداد را فقط از روی صدا دشوار می‌کنند. سکوت آسمان تضمین امنیت نیست.',actionsEn:['For an unidentified loud sudden sound, move from windows and get low.','Wait a few minutes and check for damage, smoke, gas smell or injuries only when safe.','Listen for verified information; do not state a guess as fact.','Do not go to rooftops or balconies to watch or film.','After interception sounds, stay sheltered because fragments may fall.'],actionsFa:['با شنیدن صدای ناگهانی و نامشخص، از پنجره دور شو و پایین برو.','چند دقیقه صبر کن؛ فقط اگر ایمن است آسیب، دود، بوی گاز یا مصدومیت را بررسی کن.','اطلاعات تأییدشده را دنبال کن و حدس را به‌عنوان واقعیت بیان نکن.','برای تماشا یا فیلم‌گرفتن به پشت‌بام و بالکن نرو.','پس از صدای رهگیری، زیر پوشش بمان؛ ممکن است قطعات سقوط کنند.'],noteEn:'Do not wait to identify the sound before taking cover.',noteFa:'برای شناسایی صدا، پناه‌گیری را به تأخیر نینداز.'},
    {id:10,icon:'⬡',color:'#eaf2ff',ink:'#2767b8',en:'Weapons and civilian effects',fa:'سلاح‌ها و پیامدهای آن برای غیرنظامیان',descEn:'Focus on blast, debris, fire and unexploded objects.',descFa:'بر موج انفجار، آوار، آتش و مهمات عمل‌نکرده تمرکز کن.',introEn:'This section of the supplied handbook offers general, non-technical descriptions. For civilians, the immediate concerns are blast effects, glass and fragments, fire, collapse and infrastructure disruption.',introFa:'این بخش از دفترچه، توضیحی کلی و غیرتخصصی ارائه می‌دهد. برای غیرنظامیان، خطر فوری شامل موج انفجار، شیشه و ترکش، آتش، فروریزش و اختلال زیرساخت‌هاست.',actionsEn:['Move away from windows and seek low, interior cover.','Never touch, move or collect a suspicious unexploded object.','Keep children away and report the object to local police or emergency services from a safe distance.','Avoid gathering near damaged infrastructure or sensitive locations.','Do not assume a weapon described as “precise” makes the surrounding area safe.'],actionsFa:['از پنجره دور شو و پوشش کم‌ارتفاع و داخلی پیدا کن.','هیچ شیء مشکوک یا مهمات عمل‌نکرده‌ای را لمس، جابه‌جا یا جمع‌آوری نکن.','کودکان را دور نگه دار و از فاصلهٔ امن موضوع را به پلیس یا خدمات اضطراری محلی گزارش کن.','نزدیک زیرساخت آسیب‌دیده یا مکان حساس تجمع نکن.','تصور نکن سلاحی که «دقیق» توصیف می‌شود، اطراف آن را امن می‌کند.'],noteEn:'Keep away from suspicious objects; do not try to identify or disassemble them.',noteFa:'از اشیای مشکوک فاصله بگیر؛ برای شناسایی دقیق یا بازکردن آن‌ها تلاش نکن.'},
    {id:11,icon:'▣',color:'#f0ebff',ink:'#7252bd',en:'Checkpoint safety',fa:'ایمنی در ایست‌های بازرسی',descEn:'Be calm, visible and predictable; do not film.',descFa:'آرام و قابل‌پیش‌بینی باش؛ فیلم نگیر.',introEn:'The source says experiences at checkpoints varied. General guidance is to remain calm, keep hands visible, avoid sudden movement and follow lawful safety instructions without escalating the encounter.',introFa:'طبق منبع، تجربهٔ افراد در ایست‌های بازرسی متفاوت بوده است. راهنمای کلی این است که آرام بمانی، دست‌ها دیده شوند، حرکت ناگهانی نکنی و از تشدید موقعیت پرهیز کنی.',actionsEn:['Carry identification in an easy-to-reach place.','Slow down early and stop where directed; keep hands visible.','Tell an officer before reaching into a pocket, bag or glove compartment.','Do not photograph or film personnel, vehicles, weapons or the checkpoint.','If asked to exit, show ID or open a compartment, move slowly and explain what you are doing.','If detained, stay calm, avoid physical resistance and ask to contact a relative or lawyer where possible.'],actionsFa:['مدرک شناسایی را در محل قابل‌دسترسی نگه دار.','از فاصله کم‌کم سرعت را کم کن و در محل اعلام‌شده بایست؛ دست‌ها را قابل‌مشاهده نگه دار.','پیش از دست‌بردن به جیب، کیف یا داشبورد، موضوع را اعلام کن.','از نیروها، خودروها، سلاح‌ها یا ایست بازرسی عکس و فیلم نگیر.','اگر خواستند پیاده شوی، مدرک نشان بدهی یا محفظه‌ای را باز کنی، آرام حرکت کن و بگو چه می‌کنی.','اگر بازداشت شدی، آرام بمان، مقاومت فیزیکی نکن و در صورت امکان درخواست تماس با نزدیکان یا وکیل بده.'],noteEn:'Local laws and circumstances vary. Prioritize immediate physical safety and avoid sudden movements.',noteFa:'قانون و شرایط محلی متفاوت است. امنیت فیزیکی فوری را در اولویت بگذار و حرکت ناگهانی نکن.'},
    {id:12,icon:'✚',color:'#e6f6ef',ink:'#17856a',en:'First aid, water and recovery',fa:'کمک‌های اولیه، آب و بازیابی',descEn:'Simple first actions, vulnerable people and after-attack checks.',descFa:'اقدامات اولیه، افراد آسیب‌پذیر و بررسی‌های پس از حمله.',introEn:'These are only basic reminders from the source, not hands-on first-aid training. Call local emergency services for serious injuries and follow dispatcher instructions.',introFa:'این موارد فقط یادآوری‌های پایه برگرفته از منبع هستند، نه جایگزین آموزش عملی کمک‌های اولیه. برای آسیب جدی با خدمات اضطراری محلی تماس بگیر و دستور اپراتور را دنبال کن.',actionsEn:['For severe bleeding, apply firm direct pressure with a clean cloth; use a tourniquet only if trained or instructed.','If someone is unconscious but breathing normally, place them on their side if safe; if not breathing normally, call emergency services and start CPR if trained.','Cool burns with cool running water; do not apply ice, toothpaste or butter.','Never use generators, charcoal or fuel-burning appliances inside a closed room.','Check on children, older adults, disabled people, people with chronic illness and pets.','After an attack, avoid damaged buildings, fallen cables, strike sites and suspicious objects; report hazards.'],actionsFa:['برای خون‌ریزی شدید، با پارچهٔ تمیز فشار مستقیم و محکم وارد کن؛ از تورنیکه فقط اگر آموزش دیده‌ای یا راهنمایی شده‌ای استفاده کن.','اگر فرد بیهوش است اما طبیعی نفس می‌کشد و شرایط ایمن است، او را به پهلو قرار بده؛ اگر طبیعی نفس نمی‌کشد، با اورژانس تماس بگیر و در صورت آموزش CPR را شروع کن.','سوختگی را با آب خنک جاری سرد کن؛ یخ، خمیردندان یا کره نزن.','ژنراتور، زغال یا وسیلهٔ سوختی را داخل اتاق بسته روشن نکن.','از کودکان، سالمندان، افراد دارای معلولیت، بیماری مزمن و حیوانات خانگی مراقبت کن.','پس از حمله از ساختمان آسیب‌دیده، کابل افتاده، محل اصابت و اشیای مشکوک دور بمان و خطرها را گزارش کن.'],noteEn:'The source lists Iran emergency numbers 115 (ambulance), 110 (police) and 125 (fire). Confirm numbers locally. This app cannot call emergency services.',noteFa:'منبع شماره‌های ایران را ۱۱۵ (اورژانس)، ۱۱۰ (پلیس) و ۱۲۵ (آتش‌نشانی) ذکر می‌کند. شماره‌ها را در محل تأیید کن. این برنامه امکان تماس با خدمات اضطراری را ندارد.'}
  ];

  const quick = {
    explosion:{icon:'⚠', title:{en:'If an explosion happens nearby',fa:'اگر انفجاری در نزدیکی رخ داد'},lead:{en:'Protect yourself first. Do not go to a window to see what happened.',fa:'اول از خودت محافظت کن. برای دیدن محل حادثه به پنجره نرو.'},steps:{en:['Move away from windows and glass doors immediately.','Drop low and cover your head and neck. Use a sturdy table or interior wall if available.','Stay under cover for several minutes; another blast or falling debris may follow.','Check people for serious injuries only when it is safe.','Send a short status message when possible; do not film or share a guessed location.'],fa:['فوراً از پنجره‌ها و درهای شیشه‌ای دور شو.','پایین برو و سر و گردن را بپوشان؛ در صورت امکان زیر میز محکم یا کنار دیوار داخلی پناه بگیر.','چند دقیقه زیر پوشش بمان؛ ممکن است انفجار دیگری یا آوار رخ دهد.','فقط وقتی امن است، آسیب‌های جدی اطرافیان را بررسی کن.','در صورت امکان پیام کوتاه وضعیت بفرست؛ فیلم نگیر و مکان حدسی را منتشر نکن.']},note:{en:'If the building is damaged, do not use lifts or re-enter it for belongings.',fa:'اگر ساختمان آسیب دیده است، از آسانسور استفاده نکن و برای برداشتن وسایل وارد آن نشو.'}},
    smoke:{icon:'☁',title:{en:'If toxic smoke is nearby',fa:'اگر دود سمی در نزدیکی است'},lead:{en:'Limit exposure and follow verified local instructions.',fa:'تماس با دود را کاهش بده و دستورهای محلیِ تأییدشده را دنبال کن.'},steps:{en:['Go indoors and close windows, doors and vents.','Turn off ventilation or air conditioning that draws outdoor air.','Do not go outside to watch smoke or investigate.','If exposed outdoors, remove outer clothing on return and wash exposed skin gently.','Seek urgent medical care for severe or persistent breathing difficulty, chest pain or eye injury.'],fa:['به داخل برو و در، پنجره و دریچه‌ها را ببند.','تهویه یا کولری را که هوای بیرون را وارد می‌کند خاموش کن.','برای تماشای دود یا بررسی محل بیرون نرو.','اگر بیرون در معرض دود بوده‌ای، پس از بازگشت لباس رویی را درآور و پوست را آرام بشوی.','برای تنگی نفس شدید یا مداوم، درد قفسهٔ سینه یا آسیب چشم فوراً کمک پزشکی بگیر.']},note:{en:'A cloth is not equivalent to a well-fitting N95/FFP2 respirator. Do not tightly seal a room for long periods.',fa:'پارچه معادل ماسک تنفسی N95/FFP2 مناسب نیست. اتاق را برای مدت طولانی کاملاً درزبندی نکن.'}},
    leave:{icon:'➜',title:{en:'If you may need to evacuate',fa:'اگر ممکن است نیاز به تخلیه داشته باشی'},lead:{en:'Follow verified evacuation orders. Do not decide from a rumour alone.',fa:'از دستور تخلیهٔ تأییدشده پیروی کن. فقط بر اساس شایعه تصمیم نگیر.'},steps:{en:['Use a safe destination already confirmed with your host.','Take identification, medicines, go-bags, water, cash, chargers and paper contacts.','Tell the family contact your destination and intended route.','Shut gas, water or electricity only if you can do so safely.','If roads are unsafe or you have no safe destination, use your household shelter plan and verified instructions.'],fa:['از مقصد امنی استفاده کن که از قبل با میزبان هماهنگ شده است.','مدرک شناسایی، دارو، کیف خروج، آب، پول، شارژر و شماره‌های کاغذی را بردار.','مقصد و مسیر موردنظر را به رابط خانواده اطلاع بده.','فقط در صورتی که ایمن است، گاز، آب یا برق را قطع کن.','اگر جاده ناامن است یا مقصد امن نداری، طبق برنامهٔ پناه‌گیری خانواده و دستورهای تأییدشده عمل کن.']},note:{en:'Do not drive toward a strike, checkpoint incident or rumoured safe route.',fa:'به سمت محل اصابت، حادثهٔ ایست بازرسی یا مسیری که شایعه شده امن است رانندگی نکن.'}}
  };

  const checklistDefs = {
    home:{title:{en:'Home preparedness',fa:'آمادگی خانه'},desc:{en:'Aim for 72 hours at home.',fa:'هدف: آمادگی برای ۷۲ ساعت در خانه.'},items:[['water','Store drinking water for household members'],['food','Prepare shelf-stable, ready-to-eat food'],['light','Charge power banks and prepare torches/batteries'],['radio','Prepare a battery or hand-crank radio'],['firstaid','Check first-aid supplies and basic skills'],['meds','Keep regular medicines and prescription copies'],['hygiene','Prepare hygiene and sanitation supplies'],['mask','Store suitable dust/smoke masks if available'],['warm','Prepare blankets and seasonal clothes'],['cash','Keep small cash notes'],['shelter','Choose an interior shelter spot away from glass'],['utilities','Learn where gas, water and electricity shut-offs are'],['furniture','Secure heavy shelves and TVs; keep exits clear'],['contacts','Write family numbers and addresses on paper']]},
    gobag:{title:{en:'Go-bag — one per person',fa:'کیف خروج؛ یک عدد برای هر نفر'},desc:{en:'Keep the bag reachable and review it monthly.',fa:'کیف را در دسترس نگه دار و ماهانه بررسی کن.'},items:[['id','ID and copies of important documents'],['meds','Medicines for several days and prescriptions'],['glasses','Glasses, allergies and medical information on paper'],['water','Water and compact snacks'],['light','Torch and spare batteries'],['power','Charged power bank and charging cable'],['clothes','Sturdy shoes and a change of clothes'],['mask','Scarf or suitable mask'],['cash','Cash and payment alternatives'],['contacts','Paper list of phone numbers and addresses'],['children','Items for infants, older adults or children if needed'],['pets','Pet carrier, food and records if applicable']]},
    family:{title:{en:'Family communication plan',fa:'برنامهٔ ارتباط خانواده'},desc:{en:'Agree roles and meeting points in advance.',fa:'نقش‌ها و محل‌های ملاقات را از قبل هماهنگ کنید.'},items:[['near','Choose one meeting point near home'],['far','Choose a second meeting point outside the district'],['contact','Choose an out-of-city contact'],['time','Agree fixed times for check-in messages'],['school','Agree who collects children and where they go'],['route','Share routes and expected arrival when travelling'],['care','Assign support for older adults and people with medical needs'],['pets','Agree what to do with pets'],['plan','Write down the evacuation decision triggers']]},
    monthly:{title:{en:'Monthly readiness check',fa:'بازبینی ماهانهٔ آمادگی'},desc:{en:'Set a recurring reminder on your device.',fa:'برای تکرار ماهانه در دستگاه خود یادآور تنظیم کن.'},items:[['rotate','Rotate water and food before expiry'],['power','Charge and test power banks and torches'],['radio','Test the radio and note current station schedules'],['meds','Refill medicines before supplies run low'],['fuel','Check vehicle fuel and basic readiness if relevant'],['bag','Review go-bag documents and cash'],['contacts','Update family and neighbour contact details'],['shelter','Review shelter place and exit routes'],['children','Practise the family plan in an age-appropriate way']]},
    after:{title:{en:'After an attack',fa:'پس از حمله'},desc:{en:'Check people and immediate hazards before anything else.',fa:'قبل از هر چیز، افراد و خطرهای فوری را بررسی کن.'},items:[['people','Check yourself, household and nearby people for injuries'],['bleeding','Prioritize severe bleeding and call for help when needed'],['utilities','Check gas, electricity and water; shut off if damaged and safe'],['lifts','Avoid lifts, damaged buildings and fallen cables'],['site','Stay away from the strike site and possible secondary hazards'],['objects','Never touch suspicious or unexploded objects'],['message','Send a short status message to the family contact'],['records','Photograph damage only when safe and keep receipts'],['rest','Drink, eat and rest when possible']]}
  };

  const checklistTranslations={
    fuel:['Check fuel and basic vehicle readiness','سوخت و آمادگی پایهٔ خودرو را بررسی کن'],lifts:['Avoid lifts, damaged buildings and fallen cables','از آسانسور، ساختمان آسیب‌دیده و کابل افتاده دوری کن'],
    water:['Drinking water for all household members','آب آشامیدنی برای همهٔ اعضای خانه'],food:['Shelf-stable, ready-to-eat food','غذای ماندگار و آمادهٔ مصرف'],light:['Torches, batteries and charged power banks','چراغ‌قوه، باتری و پاوربانک شارژشده'],radio:['Battery or hand-crank radio','رادیوی باتری‌خور یا هندلی'],firstaid:['First-aid supplies and basic skills','وسایل و مهارت پایهٔ کمک‌های اولیه'],meds:['Regular medicines and prescription copies','داروهای همیشگی و رونوشت نسخه'],hygiene:['Hygiene and sanitation supplies','وسایل بهداشت و نظافت'],mask:['Suitable dust/smoke masks if available','ماسک مناسب گردوغبار/دود در صورت دسترسی'],warm:['Blankets and seasonal clothes','پتو و لباس مناسب فصل'],cash:['Small cash notes','اسکناس نقد خرد'],shelter:['Interior shelter place away from glass','محل پناه داخلی دور از شیشه'],utilities:['Know the safe utility shut-off points','محل قطع ایمن انشعابات را بدان'],furniture:['Secure heavy furniture and clear exits','وسایل سنگین را مهار و خروجی‌ها را خلوت کن'],contacts:['Paper emergency contacts and addresses','شماره‌های اضطراری و نشانی‌ها روی کاغذ'],id:['ID and copies of important documents','مدرک شناسایی و رونوشت مدارک مهم'],glasses:['Glasses, allergies and medical information on paper','عینک، آلرژی و اطلاعات پزشکی روی کاغذ'],power:['Charged power bank and cable','پاوربانک شارژشده و کابل'],clothes:['Sturdy shoes and a change of clothes','کفش محکم و لباس اضافه'],pets:['Pet carrier, food and records if applicable','باکس، غذا و مدارک حیوان خانگی در صورت نیاز'],near:['One meeting point near home','یک محل ملاقات نزدیک خانه'],far:['Second meeting point outside the district','محل ملاقات دوم خارج از منطقه'],contact:['Out-of-city family contact','رابط خانوادگی خارج از شهر'],time:['Fixed times for family check-ins','زمان‌های ثابت برای اعلام وضعیت'],school:['Plan for collecting children from school','برنامهٔ تحویل گرفتن کودکان از مدرسه'],route:['Share route and expected arrival','مسیر و زمان تقریبی رسیدن را اطلاع بده'],care:['Assign support for vulnerable family members','برای اعضای آسیب‌پذیر خانواده کمک تعیین کن'],plan:['Write evacuation triggers in advance','معیارهای تخلیه را از قبل بنویس'],rotate:['Rotate water and food before expiry','آب و غذا را پیش از انقضا جایگزین کن'],bag:['Review go-bag documents and cash','مدارک و پول کیف خروج را بازبینی کن'],children:['Practise the family plan appropriately','برنامهٔ خانواده را متناسب با شرایط تمرین کن'],people:['Check household and nearby people for injuries','آسیب‌دیدگی افراد خانه و اطراف را بررسی کن'],bleeding:['Prioritize severe bleeding and call for help','خون‌ریزی شدید را در اولویت قرار بده و کمک بخواه'],site:['Stay away from strike sites and secondary hazards','از محل اصابت و خطرهای ثانویه دور بمان'],objects:['Never touch suspicious or unexploded objects','اشیای مشکوک یا مهمات عمل‌نکرده را لمس نکن'],message:['Send a short status message to family contact','به رابط خانواده پیام کوتاه وضعیت بفرست'],records:['Record damage only when safe','فقط در صورت ایمنی خسارت را ثبت کن'],rest:['Drink, eat and rest when possible','در صورت امکان آب و غذا بخور و استراحت کن']
  };
  function checklistItemText(key){const v=checklistTranslations[key];if(!v){const all=Object.values(checklistDefs).flatMap(g=>g.items);return all.find(i=>i[0]===key)?.[1]||key;}return v[lang==='fa'?1:0];}

  /* ───────────── Design layer v2: icons, theme, screens ───────────── */
  const P = {
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5.5h4V20"/>',
    book:'<path d="M4 19V5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H20"/><path d="M9 8h7"/>',
    check:'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="m8 12.2 2.8 2.8L16.2 9.4"/>',
    tick:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    moon:'<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.7 6.7 0 0 0 9.7 9.7z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    auto:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
    chevR:'<path d="m9.5 6 6 6-6 6"/>',
    chevL:'<path d="m14.5 6-6 6 6 6"/>',
    arrowL:'<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    alert:'<path d="M10.3 4 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.2M12 17.2h.01"/>',
    wind:'<path d="M9.6 5.2A2.3 2.3 0 1 1 11.3 9H2.5"/><path d="M12.8 18.8A2.3 2.3 0 1 0 14.5 15H2.5"/><path d="M17.8 8.4A2.7 2.7 0 1 1 19.6 13H2.5"/>',
    exit:'<path d="M10 20.5H5.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H10"/><path d="m16 16.5 4.5-4.5L16 7.5"/><path d="M20.5 12H9"/>',
    radio:'<circle cx="12" cy="12" r="1.8"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 5.4a9.4 9.4 0 0 0 0 13.2M18.6 5.4a9.4 9.4 0 0 1 0 13.2"/>',
    heart:'<path d="M12 20.5s-8-4.6-8-10.7A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8c0 6.1-8 10.7-8 10.7z"/>',
    shieldCheck:'<path d="M12 3 4.5 6v6c0 4.7 3.2 7.9 7.5 9 4.3-1.1 7.5-4.3 7.5-9V6z"/><path d="m8.8 12.2 2.3 2.3 4.2-4.4"/>',
    volume:'<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.2 9a4.2 4.2 0 0 1 0 6M18.2 6.3a8 8 0 0 1 0 11.4"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    flag:'<path d="M5 21.5V3.5"/><path d="M5 4.5h12.5l-2.2 3.8 2.2 3.8H5"/>',
    cross:'<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>',
    phone:'<path d="M21.5 16.6v2.9a2 2 0 0 1-2.2 2A19.5 19.5 0 0 1 2.5 4.7a2 2 0 0 1 2-2.2h2.9a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.3 10.4a16 16 0 0 0 5.3 5.3l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    download:'<path d="M20.5 15v4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M12 15V3.5"/>',
    info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 16.5v-5M12 7.8h.01"/>',
    file:'<path d="M14 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><path d="M14 3v5.5h5.5M8.5 13h7M8.5 17h5"/>',
    bell:'<path d="M18 9a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15.500 18 9z"/><path d="M13.700 21a2 2 0 0 1-3.400 0"/>',
    reset:'<path d="M3.5 12a8.500 8.500 0 1 0 2.700-6.200L3.500 8.500"/><path d="M3.500 3.500v5h5"/>',
    bag:'<rect x="3" y="7.500" width="18" height="13" rx="3"/><path d="M8.500 7.500V5.500a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 13h18"/>',
    users:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1"/><path d="M16 4.600a3.500 3.500 0 0 1 0 6.800M18.500 14.300a5 5 0 0 1 3 4.700v1"/>',
    calendar:'<rect x="3.500" y="4.500" width="17" height="16" rx="3"/><path d="M3.500 10h17M8 2.500v4M16 2.500v4"/>',
    zap:'<path d="M13 2.500 4.500 13.500H12l-1 8 8.500-11H12z"/>',
    sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18"/>',
    globe:'<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.400 3.700 5.200 3.700 8.500s-1.200 6.100-3.700 8.500c-2.500-2.400-3.700-5.200-3.700-8.500S9.500 5.900 12 3.500z"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    copy:'<rect x="8.500" y="8.500" width="12" height="12" rx="2.500"/><path d="M15.500 8.500v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>'
  };
  const ic = (name, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name]||''}</svg>`;
  const secIcon = {1:'clock',2:'home',3:'exit',4:'wind',5:'alert',6:'radio',7:'heart',8:'shieldCheck',9:'volume',10:'target',11:'flag',12:'cross'};
  const secTone = {1:'orange',2:'green',3:'blue',4:'amber',5:'red',6:'blue',7:'violet',8:'green',9:'amber',10:'violet',11:'orange',12:'green'};
  const quickMeta = {explosion:{icon:'alert',tone:'red'},smoke:{icon:'wind',tone:'amber'},leave:{icon:'exit',tone:'blue'},verify:{icon:'shieldCheck',tone:'green'}};
  const tabIcon = {home:'home',gobag:'bag',family:'users',monthly:'calendar',after:'cross'};
  const tile = (icon, tone, extra='') => `<span class="ico-tile tone-${tone} ${extra}">${ic(icon)}</span>`;
  const nf = n => Number(n).toLocaleString(lang==='fa'?'fa-IR':'en-US');
  const X = {
    en:{theme:'Appearance',themeAuto:'Auto',themeLight:'Light',themeDark:'Dark',themeSub:'Match your device, or choose.',callNow:'Call now',emergencyLead:'Emergency numbers (Iran)',prev:'Previous',next:'Next',searchEntry:'Search guidance, supplies, symptoms…',reset:'Reset this checklist?',resetBody:'All ticks in this list will be cleared on this device. This cannot be undone.',cancel:'Cancel',confirmReset:'Reset list',cardLang:'Language',partLabel:'Part',allParts:'All',sectionOf:'of',done:'Completed',remaining:'left',allDone:'All done — well prepared.',doneToggle:'Dark / light'},
    fa:{theme:'نمایش',themeAuto:'خودکار',themeLight:'روشن',themeDark:'تیره',themeSub:'مطابق دستگاه یا انتخاب دستی.',callNow:'تماس',emergencyLead:'شماره‌های اضطراری',prev:'قبلی',next:'بعدی',searchEntry:'جست‌وجو در راهنما، تجهیزات، علائم…',reset:'این چک‌لیست بازنشانی شود؟',resetBody:'همهٔ تیک‌های این فهرست روی این دستگاه پاک می‌شود و بازگشت‌پذیر نیست.',cancel:'انصراف',confirmReset:'بازنشانی',cardLang:'زبان',partLabel:'بخش',allParts:'همه',sectionOf:'از',done:'انجام‌شده',remaining:'مانده',allDone:'همه انجام شد؛ آماده‌ای.',doneToggle:'تیره / روشن'}
  };
  const x = k => X[lang][k];

  /* theme */
  let theme = load('ts_theme','auto'); if(!['auto','light','dark'].includes(theme)) theme='auto';
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  const isDark = () => theme==='dark' || (theme==='auto' && mq && mq.matches);
  function applyTheme(){const d=isDark();document.documentElement.dataset.theme=d?'dark':'light';const m=document.querySelector('meta[name=theme-color]');if(m)m.content=d?'#080f1a':'#f3f5f9';const b=$('#themeToggle');if(b){b.innerHTML=ic(d?'sun':'moon');b.setAttribute('aria-label',x('doneToggle'));}}
  function setTheme(v){theme=v;save('ts_theme',v);applyTheme();}
  if(mq){const h=()=>{if(theme==='auto')applyTheme();};mq.addEventListener?mq.addEventListener('change',h):mq.addListener&&mq.addListener(h);}

  /* helpers */
  function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function textDir(){document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';document.body.dir=lang==='fa'?'rtl':'ltr';}
  function title(s){return lang==='fa'?s.fa:s.en;}
  function valuePair(o){return o[lang]||o.en;}
  function button(label,action,cls='button',icon='',attrs=''){return `<button class="${cls}" data-action="${action}" ${attrs}>${icon?ic(icon):''}<span>${esc(label)}</span></button>`;}
  function note(kind,icon,html){return `<div class="note ${kind}">${ic(icon)}<div>${html}</div></div>`;}
  function backRow(extra=''){return `<div class="back-row"><button class="back-button" data-action="back" aria-label="${esc(t('back'))}">${ic('arrowL')}<span>${esc(t('back'))}</span></button>${extra}</div>`;}
  function sectionCard(sec){const tone=secTone[sec.id];return `<button class="section-card tone-${tone}" data-action="section" data-id="${sec.id}">${tile(secIcon[sec.id],tone)}<span class="num">${nf(sec.id)}</span><span class="card-body"><h3>${esc(title(sec))}</h3><p>${esc(lang==='fa'?sec.descFa:sec.descEn)}</p></span></button>`;}
  function listRow(icon,tone,heading,sub,action,extra=''){return `<button class="list-row" data-action="${action}" ${extra}>${tile(icon,tone)}<span class="list-copy"><strong>${esc(heading)}</strong><small>${esc(sub)}</small></span><span class="chev">${ic('chevR')}</span></button>`;}
  function steps(list,urgent=false,tone='blue'){return `<div class="action-list ${urgent?'is-urgent tone-'+tone:''}">${list.map((a,i)=>`<div class="action-item"><span class="action-number">${nf(i+1)}</span><div class="bubble"><p>${esc(a)}</p></div></div>`).join('')}</div>`;}
  function calcProgress(){const all=Object.entries(checklistDefs).flatMap(([group,g])=>g.items.map(i=>`${group}_${i[0]}`));const count=all.filter(key=>checked[key]).length;return {count,total:all.length,pct:all.length?Math.round(count/all.length*100):0};}
  const NUMS=[['115','ambulance'],['110','police'],['125','fire']];
  const callGrid=()=>`<div class="sos-grid">${NUMS.map(([n,k])=>`<a class="sos-btn" href="tel:${n}" aria-label="${esc(t(k))} ${n}"><b>${nf(n).replace(/٬/g,'')}</b><span>${esc(t(k))}</span></a>`).join('')}</div>`;

  /* screens */
  function renderHome(){
    const p=calcProgress();
    const topicIds=[2,3,4,5,6,7];
    main.innerHTML=`
      <section class="hero"><span class="eyebrow">${ic('sparkle')}${esc(t('based'))}</span><h1>${esc(t('heroTitle'))}</h1><p>${esc(t('heroText'))}</p><div class="hero-foot"><span class="pill">${ic('zap')}${esc(t('offline'))}</span><span class="pill">${ic('calendar')}${esc(t('updated'))}</span></div></section>
      <button class="search-entry" data-action="open-search">${ic('search')}<span>${esc(x('searchEntry'))}</span></button>
      <section class="sos"><div class="sos-head">${ic('phone')}${esc(x('emergencyLead'))}</div>${callGrid()}</section>
      <div class="section-head"><div><h2>${esc(t('urgentTitle'))}</h2><p>${esc(t('urgentSub'))}</p></div></div>
      <div class="quick-list">
        ${['explosion','smoke','leave'].map(id=>{const m=quickMeta[id];return `<button class="quick-card tone-${m.tone}" data-action="quick" data-id="${id}">${tile(m.icon,m.tone)}<span class="quick-copy"><strong>${esc(t(id))}</strong><small>${esc(t(id+'Sub'))}</small></span><span class="chev">${ic('chevR')}</span></button>`}).join('')}
      </div>
      <div class="section-head"><div><h2>${esc(t('progressTitle'))}</h2></div><button class="text-link" data-action="nav-checklists">${esc(t('progressAction'))}${ic('chevR')}</button></div>
      <button class="ready-card" data-action="nav-checklists"><span class="ring" style="--p:${p.pct}"><b>${nf(p.pct)}٪</b></span><span class="ready-copy"><strong>${nf(p.count)} / ${nf(p.total)} ${esc(t('done'))}</strong><span>${esc(t('progressSub'))}</span></span></button>
      <div class="section-head"><div><h2>${esc(t('topics'))}</h2><p>${esc(t('guideSub'))}</p></div><button class="text-link" data-action="nav-guide">${esc(t('allTopics'))}${ic('chevR')}</button></div>
      <div class="section-grid">${topicIds.map(id=>sectionCard(sections[id-1])).join('')}</div>
      <div class="section-head"><div><h2>${esc(t('moreTools'))}</h2></div></div>
      <div class="feature-row">
        <button class="feature-card tone-green" data-action="nav-checklists">${tile('home','green')}<strong>${esc(t('plan'))}</strong><p>${esc(t('planSub'))}</p></button>
        <button class="feature-card tone-blue" data-action="quick" data-id="verify">${tile('shieldCheck','blue')}<strong>${esc(t('verify'))}</strong><p>${esc(t('verifySub'))}</p></button>
      </div>
      <div class="spacer-12"></div>${note('blue','info',esc(t('sourceNotice')))}`;
    if(lang==='en')main.querySelectorAll('.ring b').forEach(b=>b.textContent=b.textContent.replace('٪','%'));
  }
  function renderGuide(){
    main.innerHTML=`<div class="page-heading"><h1>${esc(t('guideTitle'))}</h1><p>${esc(t('guideSub'))}</p></div><label class="searchbar">${ic('search')}<input id="guideSearch" type="search" placeholder="${esc(t('searchPlaceholder'))}" value="${esc(searchQuery)}" autocomplete="off" aria-label="${esc(t('searchPlaceholder'))}"></label><div class="source-count" id="searchCount"></div><div class="section-grid" id="guideGrid">${sections.map(sectionCard).join('')}</div>`;
    updateGuideFilter();
  }
  function updateGuideFilter(){const q=searchQuery.toLocaleLowerCase();let count=0;$('#guideGrid')?.querySelectorAll('[data-action="section"]').forEach(el=>{const sec=sections.find(x=>x.id===Number(el.dataset.id));const str=(sec.en+' '+sec.fa+' '+sec.descEn+' '+sec.descFa+' '+(sec['intro'+(lang==='fa'?'Fa':'En')])).toLocaleLowerCase();const ok=!q||str.includes(q);el.classList.toggle('hidden',!ok);if(ok)count++;});const countEl=$('#searchCount');if(countEl)countEl.textContent=q?`${nf(count)} ${count===1?t('result'):t('results')}`:'';$('#guideGrid .empty-filter')?.remove();if($('#guideGrid')&&count===0)$('#guideGrid').insertAdjacentHTML('beforeend',`<div class="empty-filter">${esc(t('noResults'))}</div>`);}
  function renderSection(id){
    const sec=sections.find(s=>s.id===Number(id))||sections[0];currentSection=sec.id;
    const acts=lang==='fa'?sec.actionsFa:sec.actionsEn;
    const intro=lang==='fa'?sec.introFa:sec.introEn;
    const nt=lang==='fa'?sec.noteFa:sec.noteEn;
    const tone=secTone[sec.id];
    const prev=sections.find(s=>s.id===sec.id-1),next=sections.find(s=>s.id===sec.id+1);
    const pg=(s,dir)=>s?`<button class="${dir}" data-action="section" data-id="${s.id}"><small>${dir==='prev'?ic('chevL'):''}${esc(x(dir))}${dir==='next'?ic('chevR'):''}</small><strong>${esc(title(s))}</strong></button>`:'';
    main.innerHTML=`${backRow(`<span class="step-count">${esc(t('detailsLabel'))} ${nf(sec.id)} ${esc(x('sectionOf'))} ${nf(12)}</span>`)}
      <header class="detail-head tone-${tone}">${tile(secIcon[sec.id],tone)}<div><h1>${esc(title(sec))}</h1><p>${esc(lang==='fa'?sec.descFa:sec.descEn)}</p></div></header>
      <p class="lede">${esc(intro)}</p>
      <div class="subheading">${esc(t('actions'))}</div>${steps(acts)}
      <div class="subheading">${esc(t('remember'))}</div>${note(sec.id===4||sec.id===5?'red':'blue',sec.id===4||sec.id===5?'alert':'info',esc(nt))}
      <div class="button-row">${button(t('readSource'),'source-part','button secondary','file')}</div>
      <div class="pager">${pg(prev,'prev')}${next?pg(next,'next'):''}</div>
      <div class="source-status">${esc(t('sourceDisputed'))}</div>`;
    const lastPrev=main.querySelector('.pager');if(lastPrev&&!prev&&next)lastPrev.firstElementChild.classList.add('only');
  }
  function renderQuick(id){
    if(id==='verify'){
      main.innerHTML=`${backRow()}<header class="detail-head tone-green">${tile('shieldCheck','green')}<div><h1>${esc(t('warningTitle'))}</h1><p>${esc(lang==='fa'?'پیش از اقدام یا بازنشر، هر مورد را بررسی کن.':'Check each item before acting or sharing.')}</p></div></header>${steps(t('warningQuestions'))}<div class="spacer-12"></div>${note('blue','info',esc(t('sourceNotice')))}`;return;
    }
    const data=quick[id]||quick.explosion;currentQuick=id;const m=quickMeta[id]||quickMeta.explosion;
    main.innerHTML=`${backRow()}<header class="detail-head urgent tone-${m.tone}">${tile(m.icon,m.tone)}<div><h1>${esc(data.title[lang])}</h1><p>${esc(data.lead[lang])}</p></div></header>
      ${note('red','alert',esc(t('emergencyCaution')))}
      <div class="subheading">${esc(t('actions'))}</div>${steps(data.steps[lang],true,m.tone)}
      <div class="subheading">${esc(t('remember'))}</div>${note('blue','info',esc(data.note[lang]))}
      <div class="subheading">${esc(x('emergencyLead'))}</div><section class="sos" style="margin:0">${callGrid()}</section>
      <div class="button-row">${button(t('startChecklist'),'nav-checklists','button secondary','check')}</div>`;
  }
  function checkSummaryHTML(count,total,active){
    const pct=total?Math.round(count/total*100):0;
    return `<span class="ring sm" id="ckRing" style="--p:${pct}"><b>${nf(pct)}${lang==='fa'?'٪':'%'}</b></span><div><strong>${esc(valuePair(active.title))}</strong><small id="ckCount">${count===total&&total?esc(x('allDone')):`${nf(count)} / ${nf(total)} ${esc(t('done'))} · ${esc(valuePair(active.desc))}`}</small></div>`;
  }
  function renderChecklist(){
    const groups=Object.entries(checklistDefs);const active=checklistDefs[checklistFilter]||checklistDefs.home;const items=active.items;
    const count=items.filter(it=>checked[`${checklistFilter}_${it[0]}`]).length;
    const tabKey={home:'tabHome',gobag:'tabGoBag',family:'tabFamily',monthly:'tabMonthly',after:'tabAfter'};
    main.innerHTML=`<div class="page-heading"><h1>${esc(t('checklistTitle'))}</h1><p>${esc(t('checklistSub'))}</p></div>
      <div class="chip-scroll" role="tablist">${groups.map(([key,g])=>`<button role="tab" aria-selected="${key===checklistFilter}" class="chip ${key===checklistFilter?'active':''}" data-action="checktab" data-id="${key}">${ic(tabIcon[key])}${esc(t(tabKey[key]))}</button>`).join('')}</div>
      <section class="check-summary" id="ckSummary">${checkSummaryHTML(count,items.length,active)}</section>
      <section class="checklist-group">${items.map(it=>{const key=`${checklistFilter}_${it[0]}`;return `<label class="check-item ${checked[key]?'done':''}"><input type="checkbox" data-action="check-item" data-id="${key}" ${checked[key]?'checked':''}><span class="box">${ic('tick')}</span><span class="txt">${esc(checklistItemText(it[0]))}</span></label>`}).join('')}</section>
      <div class="button-row"><button class="button ghost full" data-action="reset-list">${ic('reset')}<span>${esc(t('clearProgress'))}</span></button></div>
      <div class="spacer-12"></div>${note('blue','info',esc(t('saveNote')))}`;
    const act=main.querySelector('.chip.active');if(act&&act.scrollIntoView)act.scrollIntoView({inline:'center',block:'nearest'});
  }
  function updateCheckInPlace(el){
    el.closest('.check-item').classList.toggle('done',el.checked);
    const active=checklistDefs[checklistFilter];const items=active.items;
    const count=items.filter(it=>checked[`${checklistFilter}_${it[0]}`]).length;
    $('#ckSummary').innerHTML=checkSummaryHTML(count,items.length,active);
    if('vibrate' in navigator&&el.checked){try{navigator.vibrate(8)}catch(_){}}
  }
  function renderMore(){
    const segTheme=[['auto','themeAuto','auto'],['light','themeLight','sun'],['dark','themeDark','moon']];
    main.innerHTML=`<div class="page-heading"><h1>${esc(t('moreTitle'))}</h1><p>${esc(t('appNote'))}</p></div>
      <div class="section-head" style="margin-top:8px"><div><h2>${esc(t('emergency'))}</h2></div></div>
      <div class="group">${NUMS.map(([n,k])=>`<a class="num-card" href="tel:${n}"><b>${nf(n).replace(/٬/g,'')}</b><span class="list-copy"><strong>${esc(t(k))}</strong></span><span class="call-btn" aria-label="${esc(x('callNow'))}">${ic('phone')}</span></a>`).join('')}</div>
      <div class="spacer-12"></div>${note('','info',esc(t('verifyNumbers')))}
      <div class="section-head"><div><h2>${esc(t('source'))}</h2></div></div>
      <div class="group">${listRow('file','blue',t('original'),t('originalSub'),'source-all')}${listRow('download','green',t('openPdf'),t('pdfDisclaimer'),'open-pdf')}${listRow('info','violet',t('about'),t('noAccounts'),'about')}</div>
      <div class="section-head"><div><h2>${esc(t('appearance'))}</h2></div></div>
      <div class="group">
        <div class="setting-row">${tile('globe','blue')}<div class="list-copy"><strong>${esc(t('language'))}</strong></div><div class="segmented" role="group"><button class="${lang==='fa'?'active':''}" data-action="set-lang" data-id="fa">فارسی</button><button class="${lang==='en'?'active':''}" data-action="set-lang" data-id="en">English</button></div></div>
        <div class="setting-row">${tile('moon','violet')}<div class="list-copy"><strong>${esc(x('theme'))}</strong></div><div class="segmented" role="group">${segTheme.map(([v,k,i])=>`<button class="${theme===v?'active':''}" data-action="set-theme" data-id="${v}" aria-label="${esc(x(k))}">${ic(i)}</button>`).join('')}</div></div>
        <div class="setting-row">${tile('layers','orange')}<div class="list-copy"><strong>${esc(t('compact'))}</strong></div><button class="switch ${appSettings.compact?'on':''}" data-action="toggle-compact" role="switch" aria-checked="${!!appSettings.compact}" aria-label="${esc(t('compact'))}"></button></div>
        <div class="setting-row">${tile('bell','amber')}<div class="list-copy"><strong>${esc(t('notifications'))}</strong><small>${esc(t('notificationsSub'))}</small></div></div>
      </div>
      <div class="spacer-12"></div><button class="button full" data-action="install-help">${ic('download')}<span>${esc(t('install'))}</span></button>`;
  }
  function renderSource(partId=0){
    sourcePart=Number(partId)||0;const source=window.HANDBOOK_SOURCE;const part=sourcePart?source.parts.find(p=>p.id===sourcePart):null;
    const text=part?part.title+'\n\n'+part.text:source.fullText;const current=sourceQuery.toLocaleLowerCase();let display=text;
    if(current){const idx=display.toLocaleLowerCase().indexOf(current);if(idx>=0){display='… '+display.slice(Math.max(0,idx-500),Math.min(display.length,idx+1800))+' …';}else display=lang==='fa'?'عبارت در این بخش از متن پیدا نشد.':'No match was found in this source section.';}
    const chips=[[0,x('allParts')],...source.parts.map(p=>[p.id,`${x('partLabel')} ${nf(p.id)}`])];
    main.innerHTML=`${backRow()}<div class="page-heading"><h1>${esc(t('sourceTitle'))}</h1><p>${esc(t('sourceSub'))}</p></div>
      <div class="chip-scroll">${chips.map(([id,l])=>`<button class="chip ${id===sourcePart?'active':''}" data-action="source-sel" data-id="${id}">${esc(l)}</button>`).join('')}</div>
      <div class="source-tools"><label class="searchbar">${ic('search')}<input id="sourceSearch" type="search" placeholder="${esc(t('searchSource'))}" value="${esc(sourceQuery)}" dir="ltr"></label>${sourceQuery?`<button class="button secondary" data-action="clear-source">${esc(t('clearSearch'))}</button>`:''}</div>
      <div class="source-count">${part?esc(part.title):esc(t('sourcePartAll'))}</div>
      <div class="source-body"><pre>${esc(display)}</pre></div>
      <div class="button-row">${button(t('openPdf'),'open-pdf','button secondary','download')}</div>
      <div class="source-status">${esc(t('appNote'))}</div>`;
    const act=main.querySelector('.chip.active');if(act&&act.scrollIntoView)act.scrollIntoView({inline:'center',block:'nearest'});
  }
  function renderAbout(){
    main.innerHTML=`${backRow()}<div class="page-heading"><h1>${esc(t('about'))}</h1><p>${esc(t('noAccounts'))}</p></div>${note('blue','info',esc(t('sourceNotice')))}
      <div class="subheading">${esc(lang==='fa'?'محتوای برنامه':'App content')}</div><p class="lede">${esc(lang==='fa'?'این برنامه از دفترچهٔ ایمنی غیرنظامیان تهران که در گفت‌وگو ارائه شده بود ساخته شده است. متن کامل انگلیسی، خلاصه‌های کاربردی فارسی و انگلیسی، چک‌لیست‌ها و راهنمای آفلاین در دسترس‌اند.':'This app is based on the Tehran Civilian Safety Handbook supplied in this conversation. It includes the full English source text, concise Persian/English guidance, saved checklists and offline access.')}</p>
      <div class="subheading">${esc(lang==='fa'?'محدودیت‌ها':'Limitations')}</div>${note('red','alert',esc(t('appNote')))}
      <div class="button-row">${button(t('openPdf'),'open-pdf','button secondary','download')}</div>`;
  }
  function renderSearch(){
    const q=searchQuery.toLocaleLowerCase();const found=sections.filter(sec=>(sec.en+' '+sec.fa+' '+sec.descEn+' '+sec.descFa+' '+sec.introEn+' '+sec.introFa).toLocaleLowerCase().includes(q));
    main.innerHTML=`${backRow()}<div class="page-heading"><h1>${esc(lang==='fa'?'جست‌وجوی راهنما':'Search the handbook')}</h1></div><label class="searchbar">${ic('search')}<input id="mainSearch" type="search" placeholder="${esc(t('searchPlaceholder'))}" value="${esc(searchQuery)}" autocomplete="off"></label><div class="source-count">${q?`${nf(found.length)} ${found.length===1?t('result'):t('results')}`:''}</div><div class="section-grid">${found.map(sectionCard).join('')}${found.length?'':`<div class="empty-state">${esc(t('noResults'))}</div>`}</div>`;
  }

  /* chrome, routing */
  function hydrateIcons(){document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=ic(el.dataset.icon);});}
  function updateChrome(){
    textDir();$('#brandTitle').textContent=t('brand');$('#brandSubtitle').textContent=t('subtitle');
    $('#langToggle').textContent=lang==='fa'?'EN':'فا';$('#langToggle').setAttribute('aria-label',lang==='fa'?'Switch to English':'تغییر زبان به فارسی');
    $('#searchOpen').innerHTML=ic('search');$('#searchOpen').setAttribute('aria-label',t('searchPlaceholder'));
    $('#bottomNav').querySelectorAll('[data-tab]').forEach(el=>{const tab=el.dataset.tab;el.classList.toggle('active',tab===activeTab);el.setAttribute('aria-current',tab===activeTab?'page':'false');const label=el.querySelector('[data-i18n]');if(label)label.textContent=t(tab);});
    applyTheme();
  }
  function render(animate=false){
    updateChrome();
    switch(currentScreen){case'home':activeTab='home';renderHome();break;case'guide':activeTab='guide';renderGuide();break;case'checklists':activeTab='checklists';renderChecklist();break;case'more':activeTab='more';renderMore();break;case'section':activeTab='guide';renderSection(currentSection);break;case'quick':renderQuick(currentQuick);break;case'source':renderSource(sourcePart);break;case'about':activeTab='more';renderAbout();break;case'search':activeTab='guide';renderSearch();break;default:renderHome();}
    updateChrome();
    if(animate){main.classList.remove('enter');void main.offsetWidth;main.classList.add('enter');clearTimeout(render.t);render.t=setTimeout(()=>main.classList.remove('enter'),800);}
  }
  function goto(screen,opts={}){previousScreen=currentScreen;if(screen!==currentScreen||screen==='section')screenStack.push({screen:currentScreen,tab:activeTab,id:currentSection});if(screen==='section'&&opts.id)currentSection=Number(opts.id);if(screen==='quick'&&opts.id)currentQuick=opts.id;if(screen==='source'){sourcePart=opts.partId||0;sourceQuery='';}if(screen==='checklists'&&opts.filter)checklistFilter=opts.filter;currentScreen=screen;render(true);window.scrollTo(0,0);}
  function nav(tab){screenStack=[];activeTab=tab;currentScreen=tab;searchQuery='';render(true);window.scrollTo(0,0);}
  function back(){if(screenStack.length){const prior=screenStack.pop();currentScreen=prior.screen;activeTab=prior.tab;if(prior.screen==='section'&&prior.id)currentSection=prior.id;render(true);window.scrollTo(0,0);return true;}if(currentScreen!=='home'){nav('home');return true;}return false;}
  function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),2300);}
  function setLanguage(l){if(l===lang)return;lang=l;save('ts_lang',lang);render();}
  function toggleLanguage(){setLanguage(lang==='fa'?'en':'fa');}
  function openOriginalPdf(){if(window.AndroidApp&&typeof window.AndroidApp.openOriginalPdf==='function'){window.AndroidApp.openOriginalPdf();return;}const a=document.createElement('a');a.href='assets/handbook.pdf';a.target='_blank';a.rel='noopener';a.download='Tehran-Civilian-Safety-Handbook.pdf';document.body.appendChild(a);a.click();a.remove();}

  /* confirm sheet */
  const scrim=$('#scrim'),sheet=$('#sheet');
  function confirmSheet(heading,body,okLabel){
    return new Promise(res=>{
      sheet.innerHTML=`<h3>${esc(heading)}</h3><p>${esc(body)}</p><div class="button-row"><button class="button ghost" data-s="0">${esc(x('cancel'))}</button><button class="button danger" data-s="1">${esc(okLabel)}</button></div>`;
      const close=v=>{scrim.classList.remove('show');sheet.classList.remove('show');sheet.setAttribute('aria-hidden','true');scrim.onclick=null;sheet.onclick=null;document.removeEventListener('keydown',esc_);res(v);};
      const esc_=e=>{if(e.key==='Escape'){e.stopPropagation();close(false);}};
      document.addEventListener('keydown',esc_);
      sheet.onclick=e=>{const b=e.target.closest('[data-s]');if(b)close(b.dataset.s==='1');};scrim.onclick=()=>close(false);
      sheet.setAttribute('aria-hidden','false');scrim.classList.add('show');sheet.classList.add('show');sheet.querySelector('[data-s="0"]').focus();
    });
  }

  /* events */
  main.addEventListener('input',e=>{
    const keep=(sel,fn)=>{const cur=e.target.selectionStart;fn();const input=$(sel);if(input){input.focus();try{input.setSelectionRange(cur,cur)}catch(_){}}};
    if(e.target.id==='guideSearch'){searchQuery=e.target.value;updateGuideFilter();}
    else if(e.target.id==='sourceSearch'){sourceQuery=e.target.value;keep('#sourceSearch',()=>renderSource(sourcePart));}
    else if(e.target.id==='mainSearch'){searchQuery=e.target.value;keep('#mainSearch',renderSearch);}
  });
  main.addEventListener('change',e=>{
    if(e.target.matches('input[data-action="check-item"]')){checked[e.target.dataset.id]=e.target.checked;save('ts_checked',checked);updateCheckInPlace(e.target);}
  });
  main.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;const id=el.dataset.id;
    switch(a){
      case'section':{if(currentScreen==='section'){currentSection=Number(id);render(true);window.scrollTo(0,0);}else goto('section',{id});break;}
      case'quick':goto('quick',{id});break;
      case'open-search':searchQuery='';goto('search');setTimeout(()=>$('#mainSearch')?.focus(),60);break;
      case'nav-home':nav('home');break;case'nav-guide':nav('guide');break;case'nav-checklists':nav('checklists');break;case'nav-more':nav('more');break;
      case'back':back();break;
      case'checktab':checklistFilter=id;renderChecklist();break;
      case'reset-list':confirmSheet(x('reset'),x('resetBody'),x('confirmReset')).then(ok=>{if(!ok)return;checklistDefs[checklistFilter].items.forEach(it=>delete checked[`${checklistFilter}_${it[0]}`]);save('ts_checked',checked);renderChecklist();toast(lang==='fa'?'فهرست بازنشانی شد':'List reset');});break;
      case'source-part':goto('source',{partId:currentSection});break;
      case'source-all':goto('source',{partId:0});break;
      case'source-sel':sourceQuery='';renderSource(Number(id));break;
      case'open-pdf':openOriginalPdf();break;
      case'set-lang':setLanguage(id);break;
      case'set-theme':setTheme(id);renderMore();break;
      case'toggle-compact':appSettings.compact=!appSettings.compact;save('ts_settings',appSettings);document.body.classList.toggle('compact-mode',appSettings.compact);renderMore();break;
      case'about':goto('about');break;
      case'clear-source':sourceQuery='';renderSource(sourcePart);break;
      case'install-help':if(installPrompt){const promptEvent=installPrompt;installPrompt=null;promptEvent.prompt();promptEvent.userChoice.catch(()=>{});}else{toast(t('installTip'));}break;
    }
  });
  $('#bottomNav').addEventListener('click',e=>{const el=e.target.closest('[data-tab]');if(el)nav(el.dataset.tab);});
  $('#brandHome').addEventListener('click',()=>nav('home'));
  $('#langToggle').addEventListener('click',toggleLanguage);
  $('#themeToggle').addEventListener('click',()=>{setTheme(isDark()?'light':'dark');if(currentScreen==='more')renderMore();});
  $('#searchOpen').addEventListener('click',()=>{searchQuery='';goto('search');setTimeout(()=>$('#mainSearch')?.focus(),60)});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&currentScreen!=='home')back();});
  if(appSettings.compact)document.body.classList.add('compact-mode');
  window.TehranSafetyBack = back;
  hydrateIcons();
  render(true);
})();
