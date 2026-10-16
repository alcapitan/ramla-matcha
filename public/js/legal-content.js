/* Textes légaux — Mentions légales (notice) et Conditions générales de vente (terms).
   Les {{champs}} sont remplis automatiquement depuis config/shop.json → "legal".
   Pour modifier un texte : change-le dans les deux langues (en + ar). */
window.LEGAL = {
  en: {
    notice: {
      title: "Legal notice & privacy",
      updated: "Last updated: {{lastUpdated}}",
      body: `
<h2>1. Website publisher</h2>
<p>This website is published by:</p>
<ul>
  <li><b>Brand:</b> {{brand}}</li>
  <li><b>Owner:</b> {{ownerName}}</li>
  <li><b>Legal status:</b> {{status}}</li>
  <li><b>Registration number (auto-entrepreneur card / trade register):</b> {{registrationNumber}}</li>
  <li><b>Tax identification number (NIF):</b> {{nif}}</li>
  <li><b>Address:</b> {{address}}</li>
  <li><b>Phone:</b> {{phone}} — <b>WhatsApp:</b> {{whatsapp}}</li>
  <li><b>Email:</b> {{email}}</li>
</ul>

<h2>2. Hosting</h2>
<p>The website {{domain}} is hosted by {{hostName}}, {{hostAddress}}.</p>

<h2>3. Intellectual property</h2>
<p>The name “Ramla رملة”, the logo, the photos, the texts and the design of this website belong to {{brand}}. Any reproduction or use, in whole or in part, without prior written permission is prohibited.</p>

<h2 id="privacy">4. Personal data</h2>
<p>We collect only the data we need to process your order and to send you your welcome offer, in accordance with Algerian Law No. 18-07 on the protection of personal data, as amended.</p>
<h3>What we collect</h3>
<ul>
  <li><b>When you order:</b> first name, last name, phone number, wilaya, commune, delivery address, and optionally your email and a note.</li>
  <li><b>When you sign up for the 15% offer:</b> your email address and your language.</li>
</ul>
<h3>Why we use it</h3>
<ul>
  <li>To confirm your order with you on WhatsApp, prepare it and deliver it.</li>
  <li>To send you your discount code and, if you signed up, news about Ramla.</li>
  <li>To answer your questions and handle any complaint.</li>
</ul>
<h3>Who receives it</h3>
<p>Only the Ramla team and, for delivery only, our carrier ({{carrier}}), which receives your name, phone number and address. Emails are sent through our email provider. We never sell or rent your data.</p>
<h3>How long we keep it</h3>
<p>Order data is kept for as long as needed to process your order and to meet our legal and accounting obligations. Your newsletter email is kept until you ask us to remove it.</p>
<h3>Your rights</h3>
<p>You can ask to access, correct or delete your data, or object to receiving our messages, at any time: write to {{email}} or message us on WhatsApp at {{whatsapp}}. You can also contact the national authority for the protection of personal data (ANPDP).</p>
<h3>Cookies and storage</h3>
<p>We do not use advertising or tracking cookies. Your browser only stores your cart, your language and whether you have closed the welcome pop-up. The website's fonts are loaded from Google Fonts, which receives your IP address when you visit.</p>

<h2>5. Contact</h2>
<p>For any question about this website: {{email}} — WhatsApp {{whatsapp}}.</p>`,
    },

    terms: {
      title: "Terms of sale",
      updated: "Last updated: {{lastUpdated}}",
      body: `
<h2>1. Scope</h2>
<p>These terms of sale apply to every order placed on {{domain}}. By ticking the box “I have read and accept the terms of sale” before confirming your order, you accept them in full. They are governed by Algerian Law No. 18-05 on e-commerce.</p>

<h2>2. Seller</h2>
<p>{{brand}} — {{ownerName}}, {{status}}.<br>
Registration number: {{registrationNumber}} — NIF: {{nif}}<br>
Address: {{address}}<br>
Phone: {{phone}} — WhatsApp: {{whatsapp}} — Email: {{email}}</p>

<h2>3. Products</h2>
<p>The main product is ceremonial grade matcha (green tea powder) in a 30 g stainless steel tin. Its characteristics are described on each product page. Photos are for illustration. Products are offered while stocks last. If a product becomes unavailable after your order, we will tell you on WhatsApp and you may cancel without any cost.</p>
<p>Matcha is a food product: store it in a cool, dry place, away from light, and close the tin tightly after use. Best-before date and lot number are printed on the label.</p>

<h2>4. Prices</h2>
<p>Prices are shown in Algerian dinars (DA), all taxes included. Delivery fees are added depending on your wilaya and the delivery method (home or stop desk); they are shown before you confirm your order. The price that applies is the one shown when you place your order.</p>

<h2>5. How to order</h2>
<ol>
  <li>Add products to your cart.</li>
  <li>Fill in your details: name, phone number, wilaya, commune and address.</li>
  <li>Check the summary: products, discount, delivery fees and total.</li>
  <li>Tick the box to accept these terms, then click “Confirm my order”.</li>
</ol>
<p>An order number is shown on screen. We then contact you on WhatsApp to confirm your order before shipping it. We may cancel an order if the information is incomplete or incorrect, or if we cannot reach you after several attempts.</p>

<h2>6. Discount code</h2>
<p>The 15% welcome code is personal, valid once, on a first order, for one person / email address. It applies to the products (not to delivery fees) and cannot be combined with any other offer.</p>

<h2>7. Payment</h2>
<p>Payment is made <b>in cash on delivery</b>, to the delivery agent, for the total amount shown in your order (products + delivery − any discount). No payment is made on the website and we never ask for your bank details.</p>

<h2>8. Delivery</h2>
<p>We deliver to all 58 wilayas through {{carrier}}, either to your home or to a stop desk. The indicative delivery time is {{deliveryDays}} working days after your order is confirmed on WhatsApp. Please check your parcel when you receive it.</p>
<p><b>Late delivery:</b> if the delivery time is exceeded, you may return the product as it is within four (4) working days of actual delivery, without prejudice to your right to claim damages.</p>

<h2>9. Non-conforming or defective product</h2>
<p>If you receive a product that is damaged, defective or does not match your order, contact us as soon as possible on WhatsApp or by email, with a photo. At your choice, we will:</p>
<ul>
  <li>send you the correct product,</li>
  <li>exchange it for an identical product, or</li>
  <li>cancel your order and refund the amount paid.</li>
</ul>
<p>Return costs are paid by us in these cases. Any refund is made within fifteen (15) days of receiving the returned product.</p>
<p>Outside these cases, for hygiene and food-safety reasons, opened products cannot be returned.</p>

<h2>10. Invoice</h2>
<p>An invoice is issued for every order. It is given with your parcel or sent to you on request.</p>

<h2>11. Complaints</h2>
<p>For any complaint, contact us on WhatsApp at {{whatsapp}} or at {{email}}, with your order number. We reply within seven (7) days.</p>

<h2>12. Personal data</h2>
<p>The data you give us is used only to process and deliver your order. See the <a href="/legal#privacy">privacy section of our legal notice</a>.</p>

<h2>13. Applicable law and disputes</h2>
<p>These terms are governed by Algerian law. In case of a dispute, we will first look for an amicable solution with you. Failing that, the competent Algerian courts will have jurisdiction.</p>`,
    },
  },

  ar: {
    notice: {
      title: "الإشعار القانوني وحماية البيانات",
      updated: "آخر تحديث: {{lastUpdated}}",
      body: `
<h2>1. ناشر الموقع</h2>
<p>يُنشر هذا الموقع من طرف:</p>
<ul>
  <li><b>العلامة:</b> {{brand}}</li>
  <li><b>المالك:</b> {{ownerName}}</li>
  <li><b>الصفة القانونية:</b> {{status}}</li>
  <li><b>رقم التسجيل (بطاقة المقاول الذاتي / السجل التجاري):</b> {{registrationNumber}}</li>
  <li><b>رقم التعريف الجبائي (NIF):</b> {{nif}}</li>
  <li><b>العنوان:</b> {{address}}</li>
  <li><b>الهاتف:</b> {{phone}} — <b>واتساب:</b> {{whatsapp}}</li>
  <li><b>البريد الإلكتروني:</b> {{email}}</li>
</ul>

<h2>2. الاستضافة</h2>
<p>يستضيف الموقع {{domain}} مزوّد الاستضافة {{hostName}}، {{hostAddress}}.</p>

<h2>3. الملكية الفكرية</h2>
<p>اسم «رملة Ramla» والشعار والصور والنصوص وتصميم هذا الموقع ملك لـ {{brand}}. يُمنع أي نسخ أو استعمال كلي أو جزئي دون إذن كتابي مسبق.</p>

<h2 id="privacy">4. البيانات الشخصية</h2>
<p>لا نجمع إلا البيانات الضرورية لمعالجة طلبك ولإرسال عرض الترحيب، وفقًا للقانون الجزائري رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي، المعدّل.</p>
<h3>ما الذي نجمعه</h3>
<ul>
  <li><b>عند الطلب:</b> الاسم، اللقب، رقم الهاتف، الولاية، البلدية، عنوان التوصيل، واختياريًا البريد الإلكتروني وملاحظة.</li>
  <li><b>عند التسجيل في عرض 15٪:</b> بريدك الإلكتروني ولغتك.</li>
</ul>
<h3>لماذا نستعملها</h3>
<ul>
  <li>لتأكيد طلبك معك عبر واتساب وتحضيره وتوصيله.</li>
  <li>لإرسال رمز التخفيض، وأخبار رملة إن كنتِ مسجّلة.</li>
  <li>للإجابة عن أسئلتك ومعالجة أي شكوى.</li>
</ul>
<h3>من يستلمها</h3>
<p>فريق رملة فقط، وشركة التوصيل ({{carrier}}) لغرض التوصيل فقط، إذ تستلم الاسم ورقم الهاتف والعنوان. تُرسل الرسائل الإلكترونية عبر مزوّد البريد الخاص بنا. لا نبيع بياناتك ولا نؤجّرها أبدًا.</p>
<h3>مدة الحفظ</h3>
<p>تُحفظ بيانات الطلب طوال المدة اللازمة لمعالجته وللوفاء بالتزاماتنا القانونية والمحاسبية. يُحفظ بريدك الخاص بالنشرة إلى أن تطلبي حذفه.</p>
<h3>حقوقك</h3>
<p>يمكنك في أي وقت طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، أو الاعتراض على استلام رسائلنا: راسلينا على {{email}} أو عبر واتساب على {{whatsapp}}. يمكنك أيضًا التوجّه إلى السلطة الوطنية لحماية المعطيات ذات الطابع الشخصي (ANPDP).</p>
<h3>ملفات تعريف الارتباط والتخزين</h3>
<p>لا نستعمل ملفات تعريف ارتباط إعلانية أو للتتبّع. يحفظ متصفحك فقط سلّتك ولغتك وما إذا كنتِ قد أغلقتِ نافذة الترحيب. تُحمَّل خطوط الموقع من Google Fonts التي تستلم عنوان IP الخاص بك عند الزيارة.</p>

<h2>5. التواصل</h2>
<p>لأي سؤال حول الموقع: {{email}} — واتساب {{whatsapp}}.</p>`,
    },

    terms: {
      title: "الشروط العامة للبيع",
      updated: "آخر تحديث: {{lastUpdated}}",
      body: `
<h2>1. مجال التطبيق</h2>
<p>تُطبَّق هذه الشروط العامة للبيع على كل طلب يتم عبر {{domain}}. بوضع علامة على خانة «قرأتُ الشروط العامة للبيع وأوافق عليها» قبل تأكيد طلبك، فإنك تقبلينها كاملة. تخضع هذه الشروط للقانون الجزائري رقم 18-05 المتعلق بالتجارة الإلكترونية.</p>

<h2>2. البائع</h2>
<p>{{brand}} — {{ownerName}}، {{status}}.<br>
رقم التسجيل: {{registrationNumber}} — رقم التعريف الجبائي: {{nif}}<br>
العنوان: {{address}}<br>
الهاتف: {{phone}} — واتساب: {{whatsapp}} — البريد الإلكتروني: {{email}}</p>

<h2>3. المنتجات</h2>
<p>المنتج الأساسي هو ماتشا من الدرجة الاحتفالية (مسحوق الشاي الأخضر) في علبة من الفولاذ المقاوم للصدأ سعة 30 غ. خصائص كل منتج موضّحة في صفحته. الصور للتوضيح فقط. تُعرض المنتجات في حدود المخزون المتوفّر. إذا أصبح منتج غير متوفّر بعد طلبك، نُعلمك عبر واتساب ويمكنك إلغاء الطلب دون أي تكلفة.</p>
<p>الماتشا منتج غذائي: احفظيه في مكان بارد وجاف بعيدًا عن الضوء، وأغلقي العلبة جيدًا بعد الاستعمال. تاريخ الصلاحية ورقم الحصة مطبوعان على الملصق.</p>

<h2>4. الأسعار</h2>
<p>الأسعار معروضة بالدينار الجزائري (د.ج)، شاملة لكل الرسوم. تُضاف مصاريف التوصيل حسب الولاية وطريقة التوصيل (إلى المنزل أو إلى مكتب التوصيل)، وتظهر قبل تأكيد الطلب. السعر المعتمد هو السعر المعروض لحظة الطلب.</p>

<h2>5. طريقة الطلب</h2>
<ol>
  <li>أضيفي المنتجات إلى السلة.</li>
  <li>املئي معلوماتك: الاسم، رقم الهاتف، الولاية، البلدية والعنوان.</li>
  <li>تحقّقي من الملخّص: المنتجات، التخفيض، مصاريف التوصيل والمجموع.</li>
  <li>ضعي علامة على خانة قبول هذه الشروط، ثم اضغطي «تأكيد طلبي».</li>
</ol>
<p>يظهر رقم الطلب على الشاشة. بعد ذلك نتواصل معك عبر واتساب لتأكيد الطلب قبل إرساله. يمكننا إلغاء الطلب إذا كانت المعلومات ناقصة أو غير صحيحة، أو إذا تعذّر الاتصال بك بعد عدة محاولات.</p>

<h2>6. رمز التخفيض</h2>
<p>رمز الترحيب (15٪) شخصي، صالح لمرة واحدة، على الطلب الأول، لشخص واحد / بريد إلكتروني واحد. يُطبَّق على المنتجات (وليس على مصاريف التوصيل)، ولا يُجمع مع أي عرض آخر.</p>

<h2>7. الدفع</h2>
<p>يتم الدفع <b>نقدًا عند الاستلام</b> لعون التوصيل، بالمبلغ الإجمالي المعروض في طلبك (المنتجات + التوصيل − التخفيض إن وُجد). لا يتم أي دفع عبر الموقع، ولا نطلب أبدًا معلوماتك البنكية.</p>

<h2>8. التوصيل</h2>
<p>نوصّل إلى 58 ولاية عبر {{carrier}}، إلى المنزل أو إلى مكتب التوصيل. مدة التوصيل التقديرية {{deliveryDays}} أيام عمل بعد تأكيد الطلب عبر واتساب. يرجى التحقق من الطرد عند الاستلام.</p>
<p><b>التأخر في التوصيل:</b> في حال تجاوز أجل التوصيل، يمكنك إعادة المنتج على حالته خلال أربعة (4) أيام عمل من تاريخ الاستلام الفعلي، دون المساس بحقك في المطالبة بالتعويض.</p>

<h2>9. منتج غير مطابق أو معيب</h2>
<p>إذا استلمتِ منتجًا تالفًا أو معيبًا أو غير مطابق لطلبك، تواصلي معنا في أقرب وقت عبر واتساب أو البريد الإلكتروني مع صورة. وحسب اختيارك، نقوم بـ:</p>
<ul>
  <li>إرسال المنتج المطابق،</li>
  <li>أو استبداله بمنتج مماثل،</li>
  <li>أو إلغاء الطلب وإرجاع المبلغ المدفوع.</li>
</ul>
<p>نتحمّل مصاريف الإرجاع في هذه الحالات. يتم إرجاع أي مبلغ خلال خمسة عشر (15) يومًا من استلام المنتج المُعاد.</p>
<p>خارج هذه الحالات، ولأسباب تتعلّق بالنظافة وسلامة الغذاء، لا يمكن إرجاع المنتجات المفتوحة.</p>

<h2>10. الفاتورة</h2>
<p>تُصدر فاتورة لكل طلب، وتُسلَّم مع الطرد أو تُرسل إليك عند الطلب.</p>

<h2>11. الشكاوى</h2>
<p>لأي شكوى، تواصلي معنا عبر واتساب على {{whatsapp}} أو على {{email}} مع ذكر رقم الطلب. نردّ خلال سبعة (7) أيام.</p>

<h2>12. البيانات الشخصية</h2>
<p>تُستعمل البيانات التي تقدّمينها فقط لمعالجة طلبك وتوصيله. راجعي <a href="/legal#privacy">قسم حماية البيانات في الإشعار القانوني</a>.</p>

<h2>13. القانون المطبّق والنزاعات</h2>
<p>تخضع هذه الشروط للقانون الجزائري. في حال وقوع نزاع، نبحث أولًا عن حلّ ودّي معك. وفي حال تعذّر ذلك، تختص المحاكم الجزائرية المختصة بالنظر فيه.</p>`,
    },
  },
};

/* Affichage : remplit les {{champs}} avec config/shop.json → "legal".
   Un champ vide s'affiche en jaune pour que tu le voies avant la mise en ligne. */
window.renderLegal = async function (doc) {
  const R = window.Ramla;
  const root = document.getElementById("legal-root");
  let legal = {};
  try {
    legal = (await R.shop()).legal || {};
  } catch {
    /* réseau */
  }
  if (!legal.domain) legal.domain = location.host;
  const fill = (txt) =>
    txt.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      legal[k] ? R.esc(legal[k]) : `<mark class="todo">[${k}]</mark>`,
    );
  function draw() {
    const d = (window.LEGAL[R.lang()] || window.LEGAL.en)[doc];
    document.title = `${d.title} — Ramla رملة Matcha`;
    root.innerHTML = `<header class="page-title"><span class="eyebrow">Ramla رملة</span><h1>${d.title}</h1>
      <p class="muted" style="margin-top:12px">${fill(d.updated)}</p></header>
      <article class="legal">${fill(d.body)}</article>`;
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }
  draw();
  document.addEventListener("langchange", draw);
};
