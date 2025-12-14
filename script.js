/* Helpers */
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* Year */
(() => { const y=$("#year"); if (y) y.textContent = new Date().getFullYear(); })();

/* ================================
   I18N
   ================================ */
const I18N = {
  cs: {
    "nav.about":"O mně","nav.projects":"Projekty","nav.cv":"Životopis",
    "hero.quote":"„Tvořím módu udržitelnou.“","hero.cta":"Podívat se na projekty",
    "about.title":"O mně",
    "about.body":"Jsem studentka ekotextilu a návrhářství oděvů. Fascinuje mě kreativní práce s materiálem, udržitelné řemeslo a cit pro detail. Můj přístup propojuje estetiku, funkci a ohleduplnost k přírodě.",
    "about.cv":"Stáhnout CV (PDF)",
    "projects.title":"Projekty",
    "footer.rights":"Všechna práva vyhrazena."
  },
  en: {
    "nav.about":"About","nav.projects":"Projects","nav.cv":"Resume",
    "hero.quote":"“I make fashion sustainable.”","hero.cta":"See my work",
    "about.title":"About",
    "about.body":"I am a student of eco-textiles and fashion design. I love creative work with materials, sustainable craftsmanship, and attention to detail. I connect aesthetics, function, and respect for nature.",
    "about.cv":"Download CV (PDF)",
    "projects.title":"Projects",
    "footer.rights":"All rights reserved."
  }
};

function getLangFromURL(){ const m=location.search.match(/[?&]lang=(cs|en)\b/i); return m?m[1].toLowerCase():null; }
function getLang(){ return getLangFromURL() || localStorage.getItem("vm_lang") || "cs"; }
function applyDict(lang){
  const dict=I18N[lang]||{};
  $$("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); if(k && dict[k]) el.textContent=dict[k]; });
}
function rewriteInternalLinks(lang){
  $$("a[href]").forEach(a=>{
    const href=a.getAttribute("href"); if(!href) return;
    const ext = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if(ext) return;
    const url=new URL(href, location.href); url.searchParams.set("lang", lang);
    a.setAttribute("href", url.pathname + url.search + url.hash);
  });
}
function setLang(lang){
  document.documentElement.lang=lang;
  localStorage.setItem("vm_lang", lang);
  const url=new URL(location.href);
  if(url.searchParams.get("lang")!==lang){ url.searchParams.set("lang", lang); history.replaceState({}, "", url.pathname + url.search + url.hash); }
  applyDict(lang); rewriteInternalLinks(lang);
  const badge=$("#langBadge"); if(badge) badge.textContent="EN / CZ";
}
(() => { setLang(getLang()); })();
(() => { const b=$("#langToggle"); if(!b) return; b.addEventListener("click",()=> setLang(getLang()==="cs"?"en":"cs")); })();

/* ================================
   Smooth scroll s offsetem + easing
   ================================ */
(function smoothAnchors(){
  const easeInOutCubic = t => t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const header = $('.site-header');
  const offset = () => (header ? header.getBoundingClientRect().height + 12 : 12);

  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();

      const start = window.scrollY;
      const end   = target.getBoundingClientRect().top + window.scrollY - offset();
      const dist  = end - start;
      const dur   = 700;
      let t0 = null;

      function step(ts){
        if(!t0) t0 = ts;
        const p = Math.min(1, (ts - t0)/dur);
        const y = start + dist * easeInOutCubic(p);
        window.scrollTo(0, y);
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      history.replaceState({}, '', id);
    });
  });
})();

/* ================================
   CTA „See my work“
   ================================ */
(() => {
  const btn = $("#seeWorkBtn"), target = $("#projects");
  if(!btn || !target) return;
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const link = document.createElement('a');
    link.href = '#projects';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();

/* ================================
   HERO scroll efekt: posun doprava + blur + zajíždění pod fotku
   ================================ */
/* ================================
   Background parallax blobs
   ================================ */
(function bgParallax(){
  const body = document.body;
  if (!body || !("requestAnimationFrame" in window)) return;

  let ticking = false;
  let lastY = -1;

  function update(){
    const y = window.scrollY || window.pageYOffset || 0;
    if (y === lastY) { ticking = false; return; }
    lastY = y;

    body.style.setProperty("--scroll-y-1", `${y * -0.18}px`);
    body.style.setProperty("--scroll-y-2", `${y * -0.10}px`);

    ticking = false;
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();
})();

/* ================================
   HERO scroll efekt: text + blur + parallax fotky
   ================================ */
(function heroScrollFX(){
  const wrap  = $(".hero__content");
  const photo = $(".hero__media");
  if (!wrap || !photo) return;

  const maxShift    = 140;  // px doprava pro text
  const maxBlur     = 10;   // px
  const fadeEdge    = 0.85; // kde začít víc tlumit opacity
  const photoShift  = 40;   // px nahoru
  const photoScaleK = 0.04; // max extra scale

  let ticking = false;

  function onScroll(){
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset || 0;
      const p = Math.max(0, Math.min(1, y / 420)); // 0–1 v prvních ~420 px

      const tx   = p * maxShift;
      const blur = p * maxBlur;
      const op   = p < fadeEdge ? 1 : 1 - (p - fadeEdge) / (1 - fadeEdge);

      wrap.style.setProperty("--hero-tx", `${tx}px`);
      wrap.style.setProperty("--hero-blur", `${blur}px`);
      wrap.style.setProperty("--hero-op", `${Math.max(0, Math.min(1, op))}`);

      const ty = -p * photoShift;
      const sc = 1 + p * photoScaleK;
      photo.style.setProperty("--hero-photo-ty", `${ty}px`);
      photo.style.setProperty("--hero-photo-scale", sc.toString());

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", onScroll, { passive:true });
  onScroll();
})();

/* ================================
   Project hero parallax (detail pages)
   ================================ */
(function projectHeroParallax(){
  const hero = $(".project-hero .hero-img");
  if (!hero) return;

  let ticking = false;

  function onScroll(){
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const vh   = window.innerHeight || document.documentElement.clientHeight || 0;

      const mid  = rect.top + rect.height / 2;
      const norm = Math.max(-1, Math.min(1, (mid - vh / 2) / (vh / 2))); // -1..1

      const ty = norm * -20;                 // jemný posun
      const sc = 1 + Math.abs(norm) * 0.04;  // drobný zoom

      hero.style.setProperty("--proj-hero-ty", `${ty}px`);
      hero.style.setProperty("--proj-hero-scale", sc.toString());

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", onScroll, { passive:true });
  onScroll();
})();

/* ================================
   Cards: jemný tilt/parallax obrázku
   ================================ */
(() => {
  const cards = $$(".card");
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

  cards.forEach(card=>{
    let raf = 0;
    const media = card.querySelector(".card__media img");

    card.addEventListener("pointermove", e=>{
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;

      const rx = clamp((0.5 - py) * 8,  -6,  6);
      const ry = clamp((px - 0.5) * 10, -8,  8);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (media) {
          media.style.transform = `translate(${(px-0.5)*6}px, ${(py-0.5)*6}px) scale(1.02)`;
        }
      });
    });

    const reset = ()=>{
      card.style.transform = "";
      if (media) media.style.transform = "";
    };

    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointerdown", reset);
  });
})();

/* ================================
   Optional: jednoduchý reveal pro H2/H3
   ================================ */
(() => {
  const els = ["#aboutTitle","#projectsTitle"].flatMap(s => $$(s));
  els.forEach(el => el.classList.add("will-reveal"));

  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  },{ threshold:0.12 });

  els.forEach(el => io.observe(el));
})();

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn-cv");
  if (!btn) return;

  const bubble = btn.querySelector(".bubble");
  if (!bubble) return;

  btn.addEventListener("mouseenter", (e) => {
    const rect = btn.getBoundingClientRect();
    bubble.style.left = `${e.clientX - rect.left}px`;
    bubble.style.top  = `${e.clientY - rect.top}px`;
    bubble.style.transform = "translate(-50%, -50%) scale(1)";
  });

  btn.addEventListener("mouseleave", () => {
    bubble.style.transform = "translate(-50%, -50%) scale(0)";
  });
});

