/* Ramla رملة Matcha — script commun à toutes les pages */
(function () {
  "use strict";
  const LS = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {
        /* stockage indisponible */
      }
    },
  };
  const R = (window.Ramla = {});

  /* ---------------- langue ---------------- */
  let lang =
    LS.get("ramla_lang", null) ||
    ((navigator.language || "").startsWith("ar") ? "ar" : "en");
  if (!window.I18N[lang]) lang = "en";
  R.lang = () => lang;
  R.t = (key) =>
    (window.I18N[lang] && window.I18N[lang][key]) ?? window.I18N.en[key] ?? key;
  R.applyLang = function (root = document) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.innerHTML = R.t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = R.t(el.dataset.i18nPh);
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", R.t(el.dataset.i18nAria));
    });
    document
      .querySelectorAll(".lang-toggle button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.lang === lang)),
      );
  };
  R.setLang = function (l) {
    if (l === lang || !window.I18N[l]) return;
    lang = l;
    LS.set("ramla_lang", l);
    R.applyLang();
    document.dispatchEvent(new CustomEvent("langchange"));
  };

  /* ---------------- format ---------------- */
  R.money = (n) =>
    `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} ${R.t("currency")}`;
  R.esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  /* ---------------- données boutique ---------------- */
  let shopPromise;
  R.shop = () =>
    (shopPromise ||= fetch("/api/shop").then((r) => {
      if (!r.ok) throw new Error("shop");
      return r.json();
    }));
  R.product = async (id) => (await R.shop()).products.find((p) => p.id === id);
  R.pname = (p) => p.name[lang] || p.name.en;

  // Les illustrations .svg sont insérées dans la page pour profiter des polices du site.
  const svgCache = {};
  R.visual = function (src, alt) {
    if (!src.endsWith(".svg"))
      return `<img src="${R.esc(src)}" alt="${R.esc(alt)}" loading="lazy" decoding="async">`;
    const id = "v" + Math.random().toString(36).slice(2);
    (svgCache[src] ||= fetch(src).then((r) => r.text())).then((txt) => {
      const el = document.getElementById(id);
      if (el)
        el.outerHTML = txt.replace(
          "<svg",
          `<svg aria-label="${R.esc(alt)}" preserveAspectRatio="xMidYMid slice"`,
        );
    });
    return `<span id="${id}" style="display:block;width:100%;height:100%"></span>`;
  };

  /* ---------------- panier ---------------- */
  R.cart = {
    items: () => LS.get("ramla_cart", []).filter((i) => i && i.id && i.qty > 0),
    save(items) {
      LS.set("ramla_cart", items);
      R.cart.renderCount(true);
      document.dispatchEvent(new CustomEvent("cartchange"));
    },
    add(id, qty = 1) {
      const items = R.cart.items();
      const found = items.find((i) => i.id === id);
      if (found) found.qty = Math.min(50, found.qty + qty);
      else items.push({ id, qty: Math.min(50, qty) });
      R.cart.save(items);
      R.toast();
    },
    set(id, qty) {
      let items = R.cart.items();
      if (qty <= 0) items = items.filter((i) => i.id !== id);
      else {
        const f = items.find((i) => i.id === id);
        if (f) f.qty = Math.min(50, qty);
      }
      R.cart.save(items);
    },
    clear() {
      LS.set("ramla_cart", []);
      R.cart.renderCount();
    },
    count: () => R.cart.items().reduce((s, i) => s + i.qty, 0),
    renderCount(bump) {
      const el = document.querySelector(".cart-count");
      if (!el) return;
      const n = R.cart.count();
      el.textContent = n;
      el.classList.toggle("show", n > 0);
      if (bump) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    },
  };

  let toastTimer;
  R.toast = function () {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>🍵 ${R.t("toast.added")}</span><a href="/cart">${R.t("toast.view")}</a>`;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  };

  /* ---------------- carte produit ---------------- */
  const TAGS = {
    "matcha-30g": "tag.bestseller",
    whisk: "tag.essential",
    tote: "tag.new",
    cap: "tag.new",
  };
  R.productCard = function (p) {
    const href = p.id === "matcha-30g" ? "/shop" : "/accessories#" + p.id;
    return `<article class="product-card reveal" id="card-${p.id}">
      <a class="visual" href="${href}">${R.visual(p.image, R.pname(p))}<span class="tag" data-i18n="${TAGS[p.id] || "tag.new"}">${R.t(TAGS[p.id] || "tag.new")}</span></a>
      <h3 data-pname="${p.id}">${R.esc(R.pname(p))}</h3>
      <p class="desc" data-i18n="p.${p.id}.desc">${R.t("p." + p.id + ".desc")}</p>
      <div class="row"><span class="price">${R.money(p.price)}</span>
      <button class="add-mini" data-add="${p.id}" data-i18n="btn.add">${R.t("btn.add")}</button></div>
    </article>`;
  };
  R.refreshProductNames = async function () {
    const shop = await R.shop();
    document.querySelectorAll("[data-pname]").forEach((el) => {
      const p = shop.products.find((x) => x.id === el.dataset.pname);
      if (p) el.textContent = R.pname(p);
    });
    document.querySelectorAll("[data-price]").forEach((el) => {
      const p = shop.products.find((x) => x.id === el.dataset.price);
      if (p) el.textContent = R.money(p.price);
    });
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    R.cart.add(btn.dataset.add, 1);
    btn.classList.add("done");
    btn.textContent = R.t("btn.added");
    setTimeout(() => {
      btn.classList.remove("done");
      btn.textContent = R.t("btn.add");
    }, 1600);
  });

  /* ---------------- header / footer ---------------- */
  const ICON = {
    bag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    tt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6Z"/></svg>',
  };
  R.icon = ICON;
  function renderChrome() {
    const page = document.body.dataset.page;
    const cur = (p) => (p === page ? ' aria-current="page"' : "");
    const header = document.getElementById("site-header");
    if (header) {
      header.outerHTML = `
      <div class="announce" data-i18n="announce"></div>
      <header class="site-header">
        <div class="wrap header-inner">
          <button class="menu-btn" aria-expanded="false" data-i18n-aria="nav.menu">${ICON.menu}</button>
          <nav class="nav" id="main-nav">
            <a href="/shop"${cur("shop")} data-i18n="nav.shop"></a>
            <a href="/story"${cur("story")} data-i18n="nav.story"></a>
            <a href="/accessories"${cur("accessories")} data-i18n="nav.accessories"></a>
          </nav>
          <a class="logo" href="/" aria-label="Ramla Matcha"><img class="logo-img logo-light" src="/img/logo.png" alt="Ramla رملة Matcha"><img class="logo-img logo-dark" src="/img/logo-darkmode.png" alt="Ramla رملة Matcha"></a>
          <div class="header-actions">
            <div class="lang-toggle" role="group" aria-label="Language">
              <button data-lang="en" aria-pressed="false">EN</button><button data-lang="ar" aria-pressed="false">ع</button>
            </div>
            <a class="cart-btn" href="/cart" data-i18n-aria="nav.cart">${ICON.bag}<span class="cart-count">0</span></a>
            <button class="theme-btn" type="button" data-i18n-aria="nav.theme"><svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg><svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
          </div>
        </div>
      </header>`;
    }
    const footer = document.getElementById("site-footer");
    if (footer) {
      const year = new Date().getFullYear();
      footer.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <a class="logo" href="/"><img class="logo-img" src="/img/logo-white.png" alt="Ramla رملة Matcha"></a>
              <h4 style="margin-top:22px" data-i18n="foot.follow"></h4>
              <div class="socials" data-socials></div>
            </div>
            <div>
              <h4 data-i18n="foot.shop"></h4>
              <ul>
                <li><a href="/shop" data-i18n="nav.shop"></a></li>
                <li><a href="/accessories" data-i18n="nav.accessories"></a></li>
                <li><a href="/story" data-i18n="nav.story"></a></li>
                <li><a href="/cart" data-i18n="nav.cart"></a></li>
              </ul>
            </div>
            <div>
              <h4 data-i18n="foot.info"></h4>
              <ul><li data-i18n="foot.delivery"></li><li data-i18n="foot.payment"></li><li><a href="/terms" data-i18n="foot.terms"></a></li></ul>
            </div>
          </div>
          <div class="footer-bottom"><span>© ${year} Ramla رملة Matcha. <span data-i18n="foot.rights"></span></span><span class="footer-legal"><a href="/legal" data-i18n="foot.legal"></a><a href="/terms" data-i18n="foot.terms"></a><a href="/legal#privacy" data-i18n="foot.privacy"></a></span></div>
        </div>
      </footer>`;
      R.shop()
        .then((s) => {
          const el = document.querySelector("[data-socials]");
          if (el)
            el.innerHTML =
              `<a href="https://instagram.com/${R.esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a>` +
              `<a href="https://tiktok.com/@${R.esc(s.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok">${ICON.tt}</a>`;
        })
        .catch(() => {});
    }

    document
      .querySelectorAll(".lang-toggle button")
      .forEach((b) =>
        b.addEventListener("click", () => R.setLang(b.dataset.lang)),
      );
    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.getElementById("main-nav");
    if (menuBtn && nav)
      menuBtn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
    const sh = document.querySelector(".site-header");
    const onScroll = () =>
      sh && sh.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- popup -10% ---------------- */
  function popup() {
    if (LS.get("ramla_popup_done", false)) return;
    if (["checkout", "thanks"].includes(document.body.dataset.page)) return;
    const m = document.createElement("div");
    m.className = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-labelledby", "pop-title");
    m.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-card">
        <button class="modal-close" data-i18n-aria="pop.close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="lang-toggle modal-lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="false">EN</button><button data-lang="ar" aria-pressed="false">ع</button></div>
        <div class="modal-media"><img src="/img/model-portrait.webp" alt=""></div>
        <div class="modal-body">
          <div class="pop-form">
            <span class="eyebrow">Ramla رملة</span>
            <div class="big"><span data-i18n="pop.big"></span> <span style="font-size:.4em" data-i18n="pop.off"></span></div>
            <h2 id="pop-title" data-i18n="pop.title"></h2>
            <p data-i18n="pop.text"></p>
            <form novalidate>
              <label class="sr-only" for="pop-email" data-i18n="pop.email"></label>
              <input id="pop-email" type="email" autocomplete="email" required data-i18n-ph="pop.email" dir="ltr">
              <p class="promo-msg bad" aria-live="polite"></p>
              <button class="btn block" type="submit" data-i18n="pop.cta"></button>
            </form>
            <p class="modal-fine muted" data-i18n="pop.fine"></p>
          </div>
          <div class="modal-success" hidden></div>
        </div>
      </div>`;
    document.body.appendChild(m);
    m.querySelectorAll(".modal-lang button").forEach((b) =>
      b.addEventListener("click", () => R.setLang(b.dataset.lang)),
    );
    R.applyLang(m);
    const close = () => {
      m.classList.remove("open");
      LS.set("ramla_popup_done", true);
      document.removeEventListener("keydown", onKey);
      setTimeout(() => m.remove(), 500);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    m.querySelector(".modal-close").addEventListener("click", close);
    m.querySelector(".modal-backdrop").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.addEventListener("langchange", () => R.applyLang(m));

    const form = m.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const msg = form.querySelector(".promo-msg");
      const btn = form.querySelector("button");
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        msg.textContent = R.t("pop.err");
        input.focus();
        return;
      }
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = R.t("pop.sending");
      try {
        const r = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang: R.lang() }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "err");
        LS.set("ramla_popup_done", true);
        const ok = m.querySelector(".modal-success");
        if (d.alreadyUsed)
          ok.innerHTML = `<h2>🌿</h2><p>${R.t("pop.used")}</p>`;
        else if (d.code) {
          ok.innerHTML = `<h2>${R.t("pop.codeTitle")}</h2><p>${R.t("pop.codeText")}</p><div class="code" dir="ltr">${R.esc(d.code)}</div>`;
          LS.set("ramla_code", d.code);
        } else
          ok.innerHTML = `<h2>${R.t("pop.okTitle")}</h2><p>${R.t("pop.okText")}</p>`;
        ok.innerHTML += `<button class="btn" style="margin-top:8px">${R.t("pop.shop")}</button>`;
        ok.querySelector(".btn").addEventListener("click", () => {
          close();
          if (document.body.dataset.page !== "shop") location.href = "/shop";
        });
        m.querySelector(".pop-form").hidden = true;
        ok.hidden = false;
      } catch {
        msg.textContent = R.t("pop.err");
        btn.disabled = false;
        btn.textContent = R.t("pop.cta");
      }
    });
    setTimeout(() => m.classList.add("open"), 1200);
  }

  /* ---------------- apparition au scroll ---------------- */
  R.observe = function () {
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document
      .querySelectorAll(".reveal:not(.in)")
      .forEach((el) => io.observe(el));
  };

  /* ---------------- mode sombre ---------------- */
  // Au départ : toujours le thème du système (téléphone / ordinateur).
  // Le bouton ☾ / ☀ change le thème pour la visite en cours seulement (sessionStorage).
  const darkQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  const systemTheme = () => (darkQuery && darkQuery.matches ? "dark" : "light");
  const SS = {
    get() {
      try {
        return sessionStorage.getItem("ramla_theme");
      } catch {
        return null;
      }
    },
    set(v) {
      try {
        v
          ? sessionStorage.setItem("ramla_theme", v)
          : sessionStorage.removeItem("ramla_theme");
      } catch {
        /* indisponible */
      }
    },
  };
  try {
    localStorage.removeItem("ramla_theme");
  } catch {
    /* ancien choix enregistré : on l'efface */
  }
  R.isDark = () =>
    (document.documentElement.dataset.theme || systemTheme()) === "dark";
  function applyTheme(t) {
    if (t === "dark" || t === "light")
      document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme; // suit le système
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => (m.content = R.isDark() ? "#12150F" : "#EFE9DD"));
  }
  applyTheme(SS.get());
  if (darkQuery && darkQuery.addEventListener)
    darkQuery.addEventListener("change", () => applyTheme(SS.get()));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-btn")) return;
    const next = R.isDark() ? "light" : "dark";
    const choice = next === systemTheme() ? null : next; // revenir au thème du système = plus de choix forcé
    SS.set(choice);
    applyTheme(choice);
  });

  /* ---------------- démarrage ---------------- */
  renderChrome();
  R.applyLang();
  R.cart.renderCount();
  document.addEventListener("langchange", R.refreshProductNames);
  window.addEventListener("storage", (e) => {
    if (e.key === "ramla_cart") R.cart.renderCount();
  });
  document.addEventListener("DOMContentLoaded", () => {
    R.observe();
    popup();
  });
  if (document.readyState !== "loading") {
    R.observe();
    popup();
  }
})();
