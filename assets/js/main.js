/* ═══════════════════════════════════════════════════════════
   NEUROBARD — main.js v1
   Dark editorial neuro theme
   Nav/Footer injection, hero slideshow, search, theme toggle
═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

const HERO_INTERVAL = 7500;
const HERO_TRANSITION = 2200;

/* ─── HERO IMAGE POOLS (picsum IDs) ─── */
const HERO_POOLS = {
  home:       [1,6,9,24,26],
  neurotech:  [3,10,12,16,28],
  clinical:   [35,42,50,57,60],
  ai:         [64,67,70,74,77],
  cognitive:  [82,84,87,91,96],
  genetics:   [97,99,100,101,102],
  industry:   [110,112,116,119,122],
  academy:    [128,130,133,135,138],
  blog:       [140,143,148,153,157],
  about:      [158,160,163,166,170],
  contact:    [172,174,177,180,184],
  legal:      [190,192,195,198,200],
};
const PHOTO_POOL_SM = [
  91,147,160,177,211,225,247,265,287,301,326,338,365,374,393,401,
  119,159,239,260,300,325,376,430,445,460,479,493,511,526,547,562,
  7,14,22,50,57,218,237,257,271,292,96,106,134,138,184,209,236,259,
];
let _smIdx = Math.floor(Date.now()/86400000) % PHOTO_POOL_SM.length;
function nextSmPhoto(){
  const id = PHOTO_POOL_SM[_smIdx % PHOTO_POOL_SM.length]; _smIdx++;
  return `https://picsum.photos/id/${id}/600/340`;
}

/* ─── NAV BUILD ─── */
function buildNav(){
  const _segs = location.pathname.replace(/\/$/,'').split('/').filter(Boolean);
  const idx = _segs.indexOf('neurobard');
  const depth = idx >= 0 ? _segs.length - idx - 1 : Math.max(0, _segs.length - 1);
  const r = depth > 0 ? '../'.repeat(depth) : '';

  const nav = document.createElement('nav');
  nav.id = 'nb-nav';
  nav.innerHTML = `
<a class="nav-logo" href="${r}index.html">
  <span class="logo-icon">🧠</span> NEUROBARD
</a>
<ul class="nav-menu" id="nav-menu">
  <li class="nav-item" data-menu="verticals">
    <button class="nav-link">Topics<svg viewBox="0 0 10 6" stroke-width="1.5"><polyline points="1,1 5,5 9,1"/></svg></button>
    <div class="nav-dropdown">
      <a href="${r}verticals/neurotech-bci.html">Neurotech & BCI</a>
      <a href="${r}verticals/clinical-neurology.html">Clinical Neurology</a>
      <a href="${r}verticals/ai-neural-networks.html">AI & Neural Networks</a>
      <a href="${r}verticals/cognitive-science.html">Cognitive Science</a>
      <a href="${r}verticals/neurogenetics.html">Neurogenetics</a>
      <a href="${r}verticals/industry-investment.html">Industry & Investment</a>
      <a href="${r}verticals/academy.html">Neurobard Academy</a>
    </div>
  </li>
  <li class="nav-item"><a class="nav-link" href="${r}blog/index.html">Blog</a></li>
  <li class="nav-item"><a class="nav-link" href="${r}about/index.html">About</a></li>
  <li class="nav-item"><a class="nav-link" href="${r}contact/index.html">Contact</a></li>
</ul>
<div style="display:flex;align-items:center;gap:.3rem;">
  <button id="theme-toggle" aria-label="Toggle theme">🌙</button>
  <button id="search-btn" aria-label="Search" onclick="toggleSearch()" style="width:32px;height:32px;background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .2s">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  </button>
  <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
  <a class="nav-cta" href="${r}contact/index.html">Subscribe</a>
</div>
<div id="mobile-menu">
  <button class="mobile-close" id="mob-close">&times;</button>
  <div class="mob-heading">Topics</div>
  <a href="${r}verticals/neurotech-bci.html">Neurotech & BCI</a>
  <a href="${r}verticals/clinical-neurology.html">Clinical Neurology</a>
  <a href="${r}verticals/ai-neural-networks.html">AI & Neural Networks</a>
  <a href="${r}verticals/cognitive-science.html">Cognitive Science</a>
  <a href="${r}verticals/neurogenetics.html">Neurogenetics</a>
  <a href="${r}verticals/industry-investment.html">Industry & Investment</a>
  <a href="${r}verticals/academy.html">Neurobard Academy</a>
  <div class="mob-heading">More</div>
  <a href="${r}blog/index.html">Blog</a>
  <a href="${r}about/index.html">About</a>
  <a href="${r}contact/index.html">Contact</a>
  <a href="${r}legal/privacy-policy.html">Privacy Policy</a>
  <a class="mob-cta" href="${r}contact/index.html">Subscribe</a>
</div>`;

  document.body.insertBefore(nav, document.body.firstChild);

  // Scroll shadow
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, {passive:true});

  // Dropdown hover
  const LEAVE_DELAY = 200;
  nav.querySelectorAll('.nav-item[data-menu]').forEach(item => {
    let t;
    item.addEventListener('mouseenter', () => { clearTimeout(t); nav.querySelectorAll('.nav-item').forEach(i=>i!==item&&i.classList.remove('is-open')); item.classList.add('is-open'); });
    item.addEventListener('mouseleave', () => { t = setTimeout(()=>item.classList.remove('is-open'), LEAVE_DELAY); });
  });

  // Mobile
  const mob = nav.querySelector('#mobile-menu');
  nav.querySelector('#hamburger').addEventListener('click', () => mob.classList.add('open'));
  nav.querySelector('#mob-close').addEventListener('click', () => mob.classList.remove('open'));
  document.addEventListener('click', e => { if(!nav.contains(e.target)) nav.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('is-open')); });
}

/* ─── FOOTER BUILD ─── */
function buildFooter(){
  const _segs = location.pathname.replace(/\/$/,'').split('/').filter(Boolean);
  const idx = _segs.indexOf('neurobard');
  const depth = idx >= 0 ? _segs.length - idx - 1 : Math.max(0, _segs.length - 1);
  const r = depth > 0 ? '../'.repeat(depth) : '';

  const footer = document.getElementById('nb-footer');
  if(!footer) return;
  footer.innerHTML = `
<div class="footer-inner">
  <div>
    <a href="${r}index.html" class="nav-logo" style="text-decoration:none;color:#fff;margin-bottom:.8rem;display:inline-flex">
      <span class="logo-icon">🧠</span> NEUROBARD
    </a>
    <p class="footer-desc">The authoritative voice at the intersection of neuroscience, neurotechnology, AI, and the future of the brain. From BCI breakthroughs to cognitive science, we tell the story of the brain revolution.</p>
    <div class="footer-social">
      <a href="https://linkedin.com/company/neurobard" aria-label="LinkedIn">in</a>
      <a href="https://twitter.com/neurobard" aria-label="X/Twitter">&#x1D54F;</a>
      <a href="https://reddit.com/r/neurobard" aria-label="Reddit">R</a>
    </div>
  </div>
  <div class="footer-col">
    <h4>Topics</h4>
    <ul>
      <li><a href="${r}verticals/neurotech-bci.html">Neurotech & BCI</a></li>
      <li><a href="${r}verticals/clinical-neurology.html">Clinical Neurology</a></li>
      <li><a href="${r}verticals/ai-neural-networks.html">AI & Neural Networks</a></li>
      <li><a href="${r}verticals/cognitive-science.html">Cognitive Science</a></li>
      <li><a href="${r}verticals/neurogenetics.html">Neurogenetics</a></li>
      <li><a href="${r}verticals/industry-investment.html">Industry & Investment</a></li>
      <li><a href="${r}verticals/academy.html">Neurobard Academy</a></li>
    </ul>
  </div>
  <div class="footer-col">
    <h4>Network</h4>
    <ul>
      <li><a href="https://neuroscient.com" target="_blank">NeuroScient.com</a></li>
      <li><a href="https://neurogenetiq.com" target="_blank">NeuroGenetIQ.com</a></li>
      <li><a href="https://neurogenaiq.com" target="_blank">NeuroGenAIQ.com</a></li>
      <li><a href="https://neuronetc.com" target="_blank">NeuroNetc.com</a></li>
      <li><a href="https://learnavia.com" target="_blank">Learnavia.com</a></li>
      <li><a href="https://inflectic.com" target="_blank">Inflectic.com</a></li>
    </ul>
  </div>
  <div class="footer-col">
    <h4>Company</h4>
    <ul>
      <li><a href="${r}blog/index.html">Blog</a></li>
      <li><a href="${r}about/index.html">About</a></li>
      <li><a href="${r}contact/index.html">Contact</a></li>
      <li><a href="${r}legal/privacy-policy.html">Privacy Policy</a></li>
      <li><a href="${r}legal/terms-of-use.html">Terms of Use</a></li>
      <li><a href="${r}legal/disclaimer.html">Disclaimer</a></li>
      <li><a href="${r}legal/cookie-policy.html">Cookie Policy</a></li>
    </ul>
  </div>
  <div class="footer-col">
    <h4>Newsletter</h4>
    <p style="color:rgba(255,255,255,.45);font-size:.8rem;margin-bottom:.8rem;">Weekly neuro intelligence. Free forever.</p>
    <form class="newsletter-form" onsubmit="nlSubmit(event)">
      <input type="email" placeholder="your@email.com" required>
      <button type="submit">Go</button>
    </form>
    <div class="nl-success">Welcome aboard!</div>
    <p style="color:rgba(255,255,255,.25);font-size:.65rem;margin-top:.6rem;">No spam. Unsubscribe anytime.</p>
  </div>
</div>
<div class="footer-bottom">
  <span>&copy; ${new Date().getFullYear()} Neurobard &mdash; A property of Isha Consulting LLC. All rights reserved.</span>
  <span>neurobard.com &bull; neuroscient.com &bull; neurogenetiq.com</span>
</div>`;
}

/* ─── NEWSLETTER SUBMIT ─── */
window.nlSubmit = function(e){
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input');
  const success = form.parentElement.querySelector('.nl-success') || form.nextElementSibling;
  if(input.value && input.value.includes('@')){
    if(success) success.style.display = 'block';
    input.value = '';
    setTimeout(() => { if(success) success.style.display = 'none'; }, 4000);
  }
};

/* ─── THEME TOGGLE ─── */
function initThemeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  const saved = localStorage.getItem('nb-theme');
  if(saved === 'light'){
    document.documentElement.setAttribute('data-theme','light');
    btn.textContent = '☀️';
  } else {
    btn.textContent = '🌙';
  }
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if(isLight){
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '🌙';
      localStorage.setItem('nb-theme','dark');
    } else {
      document.documentElement.setAttribute('data-theme','light');
      btn.textContent = '☀️';
      localStorage.setItem('nb-theme','light');
    }
    initCanvas();
  });
}

/* ─── CANVAS PARTICLES ─── */
function initCanvas(){
  const el = document.getElementById('nb-canvas');
  if(!el) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if(isLight){ el.style.display='none'; return; }
  el.style.display = 'block';
  const ctx = el.getContext('2d');
  let W, H, particles = [];
  function resize(){ W = el.width = window.innerWidth; H = el.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, {passive:true});
  particles = [];
  for(let i = 0; i < 50; i++){
    particles.push({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18, r:Math.random()*1.2+.3});
  }
  let raf;
  function draw(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=W; if(p.x>W) p.x=0;
      if(p.y<0) p.y=H; if(p.y>H) p.y=0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,212,170,.25)'; ctx.fill();
    });
    particles.forEach((a,i) => {
      for(let j=i+1;j<particles.length;j++){
        const b = particles[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if(d < 120){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = `rgba(0,212,170,${.06*(1-d/120)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    });
    raf = requestAnimationFrame(draw);
  }
  cancelAnimationFrame(raf); draw();
}

/* ─── HERO SLIDESHOW ─── */
function initHeroSlideshow(){
  const hero = document.querySelector('[data-hero-theme]');
  if(!hero) return;
  const theme = hero.getAttribute('data-hero-theme');
  const pool = HERO_POOLS[theme] || HERO_POOLS.home;

  const styleEl = document.createElement('style');
  styleEl.textContent = `.hero-slide{transition-duration:${HERO_TRANSITION}ms !important}`;
  document.head.appendChild(styleEl);

  const slidesEl = document.createElement('div');
  slidesEl.className = 'hero-slides';
  hero.insertBefore(slidesEl, hero.firstChild);

  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  hero.insertBefore(overlay, hero.children[1]);

  const slides = pool.map((id, i) => {
    const s = document.createElement('div');
    s.className = 'hero-slide' + (i===0?' active':'');
    slidesEl.appendChild(s);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { s.style.backgroundImage = `url('${img.src}')`; };
    img.src = `https://picsum.photos/id/${id}/1600/900`;
    return s;
  });

  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  pool.forEach((_,i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i===0?' active':'');
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });
  hero.appendChild(dots);

  let current = 0, timer;
  function goTo(idx){
    slides[current].classList.remove('active');
    dots.children[current].classList.remove('active');
    current = (idx+pool.length) % pool.length;
    slides[current].classList.add('active');
    dots.children[current].classList.add('active');
    resetTimer();
  }
  function resetTimer(){ clearInterval(timer); timer = setInterval(()=>goTo(current+1), HERO_INTERVAL); }
  resetTimer();
  hero.addEventListener('mouseenter', ()=>clearInterval(timer));
  hero.addEventListener('mouseleave', resetTimer);
}

/* ─── CONTENT PHOTOS ─── */
function injectContentPhotos(){
  document.querySelectorAll('.card-photo:not([style*="background"])').forEach(el => {
    el.style.backgroundImage = `url('${nextSmPhoto()}')`;
  });
}

/* ─── SCROLL PROGRESS ─── */
function initScrollProgress(){
  const bar = document.getElementById('scroll-progress');
  if(!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0';
  }, {passive:true});
}

/* ─── INTERSECTION OBSERVER (fade-up) ─── */
function initAnimations(){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, {threshold:0.1});
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ─── SEARCH ─── */
const SEARCH_INDEX = [
  {title:'Neurotech & BCI', url:'verticals/neurotech-bci.html', keywords:'neuralink synchron brain computer interface bci implant'},
  {title:'Clinical Neurology', url:'verticals/clinical-neurology.html', keywords:'neurosurgery parkinsons alzheimers epilepsy treatment'},
  {title:'AI & Neural Networks', url:'verticals/ai-neural-networks.html', keywords:'machine learning deep learning neural network computational neuroscience'},
  {title:'Cognitive Science', url:'verticals/cognitive-science.html', keywords:'brain games neuroplasticity memory cognition psychology'},
  {title:'Neurogenetics', url:'verticals/neurogenetics.html', keywords:'gene therapy crispr dna genomics precision medicine'},
  {title:'Industry & Investment', url:'verticals/industry-investment.html', keywords:'funding startup venture capital ipo market neurotech'},
  {title:'Neurobard Academy', url:'verticals/academy.html', keywords:'courses learn education certification training'},
  {title:'Blog', url:'blog/index.html', keywords:'articles posts news updates'},
  {title:'About Neurobard', url:'about/index.html', keywords:'team mission about us'},
  {title:'Contact', url:'contact/index.html', keywords:'email subscribe newsletter contact'},
  {title:'Privacy Policy', url:'legal/privacy-policy.html', keywords:'privacy data gdpr ccpa'},
];

window.toggleSearch = function(){
  const overlay = document.getElementById('nb-search-overlay');
  overlay.classList.toggle('open');
  if(overlay.classList.contains('open')){
    setTimeout(()=> document.getElementById('nb-search-input').focus(), 100);
  }
};
window.doSearch = function(q){
  const results = document.getElementById('nb-search-results');
  if(!q || q.length < 2){ results.innerHTML = ''; return; }
  const lq = q.toLowerCase();
  const _segs = location.pathname.replace(/\/$/,'').split('/').filter(Boolean);
  const idx = _segs.indexOf('neurobard');
  const depth = idx >= 0 ? _segs.length - idx - 1 : Math.max(0, _segs.length - 1);
  const r = depth > 0 ? '../'.repeat(depth) : '';
  const matches = SEARCH_INDEX.filter(item => item.title.toLowerCase().includes(lq) || item.keywords.includes(lq));
  results.innerHTML = matches.length
    ? matches.map(m => `<a href="${r}${m.url}">${m.title}</a>`).join('')
    : '<div style="padding:16px;color:var(--muted)">No results found</div>';
};
document.addEventListener('keydown', e => { if(e.key==='Escape') { const o = document.getElementById('nb-search-overlay'); if(o) o.classList.remove('open'); }});

/* ─── COOKIE CONSENT ─── */
function initCookieConsent(){
  const el = document.getElementById('cookie-consent');
  if(!el) return;
  if(localStorage.getItem('nb-cookies')) { el.classList.add('hidden'); return; }
}
window.dismissCookie = function(accept){
  localStorage.setItem('nb-cookies', accept ? 'accepted' : 'declined');
  const el = document.getElementById('cookie-consent');
  if(el) el.classList.add('hidden');
};

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildFooter();
  initThemeToggle();
  initCanvas();
  initHeroSlideshow();
  injectContentPhotos();
  initScrollProgress();
  initAnimations();
  initCookieConsent();
});

})();
