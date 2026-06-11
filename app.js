/* ШИПР — лёгкий интерактив без gimmicks
 * Только то, что несёт функцию:
 *  - бургер-меню
 *  - reveal-on-scroll (мягкий blur-fade)
 *  - tabs (типы стрижек)
 *  - phone mask + form validation
 */

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Burger */
  const header = $("#site-header");
  const burger = $("#burger");
  burger?.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach(a => a.addEventListener("click", () => {
    header?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
  }));

  /* Reveal-on-scroll — мягкий entry */
  const reveal = () => {
    document.querySelectorAll("section > .container, .display-h, .hero__copy, .hero__photo, .hero__strip, .tab__photo, .member, .price-list li").forEach(el => el.setAttribute("data-reveal", ""));
  };
  reveal();

  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Tabs */
  const tabs = $("#tabs");
  if (tabs) {
    const buttons = $$(".tabs__btn", tabs);
    const panels = $$(".tab", tabs);
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        buttons.forEach(b => b.classList.toggle("is-active", b === btn));
        panels.forEach(p => p.classList.toggle("is-active", p.dataset.tab === target));
      });
    });
  }

  /* Image fallback — заменяем сломанные картинки на редакционный плейсхолдер */
  $$("img[data-fallback]").forEach(img => {
    const showFallback = () => {
      if (img.dataset.fallbackShown) return;
      img.dataset.fallbackShown = "1";

      const raw = img.getAttribute("data-fallback") || "ШИПР";
      // если в data-fallback несколько частей через ·, берём как структуру
      const parts = raw.split("·").map(s => s.trim());
      const big = parts[0] || "ШИПР";
      const sub = parts.slice(1).join(" · ");

      // делим заголовок на «обычное слово» + опциональный italic-сериф (последнее слово)
      let bigHTML = big;
      if (big.includes(" ")) {
        const words = big.split(" ");
        const last = words.pop();
        bigHTML = words.join(" ") + " <em>" + last + "</em>";
      }

      const placeholder = document.createElement("div");
      placeholder.className = "img-placeholder";
      placeholder.innerHTML = `
        <div class="img-placeholder__top">архив · шипр</div>
        <div class="img-placeholder__big">${bigHTML}</div>
        <div class="img-placeholder__bottom">
          <span>02 / barber</span>
          <span>${sub || "москва · 2026"}</span>
        </div>
      `;
      img.replaceWith(placeholder);
    };

    img.addEventListener("error", showFallback);
    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      showFallback();
    }
  });

  /* Phone mask */
  const phoneInput = $("#f-phone");
  if (phoneInput) {
    const formatPhone = (raw) => {
      let digits = raw.replace(/\D/g, "");
      if (digits.startsWith("8")) digits = "7" + digits.slice(1);
      if (!digits.startsWith("7") && digits.length > 0) digits = "7" + digits;
      digits = digits.slice(0, 11);
      const p1 = digits.slice(1, 4);
      const p2 = digits.slice(4, 7);
      const p3 = digits.slice(7, 9);
      const p4 = digits.slice(9, 11);
      let out = "+7";
      if (p1) out += ` (${p1}`;
      if (p1.length === 3) out += ")";
      if (p2) out += ` ${p2}`;
      if (p3) out += `-${p3}`;
      if (p4) out += `-${p4}`;
      return out;
    };
    phoneInput.addEventListener("input", (e) => {
      e.target.value = formatPhone(e.target.value);
    });
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) phoneInput.value = "+7 ";
    });
  }

  /* Form */
  const form = $("#form");
  const success = $("#form-success");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const phoneDigits = phone.replace(/\D/g, "");
      let valid = true;

      if (name.length < 2) {
        $("#f-name").style.borderBottomColor = "var(--pop)";
        setTimeout(() => $("#f-name").style.borderBottomColor = "", 1800);
        valid = false;
      }
      if (phoneDigits.length !== 11) {
        $("#f-phone").style.borderBottomColor = "var(--pop)";
        setTimeout(() => $("#f-phone").style.borderBottomColor = "", 1800);
        valid = false;
      }
      if (!valid) return;

      const btn = form.querySelector("button[type=submit]");
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
      setTimeout(() => {
        form.querySelectorAll(".field, .form__note, button").forEach(el => el.style.display = "none");
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 600);
    });
  }
})();
