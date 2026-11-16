/* Karvan · choix de la langue. Le français est la langue du code ; les textes sont remplacés à la volée.
   Ordre des traductions : en, ar, tr, fa, zh, hi, it. La demande envoyée à Jalal reste en français. */
(function(){
const L=[
 {c:'fr',n:'Français',f:'fr'},
 {c:'en',n:'English',f:'gb'},
 {c:'ar',n:'العربية',f:'ae',rtl:1},
 {c:'tr',n:'Türkçe',f:'tr'},
 {c:'fa',n:'فارسی',f:'ir',rtl:1},
 {c:'zh',n:'中文',f:'cn'},
 {c:'hi',n:'हिन्दी',f:'in'},
 {c:'it',n:'Italiano',f:'it'}];
const IX={en:0,ar:1,tr:2,fa:3,zh:4,hi:5,it:6};
const D={
"Karvan · Emballages pour les pros de l'alimentation":["Karvan · Packaging for food professionals","Karvan · تغليف لمحترفي الأغذية","Karvan · Gıda profesyonelleri için ambalaj","Karvan · بسته‌بندی برای حرفه‌ای‌های غذا","Karvan · 餐饮专业包装","Karvan · खाद्य व्यवसायों के लिए पैकेजिंग","Karvan · Imballaggi per i professionisti del cibo"],
"Karvan 01 · Emballages pour la restauration et les commerces":["Karvan 01 · Packaging for restaurants and shops","Karvan 01 · تغليف للمطاعم والمحلات","Karvan 01 · Restoran ve dükkânlar için ambalaj","Karvan 01 · بسته‌بندی برای رستوران‌ها و فروشگاه‌ها","Karvan 01 · 餐厅与商店包装","Karvan 01 · रेस्तराँ और दुकानों के लिए पैकेजिंग","Karvan 01 · Imballaggi per ristoranti e negozi"],
"· Suisse romande":["· French-speaking Switzerland","· سويسرا الناطقة بالفرنسية","· Fransızca konuşulan İsviçre","· سوئیس فرانسوی‌زبان","· 瑞士法语区","· फ़्रेंच-भाषी स्विट्ज़रलैंड","· Svizzera romanda"],
"Produits":["Products","المنتجات","Ürünler","محصولات","产品","उत्पाद","Prodotti"],
"Personnalisation":["Custom branding","الطباعة بعلامتك","Kişiselleştirme","شخصی‌سازی","定制印刷","कस्टम ब्रांडिंग","Personalizzazione"],
"Notre histoire":["Our story","قصتنا","Hikâyemiz","داستان ما","我们的故事","हमारी कहानी","La nostra storia"],
"Contact":["Contact","اتصل بنا","İletişim","تماس","联系","संपर्क","Contatti"],
"Demander une offre":["Request a quote","اطلب عرض سعر","Teklif isteyin","درخواست قیمت","索取报价","कोटेशन माँगें","Richiedi un'offerta"],
"Import · Export depuis 25 ans":["Import · Export for 25 years","استيراد · تصدير منذ 25 عامًا","25 yıldır ithalat · ihracat","واردات · صادرات از ۲۵ سال پیش","25 年进出口经验","25 वर्षों से आयात · निर्यात","Import · Export da 25 anni"],
"Des emballages choisis par quelqu'un qui connaît la route.":["Packaging chosen by someone who knows the road.","تغليف يختاره من يعرف الطريق.","Yolu bilen birinin seçtiği ambalajlar.","بسته‌بندی‌هایی که کسی انتخاب کرده که راه را می‌شناسد.","由识途之人精选的包装。","ऐसी पैकेजिंग, जिसे रास्ता जानने वाले ने चुना है।","Imballaggi scelti da chi conosce la strada."],
"25 ans d'import-export au service des restaurants, snacks, boulangeries, traiteurs et commerces suisses. Des produits en stock, un seul interlocuteur, et votre marque imprimée si vous le voulez.":["25 years of import-export serving Swiss restaurants, snack bars, bakeries, caterers and shops. Products in stock, one single contact, and your brand printed if you wish.","25 عامًا من الاستيراد والتصدير في خدمة المطاعم ومحلات الوجبات السريعة والمخابز ومتعهدي الطعام والمحلات في سويسرا. منتجات متوفرة، ومحاور واحد، وعلامتك مطبوعة إن أردت.","İsviçre'deki restoranlara, büfelere, fırınlara, catering firmalarına ve dükkânlara 25 yıllık ithalat-ihracat deneyimi. Stokta ürünler, tek bir muhatap ve dilerseniz markanızın baskısı.","۲۵ سال واردات و صادرات در خدمت رستوران‌ها، اسنک‌بارها، نانوایی‌ها، کترینگ‌ها و فروشگاه‌های سوئیس. محصولات موجود در انبار، یک طرف حساب، و در صورت تمایل چاپ برند شما.","25 年进出口经验，服务瑞士的餐厅、小吃店、面包店、餐饮外烩与商店。现货供应，一位专属联系人，还可印上您的品牌。","स्विट्ज़रलैंड के रेस्तराँ, स्नैक बार, बेकरी, कैटरर और दुकानों की सेवा में 25 वर्षों का आयात-निर्यात अनुभव। स्टॉक में उत्पाद, एक ही संपर्क व्यक्ति, और चाहें तो आपके ब्रांड की छपाई।","25 anni di import-export al servizio di ristoranti, snack bar, panetterie, catering e negozi svizzeri. Prodotti in magazzino, un solo interlocutore e il vostro marchio stampato, se lo desiderate."],
"Voir les produits":["See the products","عرض المنتجات","Ürünleri görün","دیدن محصولات","查看产品","उत्पाद देखें","Vedi i prodotti"],
"25 ans d'import-export":["25 years of import-export","25 عامًا من الاستيراد والتصدير","25 yıllık ithalat-ihracat","۲۵ سال واردات و صادرات","25 年进出口","25 वर्षों का आयात-निर्यात","25 anni di import-export"],
"Produits en stock":["Products in stock","منتجات متوفرة","Stokta ürünler","محصولات موجود","现货供应","स्टॉक में उत्पाद","Prodotti in magazzino"],
"Un seul interlocuteur":["One single contact","محاور واحد","Tek muhatap","یک طرف حساب","一位专属联系人","एक ही संपर्क व्यक्ति","Un solo interlocutore"],
"Livraison en Suisse":["Delivery in Switzerland","التوصيل داخل سويسرا","İsviçre'ye teslimat","تحویل در سوئیس","瑞士境内配送","स्विट्ज़रलैंड में डिलीवरी","Consegna in Svizzera"],
"Disponible maintenant ·":["Available now ·","متوفر الآن ·","Şimdi mevcut ·","موجود همین حالا ·","现货 ·","अभी उपलब्ध ·","Disponibile ora ·"],
"références":["items","صنفًا","ürün","قلم","款","उत्पाद","articoli"],
"Ce qu'on livre cette semaine.":["What we deliver this week.","ما نوصله هذا الأسبوع.","Bu hafta teslim ettiklerimiz.","آنچه این هفته تحویل می‌دهیم.","本周可配送。","इस हफ़्ते हम यह पहुँचाते हैं।","Cosa consegniamo questa settimana."],
"Ajoutez les produits et le nombre de cartons : votre demande part directement chez Jalal.":["Add the products and the number of cartons: your request goes straight to Jalal.","أضف المنتجات وعدد الكراتين: يصل طلبك مباشرة إلى جلال.","Ürünleri ve koli sayısını ekleyin: talebiniz doğrudan Jalal'e gider.","محصولات و تعداد کارتن‌ها را اضافه کنید: درخواست شما مستقیم به دست جلال می‌رسد.","添加产品和箱数：您的询价会直接发给 Jalal。","उत्पाद और कार्टन की संख्या जोड़ें: आपका अनुरोध सीधे जलाल तक पहुँचता है।","Aggiungete i prodotti e il numero di cartoni: la richiesta arriva direttamente a Jalal."],
"Voir les":["See all","عرض كل","Tüm","دیدن همه","查看全部","सभी","Vedi tutti gli"],
"Visuels d'illustration · photos des produits à venir":["Illustrative images · product photos coming soon","صور توضيحية · صور المنتجات قريبًا","Temsili görseller · ürün fotoğrafları yakında","تصاویر نمایشی · عکس محصولات به‌زودی","示意图 · 产品实拍即将上线","चित्र केवल उदाहरण हैं · उत्पादों की तस्वीरें जल्द","Immagini illustrative · foto dei prodotti in arrivo"],
"Personnalisation · la différence Karvan":["Custom branding · the Karvan difference","الطباعة بعلامتك · ما يميّز كارفان","Kişiselleştirme · Karvan farkı","شخصی‌سازی · تفاوت کاروان","定制印刷 · Karvan 的不同之处","कस्टम ब्रांडिंग · Karvan की ख़ासियत","Personalizzazione · la differenza Karvan"],
"Votre enseigne, jusque dans le sac.":["Your brand, right down to the bag.","علامتك التجارية، حتى على الكيس.","Markanız, poşetin üzerine kadar.","برند شما، تا روی کیسه.","您的品牌，连袋子上都有。","आपका ब्रांड, थैले तक।","La vostra insegna, fin dentro il sacchetto."],
"Tampon, impression 1 ou 2 couleurs, ou univers complet : vos emballages à votre marque, maquette 3D avant toute commande.":["Stamp, 1 or 2-colour print, or a complete brand look: packaging in your colours, with a 3D mock-up before any order.","ختم، أو طباعة بلون أو لونين، أو هوية كاملة: تغليف بعلامتك، مع نموذج ثلاثي الأبعاد قبل أي طلب.","Kaşe, 1 veya 2 renk baskı ya da komple kimlik: markanıza özel ambalaj, her siparişten önce 3D maket.","مهر، چاپ یک یا دو رنگ، یا هویت کامل: بسته‌بندی با برند شما، با ماکت سه‌بعدی پیش از هر سفارش.","印章、单色或双色印刷，或整套视觉：包装印上您的品牌，下单前先看 3D 效果图。","स्टैम्प, 1 या 2 रंगों की छपाई, या पूरी ब्रांड पहचान: आपके ब्रांड वाली पैकेजिंग, हर ऑर्डर से पहले 3D मॉक-अप।","Timbro, stampa a 1 o 2 colori o immagine completa: imballaggi con il vostro marchio, con modello 3D prima di ogni ordine."],
"Avant · neutre":["Before · plain","قبل · سادة","Önce · sade","قبل · ساده","之前 · 素色","पहले · सादा","Prima · neutro"],
"Après · votre marque":["After · your brand","بعد · علامتك","Sonra · markanız","بعد · برند شما","之后 · 您的品牌","बाद में · आपका ब्रांड","Dopo · il vostro marchio"],
"Voir la personnalisation":["See custom branding","اكتشف الطباعة بعلامتك","Kişiselleştirmeyi görün","دیدن شخصی‌سازی","查看定制印刷","कस्टम ब्रांडिंग देखें","Scopri la personalizzazione"],
"Demander ma maquette":["Request my mock-up","اطلب نموذجي","Maketimi isteyin","درخواست ماکت من","索取我的效果图","मेरा मॉक-अप माँगें","Richiedi il mio modello"],
"Notre histoire ·":["Our story ·","قصتنا ·","Hikâyemiz ·","داستان ما ·","我们的故事 ·","हमारी कहानी ·","La nostra storia ·"],
"veut dire caravane":["means caravan","تعني القافلة","kervan demektir","یعنی قافله","意为驼队商旅","का अर्थ है कारवाँ","significa carovana"],
"Une maison de négoce, une parole tenue.":["A trading house that keeps its word.","بيت تجارة يفي بكلمته.","Sözünü tutan bir ticaret evi.","یک تجارتخانه، یک قول که پایش می‌ایستد.","一家言出必行的贸易商行。","एक व्यापारिक घराना, जो अपनी बात निभाता है।","Una casa commerciale che mantiene la parola."],
"Le caravansérail était l'étape des marchands sur les routes du commerce. Karvan relie ceux qui fabriquent et ceux qui servent.":["The caravanserai was where merchants stopped along the trade routes. Karvan connects those who make with those who serve.","كان الخان محطة التجار على طرق التجارة. كارفان يصل بين من يصنعون ومن يقدّمون.","Kervansaray, ticaret yollarında tüccarların konakladığı yerdi. Karvan, üretenlerle hizmet verenleri buluşturur.","کاروانسرا منزلگاه بازرگانان در راه‌های تجارت بود. کاروان سازندگان را به کسانی که پذیرایی می‌کنند پیوند می‌دهد.","商队驿站曾是商人在贸易之路上的歇脚处。Karvan 连接生产者与服务者。","कारवाँ सराय व्यापार मार्गों पर व्यापारियों का पड़ाव होती थी। Karvan बनाने वालों को परोसने वालों से जोड़ता है।","Il caravanserraglio era la sosta dei mercanti sulle vie del commercio. Karvan unisce chi produce e chi serve."],
"Le départ":["The start","البداية","Başlangıç","آغاز","起点","शुरुआत","La partenza"],
"Jalal grandit en Iran, sur une terre de marchands où une parole donnée vaut un contrat.":["Jalal grew up in Iran, in a land of merchants where your word is as good as a contract.","نشأ جلال في إيران، في أرض التجار حيث الكلمة تساوي عقدًا.","Jalal, verilen sözün bir sözleşme değerinde olduğu tüccarlar diyarı İran'da büyüdü.","جلال در ایران بزرگ شد، در سرزمین بازرگانان، جایی که قول، حکم قرارداد را دارد.","Jalal 在伊朗长大，那是一片商人之地，一句承诺就是一份契约。","जलाल ईरान में पले-बढ़े, व्यापारियों की उस धरती पर जहाँ ज़ुबान ही अनुबंध होती है।","Jalal è cresciuto in Iran, terra di mercanti dove la parola data vale un contratto."],
"La route":["The road","الطريق","Yol","راه","旅途","सफ़र","La strada"],
"Pendant 25 ans, il importe et exporte. Il apprend à choisir les bons fabricants, à négocier et à livrer à l'heure.":["For 25 years he imports and exports. He learns to choose the right manufacturers, to negotiate and to deliver on time.","طوال 25 عامًا، يستورد ويصدّر. يتعلم اختيار المصنّعين المناسبين، والتفاوض، والتسليم في الموعد.","25 yıl boyunca ithalat ve ihracat yapar. Doğru üreticileri seçmeyi, pazarlık etmeyi ve zamanında teslim etmeyi öğrenir.","۲۵ سال واردات و صادرات می‌کند. یاد می‌گیرد تولیدکننده‌های درست را انتخاب کند، چانه بزند و به‌موقع تحویل دهد.","25 年来他从事进出口，学会挑选可靠的工厂、谈判，并准时交货。","25 वर्षों तक वे आयात-निर्यात करते हैं। सही निर्माताओं को चुनना, मोलभाव करना और समय पर पहुँचाना सीखते हैं।","Per 25 anni importa ed esporta. Impara a scegliere i produttori giusti, a negoziare e a consegnare puntuale."],
"La confiance":["Trust","الثقة","Güven","اعتماد","信任","भरोसा","La fiducia"],
"Ses clients le rappellent parce qu'il tient ses promesses.":["His customers come back because he keeps his promises.","يعود إليه زبائنه لأنه يفي بوعوده.","Müşterileri onu tekrar arar, çünkü sözünü tutar.","مشتری‌هایش دوباره سراغش می‌آیند، چون به قولش عمل می‌کند.","客户一再找他，因为他说到做到。","ग्राहक उन्हें दोबारा बुलाते हैं, क्योंकि वे अपने वादे निभाते हैं।","I suoi clienti lo richiamano perché mantiene le promesse."],
"Aujourd'hui, il met ce savoir-faire au service des pros de l'alimentation : restaurants, snacks, boulangeries, traiteurs. Des emballages de qualité, au juste prix, avec un interlocuteur qui répond.":["Today he puts this know-how at the service of food professionals: restaurants, snack bars, bakeries, caterers. Quality packaging at a fair price, with a contact who answers.","اليوم يضع هذه الخبرة في خدمة محترفي الأغذية: مطاعم، ومحلات وجبات سريعة، ومخابز، ومتعهدو طعام. تغليف عالي الجودة بسعر عادل، مع محاور يرد عليك.","Bugün bu birikimi gıda profesyonellerinin hizmetine sunuyor: restoranlar, büfeler, fırınlar, catering firmaları. Doğru fiyata kaliteli ambalaj ve cevap veren bir muhatap.","امروز این تجربه را در خدمت حرفه‌ای‌های غذا گذاشته است: رستوران‌ها، اسنک‌بارها، نانوایی‌ها، کترینگ‌ها. بسته‌بندی باکیفیت با قیمت منصفانه، و طرف حسابی که جواب می‌دهد.","如今，他把这份经验带给餐饮从业者：餐厅、小吃店、面包店、餐饮外烩。优质包装，价格公道，联系人有问必答。","आज वे यह अनुभव खाद्य व्यवसायों की सेवा में लगाते हैं: रेस्तराँ, स्नैक बार, बेकरी, कैटरर। सही दाम पर अच्छी पैकेजिंग, और जवाब देने वाला संपर्क व्यक्ति।","Oggi mette questa esperienza al servizio dei professionisti del cibo: ristoranti, snack bar, panetterie, catering. Imballaggi di qualità al giusto prezzo, con un interlocutore che risponde."],
"Karvan 01 · Emballages":["Karvan 01 · Packaging","Karvan 01 · تغليف","Karvan 01 · Ambalaj","Karvan 01 · بسته‌بندی","Karvan 01 · 包装","Karvan 01 · पैकेजिंग","Karvan 01 · Imballaggi"],
"D'autres routes arrivent.":["More roads are coming.","طرق أخرى قادمة.","Başka yollar da geliyor.","راه‌های دیگری در پیش است.","更多路线即将开启。","और भी रास्ते आने वाले हैं।","Altre strade sono in arrivo."],
"Travailler avec Karvan.":["Working with Karvan.","العمل مع كارفان.","Karvan ile çalışmak.","کار با کاروان.","与 Karvan 合作。","Karvan के साथ काम।","Lavorare con Karvan."],
"Vous choisissez":["You choose","أنت تختار","Siz seçersiniz","شما انتخاب می‌کنید","您来挑选","आप चुनते हैं","Voi scegliete"],
"Les produits et le nombre de cartons, dans la liste ci-dessus.":["The products and the number of cartons, from the list above.","المنتجات وعدد الكراتين، من القائمة أعلاه.","Yukarıdaki listeden ürünler ve koli sayısı.","محصولات و تعداد کارتن‌ها، از فهرست بالا.","在上方列表中选择产品和箱数。","ऊपर की सूची से उत्पाद और कार्टन की संख्या।","I prodotti e il numero di cartoni, dalla lista qui sopra."],
"Jalal vous fait une offre":["Jalal sends you a quote","جلال يرسل لك عرضًا","Jalal size teklif verir","جلال به شما قیمت می‌دهد","Jalal 为您报价","जलाल आपको कोटेशन देते हैं","Jalal vi fa un'offerta"],
"Par e-mail ou WhatsApp. Une seule personne, une réponse claire.":["By email or WhatsApp. One person, a clear answer.","عبر البريد الإلكتروني أو واتساب. شخص واحد، وجواب واضح.","E-posta ya da WhatsApp ile. Tek kişi, net bir cevap.","با ایمیل یا واتس‌اپ. یک نفر، یک جواب روشن.","通过电子邮件或 WhatsApp。一个人对接，答复清楚。","ईमेल या WhatsApp पर। एक ही व्यक्ति, साफ़ जवाब।","Per e-mail o WhatsApp. Una sola persona, una risposta chiara."],
"Livraison":["Delivery","التوصيل","Teslimat","تحویل","配送","डिलीवरी","Consegna"],
"Chez vous, en Suisse romande.":["To your door, in French-speaking Switzerland.","إلى بابك، في سويسرا الناطقة بالفرنسية.","Kapınıza, Fransızca konuşulan İsviçre'de.","درِ محل شما، در سوئیس فرانسوی‌زبان.","送货上门，覆盖瑞士法语区。","आपके दरवाज़े तक, फ़्रेंच-भाषी स्विट्ज़रलैंड में।","Da voi, in Svizzera romanda."],
"Parlez à Jalal.":["Talk to Jalal.","تحدّث مع جلال.","Jalal ile konuşun.","با جلال صحبت کنید.","联系 Jalal。","जलाल से बात करें।","Parlate con Jalal."],
"Votre demande arrive chez Jalal par e-mail et sur WhatsApp. Il vous répond avec une offre.":["Your request reaches Jalal by email and on WhatsApp. He replies with a quote.","يصل طلبك إلى جلال عبر البريد الإلكتروني وواتساب، فيرد عليك بعرض سعر.","Talebiniz Jalal'e e-posta ve WhatsApp ile ulaşır. Size bir teklifle döner.","درخواست شما با ایمیل و واتس‌اپ به جلال می‌رسد. او با یک پیشنهاد قیمت جواب می‌دهد.","您的询价会通过电子邮件和 WhatsApp 送达 Jalal，他会给您报价。","आपका अनुरोध ईमेल और WhatsApp पर जलाल तक पहुँचता है। वे कोटेशन के साथ जवाब देते हैं।","La vostra richiesta arriva a Jalal per e-mail e su WhatsApp. Vi risponde con un'offerta."],
"Nom":["Name","الاسم","Ad Soyad","نام","姓名","नाम","Nome"],
"Établissement":["Business name","اسم المحل","İşletme","نام کسب‌وکار","店名","प्रतिष्ठान का नाम","Locale"],
"Localité":["Town","المدينة","Şehir","شهر","所在城市","शहर","Località"],
"E-mail (pour recevoir une copie)":["Email (to receive a copy)","البريد الإلكتروني (لتلقي نسخة)","E-posta (kopya almak için)","ایمیل (برای دریافت یک نسخه)","电子邮件（接收副本）","ईमेल (कॉपी पाने के लिए)","E-mail (per ricevere una copia)"],
"Téléphone":["Phone","الهاتف","Telefon","تلفن","电话","फ़ोन","Telefono"],
"Votre demande":["Your request","طلبك","Talebiniz","درخواست شما","您的询价","आपका अनुरोध","La vostra richiesta"],
"Aucun produit ajouté. Ajoutez-les depuis la liste, ou écrivez-les ci-dessous.":["No products added yet. Add them from the list, or write them below.","لم تُضف أي منتجات بعد. أضفها من القائمة، أو اكتبها أدناه.","Henüz ürün eklenmedi. Listeden ekleyin ya da aşağıya yazın.","هنوز محصولی اضافه نشده. از فهرست اضافه کنید یا پایین بنویسید.","尚未添加产品。请从列表中添加，或在下方填写。","अभी कोई उत्पाद नहीं जोड़ा गया। सूची से जोड़ें, या नीचे लिखें।","Nessun prodotto aggiunto. Aggiungeteli dalla lista o scriveteli qui sotto."],
"Autre besoin, personnalisation":["Other needs, custom branding","احتياجات أخرى، طباعة بعلامتك","Diğer ihtiyaçlar, kişiselleştirme","نیاز دیگر، شخصی‌سازی","其他需求、定制印刷","अन्य ज़रूरतें, कस्टम ब्रांडिंग","Altre esigenze, personalizzazione"],
"Envoyer ma demande":["Send my request","أرسل طلبي","Talebimi gönder","ارسال درخواست","发送询价","मेरा अनुरोध भेजें","Invia la richiesta"],
"Votre demande part chez Jalal par e-mail, en PDF. WhatsApp s'ouvre aussi avec la demande déjà écrite : il ne reste qu'à appuyer sur Envoyer. Rien ne s'ouvre ?":["Your request is sent to Jalal by email as a PDF. WhatsApp also opens with the request already written: just press Send. Nothing opened?","يُرسل طلبك إلى جلال عبر البريد الإلكتروني بصيغة PDF. ويُفتح واتساب أيضًا والطلب مكتوب مسبقًا: ما عليك إلا الضغط على إرسال. لم يُفتح شيء؟","Talebiniz Jalal'e e-postayla PDF olarak gider. WhatsApp da talep yazılmış olarak açılır: yalnızca Gönder'e basın. Hiçbir şey açılmadı mı?","درخواست شما به‌صورت PDF با ایمیل برای جلال فرستاده می‌شود. واتس‌اپ هم با متن آماده باز می‌شود: فقط «ارسال» را بزنید. چیزی باز نشد؟","您的询价已以 PDF 通过电子邮件发给 Jalal。WhatsApp 也会打开，内容已填好：只需点击发送。没有打开？","आपका अनुरोध PDF के रूप में ईमेल से जलाल को भेजा जाता है। WhatsApp भी अनुरोध लिखा हुआ खुलता है: बस भेजें दबाएँ। कुछ नहीं खुला?","La richiesta parte verso Jalal per e-mail, in PDF. Si apre anche WhatsApp con la richiesta già scritta: basta premere Invia. Non si apre nulla?"],
"Ouvrir WhatsApp":["Open WhatsApp","افتح واتساب","WhatsApp'ı aç","باز کردن واتس‌اپ","打开 WhatsApp","WhatsApp खोलें","Apri WhatsApp"],
"Emballages pour la restauration et les commerces · Suisse romande":["Packaging for restaurants and shops · French-speaking Switzerland","تغليف للمطاعم والمحلات · سويسرا الناطقة بالفرنسية","Restoran ve dükkânlar için ambalaj · Fransızca konuşulan İsviçre","بسته‌بندی برای رستوران‌ها و فروشگاه‌ها · سوئیس فرانسوی‌زبان","餐厅与商店包装 · 瑞士法语区","रेस्तराँ और दुकानों के लिए पैकेजिंग · फ़्रेंच-भाषी स्विट्ज़रलैंड","Imballaggi per ristoranti e negozi · Svizzera romanda"],
"© 2026 Karvan · Genève":["© 2026 Karvan · Geneva","© 2026 Karvan · جنيف","© 2026 Karvan · Cenevre","© 2026 Karvan · ژنو","© 2026 Karvan · 日内瓦","© 2026 Karvan · जिनेवा","© 2026 Karvan · Ginevra"],
"Site par":["Website by","الموقع من تصميم","Site:","طراحی سایت:","网站制作","वेबसाइट:","Sito di"],
"Tous":["All","الكل","Tümü","همه","全部","सभी","Tutti"],
"Bols":["Bowls","أوعية","Kâseler","کاسه‌ها","餐碗","कटोरे","Ciotole"],
"Burger":["Burger","برغر","Burger","برگر","汉堡","बर्गर","Burger"],
"Gobelets":["Cups","أكواب","Bardaklar","لیوان‌ها","杯子","कप","Bicchieri"],
"Sacs":["Bags","أكياس","Poşetler","کیسه‌ها","纸袋","थैले","Sacchetti"],
"Pizza":["Pizza","بيتزا","Pizza","پیتزا","披萨","पिज़्ज़ा","Pizza"],
"Sauces":["Sauces","صلصات","Soslar","سس‌ها","酱料","सॉस","Salse"],
"Salades":["Salads","سلطات","Salatalar","سالادها","沙拉","सलाद","Insalate"],
"Autres":["Other","أخرى","Diğer","سایر","其他","अन्य","Altro"],
"Dimensions":["Size","المقاسات","Ölçüler","ابعاد","尺寸","माप","Dimensioni"],
"Matière":["Material","الخامة","Malzeme","جنس","材质","सामग्री","Materiale"],
"Carton":["Carton","الكرتونة","Koli","کارتن","每箱","कार्टन","Cartone"],
"Ajouter à ma demande":["Add to my request","أضف إلى طلبي","Talebime ekle","افزودن به درخواست","加入询价","मेरे अनुरोध में जोड़ें","Aggiungi alla richiesta"],
"En rupture":["Out of stock","نفد المخزون","Stokta yok","ناموجود","缺货","स्टॉक ख़त्म","Esaurito"],
"En rupture de stock":["Out of stock","نفد من المخزون","Stokta yok","ناموجود","暂时缺货","स्टॉक में नहीं","Esaurito"],
"Retirer":["Remove","إزالة","Kaldır","حذف","移除","हटाएँ","Rimuovi"],
"Indiquez votre nom.":["Please enter your name.","يرجى إدخال اسمك.","Lütfen adınızı yazın.","لطفاً نام خود را بنویسید.","请填写您的姓名。","कृपया अपना नाम लिखें।","Indicate il vostro nome."],
"Indiquez le nom de votre établissement.":["Please enter your business name.","يرجى إدخال اسم محلك.","Lütfen işletmenizin adını yazın.","لطفاً نام کسب‌وکار خود را بنویسید.","请填写店名。","कृपया अपने प्रतिष्ठान का नाम लिखें।","Indicate il nome del vostro locale."],
"Indiquez votre localité, pour la livraison.":["Please enter your town, for delivery.","يرجى إدخال مدينتك من أجل التوصيل.","Teslimat için lütfen şehrinizi yazın.","لطفاً برای تحویل، شهر خود را بنویسید.","请填写所在城市，以便配送。","डिलीवरी के लिए कृपया अपना शहर लिखें।","Indicate la vostra località, per la consegna."],
"Vérifiez votre adresse e-mail.":["Please check your email address.","يرجى التحقق من بريدك الإلكتروني.","Lütfen e-posta adresinizi kontrol edin.","لطفاً ایمیل خود را بررسی کنید.","请检查您的电子邮件地址。","कृपया अपना ईमेल पता जाँचें।","Controllate il vostro indirizzo e-mail."],
"Ajoutez des produits depuis la liste, ou écrivez votre besoin ici.":["Add products from the list, or describe what you need here.","أضف منتجات من القائمة، أو اكتب ما تحتاجه هنا.","Listeden ürün ekleyin ya da ihtiyacınızı buraya yazın.","از فهرست محصول اضافه کنید یا نیازتان را اینجا بنویسید.","请从列表中添加产品，或在此写下您的需求。","सूची से उत्पाद जोड़ें, या अपनी ज़रूरत यहाँ लिखें।","Aggiungete prodotti dalla lista o scrivete qui la vostra esigenza."],
// désignations du catalogue
"Bol kraft":["Kraft bowl","وعاء كرافت","Kraft kâse","کاسه کرافت","牛皮纸碗","क्राफ़्ट कटोरा","Ciotola in kraft"],
"Box à burger":["Burger box","علبة برغر","Burger kutusu","جعبه برگر","汉堡盒","बर्गर बॉक्स","Box per burger"],
"Petite box à burger":["Small burger box","علبة برغر صغيرة","Küçük burger kutusu","جعبه برگر کوچک","小号汉堡盒","छोटा बर्गर बॉक्स","Box per burger piccolo"],
"Papier à burger":["Burger wrap paper","ورق تغليف البرغر","Burger kâğıdı","کاغذ برگر","汉堡包装纸","बर्गर रैप पेपर","Carta per burger"],
"Gobelet":["Cup","كوب","Bardak","لیوان","杯子","कप","Bicchiere"],
"Boîte à pizza":["Pizza box","علبة بيتزا","Pizza kutusu","جعبه پیتزا","披萨盒","पिज़्ज़ा बॉक्स","Cartone per pizza"],
"Sac kraft à poignées":["Kraft bag with handles","كيس كرافت بمقابض","Saplı kraft poşet","کیسه کرافت دسته‌دار","手提牛皮纸袋","हैंडल वाला क्राफ़्ट थैला","Sacchetto kraft con manici"],
"Barquette à salade avec couvercle":["Salad container with lid","علبة سلطة بغطاء","Kapaklı salata kabı","ظرف سالاد درب‌دار","带盖沙拉盒","ढक्कन वाला सलाद डिब्बा","Vaschetta per insalata con coperchio"],
"Barquette à sauce avec couvercle":["Sauce container with lid","علبة صلصة بغطاء","Kapaklı sos kabı","ظرف سس درب‌دار","带盖酱料盒","ढक्कन वाला सॉस डिब्बा","Vaschetta per salsa con coperchio"],
"Pot à sauce avec couvercle":["Sauce pot with lid","وعاء صلصة بغطاء","Kapaklı sos kabı","ظرف سس گرد درب‌دار","带盖酱料杯","ढक्कन वाला सॉस कप","Coppetta per salsa con coperchio"],
"Kraft":["Kraft","كرافت","Kraft","کرافت","牛皮纸","क्राफ़्ट","Kraft"],
"Transparent":["Clear","شفاف","Şeffaf","شفاف","透明","पारदर्शी","Trasparente"],
"Papier":["Paper","ورق","Kâğıt","کاغذ","纸","कागज़","Carta"],
"Carton kraft":["Kraft board","كرتون كرافت","Kraft karton","مقوای کرافت","牛皮纸板","क्राफ़्ट कार्डबोर्ड","Cartone kraft"],
"PET transparent":["Clear PET","PET شفاف","Şeffaf PET","PET شفاف","透明 PET","पारदर्शी PET","PET trasparente"],
// attributs
"Karvan, accueil":["Karvan, home","كارفان، الرئيسية","Karvan, ana sayfa","کاروان، صفحه اصلی","Karvan 首页","Karvan, होम","Karvan, home"],
"Navigation principale":["Main navigation","التنقل الرئيسي","Ana menü","منوی اصلی","主导航","मुख्य नेविगेशन","Navigazione principale"],
"Sac kraft à poignées plates":["Kraft bag with flat handles","كيس كرافت بمقابض مسطحة","Düz saplı kraft poşet","کیسه کرافت با دسته تخت","扁绳手提牛皮纸袋","चपटे हैंडल वाला क्राफ़्ट थैला","Sacchetto kraft con manici piatti"],
"Filtrer par famille":["Filter by category","تصفية حسب الفئة","Kategoriye göre filtrele","فیلتر بر اساس دسته","按类别筛选","श्रेणी से छाँटें","Filtra per categoria"],
"Sac, box et gobelet kraft neutres":["Plain kraft bag, box and cup","كيس وعلبة وكوب كرافت سادة","Sade kraft poşet, kutu ve bardak","کیسه، جعبه و لیوان کرافت ساده","素色牛皮纸袋、盒和杯","सादा क्राफ़्ट थैला, बॉक्स और कप","Sacchetto, box e bicchiere kraft neutri"],
"Les mêmes emballages aux couleurs d'une enseigne":["The same packaging in a brand's colours","نفس التغليف بألوان علامة تجارية","Aynı ambalajlar bir markanın renklerinde","همان بسته‌بندی‌ها با رنگ‌های یک برند","同样的包装，换上品牌配色","वही पैकेजिंग, एक ब्रांड के रंगों में","Gli stessi imballaggi con i colori di un'insegna"],
"Comparer avant et après":["Compare before and after","قارن قبل وبعد","Önce ve sonrayı karşılaştırın","مقایسه قبل و بعد","对比前后效果","पहले और बाद की तुलना करें","Confronta prima e dopo"],
"Cachet Karvan, import export":["Karvan seal, import export","ختم كارفان، استيراد وتصدير","Karvan mührü, ithalat ihracat","مهر کاروان، واردات و صادرات","Karvan 印章，进出口","Karvan मुहर, आयात निर्यात","Sigillo Karvan, import export"],
"Écrire à Jalal sur WhatsApp":["Message Jalal on WhatsApp","راسل جلال على واتساب","Jalal'e WhatsApp'tan yazın","به جلال در واتس‌اپ پیام دهید","在 WhatsApp 上联系 Jalal","WhatsApp पर जलाल को लिखें","Scrivi a Jalal su WhatsApp"],
"ex. Genève, Carouge, Nyon":["e.g. Geneva, Carouge, Nyon","مثلًا: جنيف، كاروج، نيون","örn. Cenevre, Carouge, Nyon","مثلاً ژنو، کاروژ، نیون","例如：日内瓦、卡鲁日、尼翁","जैसे जिनेवा, कारूज, न्यों","es. Ginevra, Carouge, Nyon"],
"Langue":["Language","اللغة","Dil","زبان","语言","भाषा","Lingua"]
};
const MOTS={ // morceaux pour les règles
 pieces:["pieces","قطعة","adet","عدد","件","पीस","pezzi"],
 carton:["carton","كرتونة","koli","کارتن","箱","कार्टन","cartone"],
 cartons:["cartons","كراتين","koli","کارتن","箱","कार्टन","cartoni"],
 ajoute:["Added","أُضيف","Eklendi","اضافه شد","已加入","जोड़ा गया","Aggiunto"],
 moins:["One carton less","كرتونة أقل","Bir koli eksik","یک کارتن کمتر","减少一箱","एक कार्टन कम","Un cartone in meno"],
 plus:["One carton more","كرتونة أكثر","Bir koli fazla","یک کارتن بیشتر","增加一箱","एक कार्टन ज़्यादा","Un cartone in più"],
 couvBol:["Lid for bowl","غطاء لوعاء","Kâse kapağı","درب کاسه","碗盖，适用","कटोरे का ढक्कन","Coperchio per ciotola"],
 couvGob:["Lid for cup","غطاء لكوب","Bardak kapağı","درب لیوان","杯盖，适用","कप का ढक्कन","Coperchio per bicchiere"],
 taille:["size","مقاس","beden","سایز","尺码","साइज़","misura"]
};
let lang='fr';const k=()=>IX[lang];
const tr=s=>{if(lang==='fr')return s;const t=D[s];return t?t[k()]:regle(s)};
const m=n=>MOTS[n][k()];
const iso=x=>(lang==='ar'||lang==='fa')&&/^[\x20-\x7e’]+$/.test(x)?'\u2066'+x+'\u2069':x; // garde « 550 ml » dans le bon ordre en arabe et persan
function regle(s){let r;
 if(r=s.match(/^([\d’'  ]+) pièces$/))return r[1]+' '+m('pieces');
 if(r=s.match(/^Ajouté · (\d+) cartons?$/))return m('ajoute')+' · '+r[1]+' '+m(+r[1]>1?'cartons':'carton');
 if(r=s.match(/^Un carton de moins, (.+)$/))return m('moins')+', '+r[1];
 if(r=s.match(/^Un carton de plus, (.+)$/))return m('plus')+', '+r[1];
 if(r=s.match(/^Cartons (.+)$/))return m('cartons')+' '+r[1];
 if(r=s.match(/^Retirer (.+)$/))return tr('Retirer')+' '+r[1];
 if(r=s.match(/^Couvercle pour bol (.+)$/))return m('couvBol')+' '+iso(r[1]);
 if(r=s.match(/^Couvercle pour gobelet (.+)$/))return m('couvGob')+' '+iso(r[1]);
 if(r=s.match(/^taille (.+)$/))return m('taille')+' '+r[1];
 if(r=s.match(/^(.+?) · (.+)$/)){const a=tr(r[1]),b=tr(r[2]);if(a!==r[1]||b!==r[2])return a+' · '+iso(b)}
 return s}
const ORIG=new WeakMap(),ATTR=['alt','aria-label','placeholder'];
function traduire(root){
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('script,style,[lang="fa"].fa,.nb,.langues,output,.ref'))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 let n;while(n=w.nextNode()){let o=ORIG.get(n);if(o===undefined||(n.nodeValue!==o.t)){o={fr:n.nodeValue};}const v=o.fr,c=v.trim(),t=c?tr(c):c;const nv=v.replace(c,t);o.t=nv;ORIG.set(n,o);if(n.nodeValue!==nv)n.nodeValue=nv}
 root.querySelectorAll('[alt],[aria-label],[placeholder]').forEach(el=>{if(el.closest('.langues'))return;let o=ORIG.get(el);if(!o){o={};ORIG.set(el,o)}
  ATTR.forEach(a=>{if(!el.hasAttribute(a))return;const cur=el.getAttribute(a);if(o[a]===undefined||cur!==o['t'+a])o[a]=cur;const nv=tr(o[a]);o['t'+a]=nv;if(cur!==nv)el.setAttribute(a,nv)})});
}
const POL={ar:'Noto+Sans+Arabic:wght@400;500;700',fa:'Vazirmatn:wght@400;500;700',hi:'Noto+Sans+Devanagari:wght@400;500;700'};
function police(c){if(!POL[c]||document.getElementById('pol-'+c))return;const l=document.createElement('link');l.id='pol-'+c;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+POL[c]+'&display=swap';document.head.appendChild(l)}
function appliquer(c,garder){
 const x=L.find(y=>y.c===c)||L[0];lang=x.c;police(lang);
 const h=document.documentElement;h.lang=lang;h.dir=x.rtl?'rtl':'ltr';h.dataset.langue=lang;
 document.title=tr("Karvan · Emballages pour les pros de l'alimentation");
 traduire(document.body);
 const b=document.querySelector('.langues>button');if(b){b.querySelector('img').src='/karvan/drapeaux/'+x.f+'.svg';b.querySelector('span').textContent=x.c.toUpperCase();b.setAttribute('aria-label',tr('Langue')+' : '+x.n)}
 document.querySelectorAll('.langues li button').forEach(e=>e.setAttribute('aria-current',e.dataset.l===lang?'true':'false'));
 if(garder){try{localStorage.setItem('karvan-langue',lang)}catch(_){}
  const u=new URL(location.href);if(lang==='fr')u.searchParams.delete('lang');else u.searchParams.set('lang',lang);history.replaceState(null,'',u)}
}
function menu(){
 const ban=document.querySelector('.bandeau');if(!ban)return;
 const d=document.createElement('div');d.className='langues';
 d.innerHTML='<button type="button" aria-haspopup="true" aria-expanded="false"><img src="/karvan/drapeaux/fr.svg" alt="" width="20" height="15"><span>FR</span><svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button><ul hidden>'+
  L.map(x=>'<li><button type="button" data-l="'+x.c+'" lang="'+x.c+'"><img src="/karvan/drapeaux/'+x.f+'.svg" alt="" width="20" height="15" loading="lazy"><span>'+x.n+'</span></button></li>').join('')+'</ul>';
 ban.appendChild(d);const b=d.firstChild,ul=d.querySelector('ul');
 const fermer=f=>{ul.hidden=true;b.setAttribute('aria-expanded','false');if(f)b.focus()};
 b.addEventListener('click',()=>{const o=ul.hidden;ul.hidden=!o;b.setAttribute('aria-expanded',String(o));if(o)(ul.querySelector('[aria-current="true"]')||ul.querySelector('button')).focus()});
 ul.addEventListener('click',e=>{const x=e.target.closest('button');if(!x)return;appliquer(x.dataset.l,true);fermer(true)});
 d.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ul.hidden){fermer(true)}
  if((e.key==='ArrowDown'||e.key==='ArrowUp')&&!ul.hidden){e.preventDefault();const t=[...ul.querySelectorAll('button')],i=t.indexOf(document.activeElement);t[(i+(e.key==='ArrowDown'?1:t.length-1))%t.length].focus()}});
 document.addEventListener('click',e=>{if(!d.contains(e.target)&&!ul.hidden)fermer()});
}
window.KarvanLangue={traduire:r=>{if(lang!=='fr')traduire(r||document.body)},t:s=>tr(s),get code(){return lang}};
menu();
let c=new URL(location.href).searchParams.get('lang');
if(!c){try{c=localStorage.getItem('karvan-langue')}catch(_){}}
if(!c){const n=(navigator.language||'').slice(0,2).toLowerCase();if(IX[n]!==undefined)c=n}
if(c&&c!=='fr'&&L.some(x=>x.c===c))appliquer(c,false);
})();
