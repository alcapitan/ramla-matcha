"use strict";
/**
 * Ramla رملة Matcha — serveur de la boutique.
 * - Sert le site statique (public/)
 * - Newsletter : envoie un code -10% unique par e-mail
 * - Commandes : paiement à la livraison, enregistrées dans DATA_DIR/orders.json
 *   + e-mail de notification à OWNER_EMAIL
 * - /admin : liste des commandes avec bouton WhatsApp (protégé par ADMIN_PASSWORD)
 */
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const CONFIG_PATH =
  process.env.SHOP_CONFIG || path.join(__dirname, "config", "shop.json");
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(
  /\/$/,
  "",
);
const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SMTP_READY = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);

const shop = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const productsById = Object.fromEntries(shop.products.map((p) => [p.id, p]));
const WILAYAS = require("./wilayas");

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- petit stockage JSON (écriture atomique + file d'attente) ---------- */
function makeStore(file, initial) {
  const full = path.join(DATA_DIR, file);
  let data = initial;
  if (fs.existsSync(full)) {
    try {
      data = JSON.parse(fs.readFileSync(full, "utf8"));
    } catch (e) {
      console.error(`[store] ${file} illisible, sauvegarde en .bak`, e.message);
      fs.copyFileSync(full, full + ".bak");
    }
  }
  let queue = Promise.resolve();
  return {
    get: () => data,
    save() {
      const snapshot = JSON.stringify(data, null, 2);
      queue = queue
        .then(async () => {
          const tmp = full + ".tmp";
          await fs.promises.writeFile(tmp, snapshot);
          await fs.promises.rename(tmp, full);
        })
        .catch((e) => console.error(`[store] écriture ${file} échouée`, e));
      return queue;
    },
  };
}
const subscribers = makeStore("subscribers.json", {}); // email -> { code, lang, createdAt, usedBy }
const orders = makeStore("orders.json", { seq: 0, list: [] });
/* ---------- désinscription newsletter ---------- */
// Clé secrète pour signer les liens de désinscription (créée automatiquement, gardée dans /data).
const SECRET_FILE = path.join(DATA_DIR, "secret.key");
if (!fs.existsSync(SECRET_FILE))
  fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString("hex"), {
    mode: 0o600,
  });
const APP_SECRET =
  process.env.APP_SECRET || fs.readFileSync(SECRET_FILE, "utf8").trim();
const unsubToken = (email) =>
  crypto
    .createHmac("sha256", APP_SECRET)
    .update("unsub:" + email)
    .digest("base64url")
    .slice(0, 32);
function unsubUrl(email, lang) {
  const e = Buffer.from(email).toString("base64url");
  return `${SITE_URL}/unsubscribe.html?e=${e}&t=${unsubToken(email)}&l=${lang === "ar" ? "ar" : "en"}`;
}
function checkUnsub(e, t) {
  let email = "";
  try {
    email = Buffer.from(String(e || ""), "base64url")
      .toString("utf8")
      .toLowerCase();
  } catch {
    return null;
  }
  const good = Buffer.from(unsubToken(email));
  const given = Buffer.from(String(t || ""));
  return email &&
    good.length === given.length &&
    crypto.timingSafeEqual(good, given)
    ? email
    : null;
}

/* ---------- e-mail ---------- */
const mailer = SMTP_READY
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_SECURE || "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
const MAIL_FROM =
  process.env.MAIL_FROM ||
  (process.env.SMTP_USER ? `Ramla Matcha <${process.env.SMTP_USER}>` : "");

async function sendMail(opts) {
  if (!mailer) {
    console.log(
      "[mail] SMTP non configuré — e-mail non envoyé :",
      opts.subject,
      "→",
      opts.to,
    );
    return false;
  }
  await mailer.sendMail({ from: MAIL_FROM, ...opts });
  return true;
}

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (n) => `${Number(n).toLocaleString("fr-FR").replace(/ /g, " ")} DA`;

function welcomeEmail(code, lang, email) {
  const ar = lang === "ar";
  const t = ar
    ? {
        sub: "هديتك من رملة: خصم 10٪ 🍵",
        hi: "مرحبًا بكِ في مجتمع رملة",
        p: "شكرًا لانضمامك إلينا. هذا رمزك للحصول على خصم 10٪ على طلبك الأول:",
        how: "أدخلي الرمز في صفحة الطلب.",
        cta: "تسوّقي الآن",
        dir: "rtl",
        why: "تصلك هذه الرسالة لأنكِ سجّلتِ في موقع رملة.",
        unsub: "إلغاء الاشتراك",
      }
    : {
        sub: "Your Ramla gift: 10% off 🍵",
        hi: "Welcome to the Ramla community",
        p: "Thank you for joining us. Here is your code for 10% off your first order:",
        how: "Enter it at checkout.",
        cta: "Shop now",
        dir: "ltr",
        why: "You are receiving this email because you signed up on the Ramla website.",
        unsub: "Unsubscribe",
      };
  const unsub = unsubUrl(email, lang);
  const html = `<!doctype html><html dir="${t.dir}"><body style="margin:0;background:#EFE9DD;font-family:Georgia,serif;color:#1B1B18">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#F8F4EC;border-radius:18px;overflow:hidden">
  <tr><td><img src="${SITE_URL}/img/hero.jpg" width="520" style="display:block;width:100%;height:260px;object-fit:cover" alt=""></td></tr>
  <tr><td style="padding:36px 36px 40px;text-align:center">
    <div style="font-size:28px;color:#1E4A2C">رملة</div>
    <div style="font-size:30px;font-weight:bold;letter-spacing:2px;margin-bottom:22px">MATCHA</div>
    <h1 style="font-size:22px;font-weight:normal;margin:0 0 12px">${t.hi}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#4a4a42">${t.p}</p>
    <div style="display:inline-block;border:1.5px dashed #1E4A2C;border-radius:12px;padding:16px 28px;font-family:'Courier New',monospace;font-size:24px;letter-spacing:3px;color:#1E4A2C;background:#fff">${esc(code)}</div>
    <p style="font-size:13px;color:#6b6b60;margin:18px 0 28px">${t.how}</p>
    <a href="${SITE_URL}/shop.html" style="display:inline-block;background:#1E4A2C;color:#F8F4EC;text-decoration:none;padding:14px 34px;border-radius:999px;font-size:14px;letter-spacing:1px">${t.cta}</a>
  </td></tr></table>
  <p style="font-size:12px;color:#8a8a7e;margin-top:18px">@${esc(shop.instagram)}</p>
  <p style="font-size:11px;line-height:1.6;color:#8a8a7e;margin:6px 0 0">${t.why}<br>
    <a href="${esc(unsub)}" style="color:#8a8a7e;text-decoration:underline">${t.unsub}</a></p>
  </td></tr></table></body></html>`;
  return {
    subject: t.sub,
    html,
    text: `${t.hi}\n\n${t.p}\n\n${code}\n\n${t.how}\n${SITE_URL}/shop.html\n\n--\n${t.why}\n${t.unsub}: ${unsub}`,
    // Bouton « Se désabonner » natif de Gmail / Yahoo / Apple Mail (désinscription en un clic)
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

function ownerOrderEmail(o) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.name)} × ${i.qty}</td><td align="right">${fmt(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;color:#1B1B18;max-width:560px">
  <h2 style="color:#1E4A2C">Nouvelle commande ${esc(o.id)}</h2>
  <p><b>${esc(o.customer.firstName)} ${esc(o.customer.lastName)}</b><br>
  📞 ${esc(o.customer.phone)}<br>${o.customer.email ? "✉️ " + esc(o.customer.email) + "<br>" : ""}
  📍 ${esc(o.customer.address)}, ${esc(o.customer.commune)} — ${esc(o.wilaya.code)} ${esc(o.wilaya.name)}<br>
  🚚 ${o.deliveryType === "home" ? "Livraison à domicile" : "Stop desk (bureau Yalidine)"}</p>
  ${o.customer.notes ? `<p><i>Note : ${esc(o.customer.notes)}</i></p>` : ""}
  <table width="100%" style="border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}</table>
  <p>Sous-total : ${fmt(o.subtotal)}<br>${o.discount ? `Remise (${esc(o.promoCode)}) : −${fmt(o.discount)}<br>` : ""}Livraison : ${fmt(o.deliveryFee)}<br>
  <b style="font-size:18px">Total à encaisser : ${fmt(o.total)}</b></p>
  <p><a href="${esc(o.whatsappLink)}" style="background:#25D366;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Confirmer sur WhatsApp</a></p>
  <p style="font-size:12px;color:#888">Toutes les commandes : ${SITE_URL}/admin</p></div>`;
  return { subject: `🍵 Nouvelle commande ${o.id} — ${fmt(o.total)}`, html };
}

/* ---------- helpers ---------- */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
function normalizePhone(raw) {
  let p = String(raw || "").replace(/[\s.\-()]/g, "");
  if (p.startsWith("+213")) p = "0" + p.slice(4);
  else if (p.startsWith("00213")) p = "0" + p.slice(5);
  else if (p.startsWith("213") && p.length === 12) p = "0" + p.slice(3);
  return /^0[5-7]\d{8}$/.test(p) ? p : null;
}
const waNumber = (localPhone) => "213" + localPhone.slice(1);
function deliveryFee(wilayaCode, type) {
  const o = shop.delivery.overrides?.[String(wilayaCode)];
  return o && o[type] != null ? o[type] : shop.delivery[type];
}
function newCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (const b of crypto.randomBytes(5)) s += alphabet[b % alphabet.length];
  return `RAMLA10-${s}`;
}
function findCode(code) {
  const c = String(code || "")
    .trim()
    .toUpperCase();
  if (!c) return null;
  for (const [email, s] of Object.entries(subscribers.get()))
    if (s.code === c) return { email, ...s };
  return null;
}

// limite simple : N requêtes / fenêtre par IP et par route
function rateLimit(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max)
      return res.status(429).json({ error: "too_many_requests" });
    arr.push(now);
    hits.set(key, arr);
    if (hits.size > 5000) hits.clear();
    next();
  };
}

/* ---------- app ---------- */
const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(express.json({ limit: "50kb" }));
// Redirection canonique : /page.html -> /page
app.use((req, res, next) => {
  if (req.path.endsWith(".html")) {
    const cleanPath = req.path.replace(/\.html$/, "") || "/";
    return res.redirect(
      301,
      cleanPath +
        (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""),
    );
  }
  next();
});
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.get("/api/shop", (req, res) => {
  res.json({
    currency: shop.currency,
    discountPercent: shop.discountPercent,
    instagram: shop.instagram,
    tiktok: shop.tiktok,
    delivery: shop.delivery,
    products: shop.products,
    wilayas: WILAYAS,
    legal: shop.legal || {},
  });
});

app.post("/api/subscribe", rateLimit(8, 10 * 60 * 1000), async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const lang = req.body.lang === "ar" ? "ar" : "en";
  if (!EMAIL_RE.test(email) || email.length > 254)
    return res.status(400).json({ error: "invalid_email" });

  const db = subscribers.get();
  let entry = db[email];
  if (!entry) {
    entry = db[email] = {
      code: newCode(),
      lang,
      createdAt: new Date().toISOString(),
      usedBy: null,
    };
    await subscribers.save();
  }
  if (entry.unsubscribedAt) {
    delete entry.unsubscribedAt;
    entry.lang = lang;
    await subscribers.save();
  } // réinscription
  if (entry.usedBy) return res.json({ ok: true, alreadyUsed: true });

  try {
    const sent = await sendMail({
      to: email,
      ...welcomeEmail(entry.code, lang, email),
    });
    // Sans SMTP configuré, on affiche le code à l'écran pour que le site reste utilisable.
    res.json({ ok: true, emailed: sent, code: sent ? undefined : entry.code });
  } catch (e) {
    console.error("[subscribe] envoi échoué", e.message);
    res.json({ ok: true, emailed: false, code: entry.code });
  }
});

app.post("/api/validate-code", rateLimit(30, 10 * 60 * 1000), (req, res) => {
  const found = findCode(req.body.code);
  if (!found) return res.json({ valid: false, reason: "unknown" });
  if (found.usedBy) return res.json({ valid: false, reason: "used" });
  res.json({ valid: true, percent: shop.discountPercent });
});

app.post("/api/orders", rateLimit(10, 10 * 60 * 1000), async (req, res) => {
  const b = req.body || {};
  const c = b.customer || {};
  const clean = (v, max) =>
    String(v ?? "")
      .trim()
      .slice(0, max);
  const customer = {
    firstName: clean(c.firstName, 60),
    lastName: clean(c.lastName, 60),
    phone: normalizePhone(c.phone),
    email: clean(c.email, 254).toLowerCase(),
    commune: clean(c.commune, 80),
    address: clean(c.address, 240),
    notes: clean(c.notes, 500),
  };
  const errors = [];
  if (!customer.firstName) errors.push("firstName");
  if (!customer.lastName) errors.push("lastName");
  if (!customer.phone) errors.push("phone");
  if (customer.email && !EMAIL_RE.test(customer.email)) errors.push("email");
  if (!customer.commune) errors.push("commune");
  if (!customer.address) errors.push("address");
  const wilaya = WILAYAS.find((w) => String(w.code) === String(b.wilaya));
  if (!wilaya) errors.push("wilaya");
  const deliveryType = b.deliveryType === "desk" ? "desk" : "home";

  // On recalcule tout côté serveur : les prix envoyés par le navigateur sont ignorés.
  const items = [];
  for (const it of Array.isArray(b.items) ? b.items.slice(0, 20) : []) {
    const p = productsById[it.id];
    const qty = Math.floor(Number(it.qty));
    if (!p || !(qty >= 1 && qty <= 50)) continue;
    items.push({
      id: p.id,
      name: p.name.en,
      qty,
      unitPrice: p.price,
      lineTotal: p.price * qty,
    });
  }
  if (!items.length) errors.push("items");
  if (b.acceptTerms !== true) errors.push("terms");
  if (errors.length)
    return res.status(400).json({ error: "validation", fields: errors });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  let discount = 0,
    promoCode = null;
  if (b.promoCode) {
    const found = findCode(b.promoCode);
    if (!found || found.usedBy)
      return res
        .status(400)
        .json({ error: "validation", fields: ["promoCode"] });
    discount = Math.round((subtotal * shop.discountPercent) / 100);
    promoCode = found.code;
  }
  const fee = deliveryFee(wilaya.code, deliveryType);
  const total = subtotal - discount + fee;

  const store = orders.get();
  store.seq += 1;
  const id = `RML-${String(store.seq).padStart(4, "0")}`;
  const lang = b.lang === "ar" ? "ar" : "en";
  const itemsText = items.map((i) => `${i.qty} × ${i.name}`).join(", ");
  const waMsg =
    lang === "ar"
      ? `السلام عليكم ${customer.firstName} 🌿\nهنا رملة ماتشا. شكرًا على طلبك ${id}:\n${itemsText}\nالمجموع: ${fmt(total)} (الدفع عند الاستلام)\nالعنوان: ${customer.address}، ${customer.commune}، ${wilaya.nameAr}\nهل تؤكدين الطلب؟`
      : `Salam ${customer.firstName} 🌿\nIt's Ramla Matcha. Thank you for your order ${id}:\n${itemsText}\nTotal: ${fmt(total)} (cash on delivery)\nAddress: ${customer.address}, ${customer.commune}, ${wilaya.name}\nCan you confirm your order?`;
  const order = {
    termsAcceptedAt: new Date().toISOString(),
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    lang,
    customer,
    wilaya: { code: wilaya.code, name: wilaya.name },
    deliveryType,
    items,
    subtotal,
    discount,
    promoCode,
    deliveryFee: fee,
    total,
    whatsappLink: `https://wa.me/${waNumber(customer.phone)}?text=${encodeURIComponent(waMsg)}`,
  };
  store.list.unshift(order);
  await orders.save();

  if (promoCode) {
    const subs = subscribers.get();
    const owner = Object.keys(subs).find((k) => subs[k].code === promoCode);
    if (owner) {
      subs[owner].usedBy = id;
      await subscribers.save();
    }
  }

  if (OWNER_EMAIL)
    sendMail({ to: OWNER_EMAIL, ...ownerOrderEmail(order) }).catch((e) =>
      console.error("[order] mail propriétaire", e.message),
    );
  console.log(
    `[order] ${id} — ${customer.firstName} ${customer.lastName} — ${fmt(total)}`,
  );
  res.json({ ok: true, id, total });
});

/* ---------- admin ---------- */

// Désinscription : depuis la page /unsubscribe.html (bouton) ou en un clic depuis Gmail (List-Unsubscribe-Post)
async function doUnsubscribe(req, res) {
  const email = checkUnsub(
    req.query.e || req.body?.e,
    req.query.t || req.body?.t,
  );
  if (!email) return res.status(400).json({ error: "invalid_link" });
  const entry = subscribers.get()[email];
  if (entry && !entry.unsubscribedAt) {
    entry.unsubscribedAt = new Date().toISOString();
    await subscribers.save();
    console.log("[newsletter] désinscription", email);
  }
  res.json({ ok: true });
}
app.post("/api/unsubscribe", rateLimit(20, 10 * 60 * 1000), doUnsubscribe);
app.post("/unsubscribe.html", rateLimit(20, 10 * 60 * 1000), doUnsubscribe);

function adminAuth(req, res, next) {
  if (!ADMIN_PASSWORD)
    return res
      .status(503)
      .send("Admin désactivé : définis ADMIN_PASSWORD dans .env");
  const [scheme, value] = (req.headers.authorization || "").split(" ");
  if (scheme === "Basic" && value) {
    const pass = Buffer.from(value, "base64")
      .toString()
      .split(":")
      .slice(1)
      .join(":");
    const a = Buffer.from(
      crypto.createHash("sha256").update(pass).digest("hex"),
    );
    const b = Buffer.from(
      crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex"),
    );
    if (crypto.timingSafeEqual(a, b)) return next();
  }
  res
    .set("WWW-Authenticate", 'Basic realm="Ramla admin", charset="UTF-8"')
    .status(401)
    .send("Authentification requise");
}
app.get(["/admin", "/admin/"], adminAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "admin", "index.html")),
);
app.get("/api/admin/orders", adminAuth, (req, res) => {
  res.json({
    orders: orders.get().list,
    subscribers: Object.keys(subscribers.get()).length,
  });
});
app.patch("/api/admin/orders/:id", adminAuth, async (req, res) => {
  const allowed = ["new", "confirmed", "shipped", "delivered", "cancelled"];
  const o = orders.get().list.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "not_found" });
  if (!allowed.includes(req.body.status))
    return res.status(400).json({ error: "bad_status" });
  o.status = req.body.status;
  o.updatedAt = new Date().toISOString();
  await orders.save();
  res.json({ ok: true });
});
app.get("/api/admin/subscribers.csv", adminAuth, (req, res) => {
  const rows = Object.entries(subscribers.get()).map(
    ([e, s]) =>
      `${e},${s.code},${s.lang},${s.createdAt},${s.usedBy || ""},${s.unsubscribedAt || ""}`,
  );
  res
    .type("text/csv")
    .attachment("abonnees-ramla.csv")
    .send(
      "email,code,langue,date,utilise_par,desinscrite_le\n" + rows.join("\n"),
    );
});

app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    maxAge: "1h",
  }),
);
app.use((req, res) =>
  res.status(404).sendFile(path.join(__dirname, "public", "index.html")),
);

app.listen(PORT, () => {
  console.log(`Ramla Matcha en ligne sur le port ${PORT}`);
  if (!SMTP_READY)
    console.log(
      "⚠ SMTP non configuré : les codes promo s'afficheront à l'écran au lieu d'être envoyés par e-mail.",
    );
  if (!OWNER_EMAIL)
    console.log(
      "⚠ OWNER_EMAIL vide : pas de notification e-mail des commandes (elles restent visibles sur /admin).",
    );
  if (!ADMIN_PASSWORD)
    console.log("⚠ ADMIN_PASSWORD vide : /admin est désactivé.");
});
