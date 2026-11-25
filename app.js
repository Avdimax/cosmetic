/* ================================================================
   app.js  —  (extract this whole block when splitting files)
   ================================================================ */

/* ---- 0. catalog data ---- */
const P=[
 {id:1, cat:'face', brand:'مای لیدر',   name:'کرم‌پودر مای فشن مای لیدر',      price:498000,  off:25, t:'pow', hue:'#E7CCC5'},
 {id:2, cat:'face', brand:'اوردینری',   name:'سرم نیاسینامید ۱۰٪ اوردینری',    price:890000,  off:15, t:'ser'},
 {id:3, cat:'face', brand:'رِولوشن',    name:'پالت سایه چشم ۱۸ رنگ رِولوشن',   price:598000,  off:20, t:'pal'},
 {id:4, cat:'face', brand:'فلورمار',    name:'ریمل حجم‌دهنده و رشد فلورمار',   price:449000,  off:10, t:'mas', hue:'#C51F45'},
 {id:5, cat:'lips', brand:'سیمور',      name:'رژ لب مات سوپر استی سیمور',      price:420000,  off:35, t:'lip', hue:'#C51F45'},
 {id:6, cat:'lips', brand:'مای لیدر',   name:'رژ لب مات لیپ مون‌سیکر مای لیدر', price:385000,  off:30, t:'lip', hue:'#E8728B'},
 {id:7, cat:'lips', brand:'لانکوم',     name:'رژ لب لابسولو روج لانکوم',       price:2850000, off:12, t:'lip', hue:'#92152F'},
 {id:8, cat:'lips', brand:'فنتا بیوتی', name:'لیپ گلاس گلاس بمب فنتا',         price:1150000, off:8,  t:'gls', hue:'#B9827D'},
 {id:9, cat:'hair', brand:'لورال',      name:'شامپو الزو تقویتی لورال',        price:320000,  off:5,  t:'shp', hue:'#E7CCC5'},
 {id:10,cat:'hair', brand:'لورال',      name:'ماسک مو کریستال لورال',          price:490000,  off:18, t:'msk'},
 {id:11,cat:'hair', brand:'ماروکانویل', name:'روغن درمان مو ماروکانویل',       price:2400000, off:10, t:'hoil'},
 {id:12,cat:'hair', brand:'فلر',        name:'اتو مو حرفه‌ای فلر',             price:3900000, off:22, t:'iron'},
 {id:13,cat:'nails',brand:'امیس',       name:'لاک ناخن مات امیس',             price:198000,  off:40, t:'lac', hue:'#C51F45'},
 {id:14,cat:'nails',brand:'لندا',       name:'لاک ژل لندا شماره ۱۰۴',          price:225000,  off:25, t:'lac', hue:'#A91B3D'},
 {id:15,cat:'nails',brand:'اسکارلت',    name:'تاپ کیت سوپر شاین اسکارلت',      price:260000,  off:15, t:'top'}
];
const BRANDS=[...new Set(P.map(p=>p.brand))];
const DEAL_IDS=[5,13,6,3,1,15,7];
const DEAL_IMAGES={
  5:'assets/deal-lipstick-cherry.png',
  13:'assets/deal-nail-polish.png',
  6:'assets/deal-lipstick-rose.png',
  3:'assets/deal-eyeshadow-palette.png',
  1:'assets/deal-foundation.png',
  15:'assets/deal-top-coat.png',
  7:'assets/deal-lipstick-deep-red.png'
};
const NEW_IDS=[2,8,12,14,7,4,15];
const NEW_IMAGES={
  2:'assets/new-serum.png',
  8:'assets/new-lip-gloss.png',
  12:'assets/new-hair-iron.png',
  14:'assets/new-nail-gel.png',
  7:'assets/new-lipstick.png',
  4:'assets/new-mascara.png',
  15:'assets/new-top-coat.png'
};
const MQ_BRANDS=['مای لیدر','لانکوم','اوردینری','مک','فلورمار','سیمور','لورال','رِولوشن','امیس','ماروکانویل','هدینگ بیوتی','لندا'];
const CATS={
 face:{num:'۰۱',n:'آرایش صورت',count:'۱۲۸ کالا',cap:'پوستی یکدست، شفاف و تمام‌عیار',pid:1},
 lips:{num:'۰۲',n:'آرایش لب',  count:'۲۱۴ کالا',cap:'رنگی که از صبح تا شب می‌ماند', pid:5},
 hair:{num:'۰۳',n:'آرایش مو',  count:'۹۶ کالا', cap:'از ریشه تا نوک؛ نرم و درخشان', pid:11},
 nails:{num:'۰۴',n:'آرایش ناخن',count:'۸۷ کالا',cap:'ناخن‌هایی که خودشان حرف می‌زنند',pid:13}
};
const KEYS=['face','lips','hair','nails'];

/* ---- 1. inline-SVG product library ---- */
const C={ink:'#302226',rose:'#C51F45',roseD:'#92152F',gold:'#B9827D',paper:'#FAF7F2',blush:'#E7CCC5',sand:'#F3EBE7',amber:'#B9827D'};
const BACK={face:'#E7CCC5',lips:'#F3EBE7',hair:'#F3EBE7',nails:'#E7CCC5'};
const G={
lip:h=>`<rect x="-22" y="-58" width="44" height="58" rx="7" fill="${C.gold}"/><rect x="-22" y="-67" width="44" height="10" rx="3" fill="${C.ink}"/><path d="M-15 -67 L-15 -107 Q-15 -113 -8 -112 L11 -93 L11 -67 Z" fill="${h||C.rose}"/><rect x="-9" y="-104" width="4.5" height="34" rx="2.2" fill="#fff" opacity=".32"/><rect x="-17" y="-52" width="34" height="5" rx="2.5" fill="#fff" opacity=".22"/>`,
gls:h=>`<rect x="-13" y="-102" width="26" height="27" rx="9" fill="${C.ink}"/><rect x="-5" y="-77" width="10" height="8" fill="${C.ink}"/><rect x="-19" y="-71" width="38" height="71" rx="17" fill="${h||'#B9827D'}"/><rect x="-10" y="-61" width="20" height="55" rx="9" fill="#fff" opacity=".35"/>`,
pow:h=>`<rect x="-8" y="-108" width="16" height="9" rx="4.5" fill="${C.gold}"/><circle cx="0" cy="-53" r="53" fill="${C.ink}"/><circle cx="0" cy="-53" r="45" fill="${h||C.blush}"/><path d="M-31 -63 a40 40 0 0 1 33 -17" stroke="${C.rose}" stroke-width="6" opacity=".5" fill="none" stroke-linecap="round"/><path d="M-6 -31 a40 40 0 0 0 35 -15" stroke="${C.gold}" stroke-width="5" opacity=".45" fill="none" stroke-linecap="round"/>`,
ser:()=>`<rect x="-10" y="-114" width="20" height="17" rx="8.5" fill="${C.ink}"/><rect x="-13" y="-99" width="26" height="9" rx="3" fill="${C.gold}"/><rect x="-24" y="-90" width="48" height="90" rx="11" fill="${C.amber}"/><rect x="-2.5" y="-86" width="5" height="82" fill="#fff" opacity=".3"/><rect x="-17" y="-55" width="34" height="41" rx="5" fill="${C.paper}"/><rect x="-11" y="-46" width="22" height="5" rx="2.5" fill="${C.rose}"/><rect x="-11" y="-36" width="22" height="3" rx="1.5" fill="${C.ink}" opacity=".45"/><rect x="-11" y="-30" width="14" height="3" rx="1.5" fill="${C.ink}" opacity=".45"/>`,
pal:()=>{const cs=[C.rose,C.gold,C.blush,C.roseD,C.sand,'#B04A68','#D9B36A','#8A5A44','#EFB9C8',C.ink];let d='';cs.forEach((f,i)=>{d+=`<circle cx="${-56+(i%5)*28}" cy="${i<5?-62:-22}" r="10.5" fill="${f}"/>`});return `<rect x="-76" y="-94" width="152" height="94" rx="13" fill="${C.ink}"/><rect x="-68" y="-86" width="136" height="78" rx="9" fill="${C.blush}"/>${d}`},
mas:h=>`<rect x="-38" y="-116" width="30" height="116" rx="14" fill="${C.ink}"/><rect x="-32" y="-62" width="18" height="6" rx="3" fill="${h||C.rose}"/><rect x="14" y="-116" width="22" height="34" rx="9" fill="${C.ink}"/><rect x="18" y="-86" width="14" height="56" rx="6" fill="${C.ink}"/><rect x="21" y="-34" width="8" height="8" rx="2" fill="${h||C.rose}"/>`,
shp:h=>`<rect x="-44" y="-117" width="36" height="12" rx="6" fill="${C.ink}"/><rect x="-12" y="-117" width="24" height="24" rx="7" fill="${C.ink}"/><rect x="-33" y="-93" width="66" height="93" rx="13" fill="${h||C.blush}"/><rect x="-25" y="-58" width="50" height="56" rx="7" fill="${C.paper}"/><rect x="-17" y="-47" width="34" height="6" rx="3" fill="${C.rose}"/><rect x="-17" y="-35" width="24" height="4" rx="2" fill="${C.ink}" opacity=".4"/>`,
msk:()=>`<rect x="-52" y="-95" width="104" height="21" rx="10.5" fill="${C.ink}"/><rect x="-50" y="-74" width="100" height="74" rx="14" fill="${C.paper}"/><rect x="-38" y="-55" width="76" height="26" rx="7" fill="${C.rose}" opacity=".92"/><rect x="-29" y="-47" width="58" height="5" rx="2.5" fill="${C.paper}" opacity=".8"/>`,
hoil:()=>`<rect x="-8" y="-106" width="16" height="13" rx="6.5" fill="${C.ink}"/><rect x="-11" y="-95" width="22" height="8" rx="3" fill="${C.gold}"/><rect x="-20" y="-87" width="40" height="87" rx="9" fill="${C.amber}" opacity=".88"/><rect x="-13" y="-54" width="26" height="32" rx="5" fill="${C.paper}"/><rect x="-8" y="-46" width="16" height="4" rx="2" fill="${C.rose}"/>`,
iron:()=>`<rect x="-11" y="-122" width="22" height="56" rx="10" fill="${C.ink}"/><g transform="rotate(-12)"><rect x="-40" y="-70" width="80" height="22" rx="10" fill="${C.ink}"/><rect x="-33" y="-63" width="66" height="7" rx="3.5" fill="${C.rose}"/></g><g transform="rotate(12)"><rect x="-40" y="-44" width="80" height="22" rx="10" fill="${C.ink}"/><rect x="-33" y="-49" width="66" height="7" rx="3.5" fill="${C.rose}"/></g>`,
lac:h=>`<rect x="-13" y="-114" width="26" height="50" rx="8" fill="${C.ink}"/><rect x="-8" y="-108" width="3" height="38" rx="1.5" fill="#fff" opacity=".3"/><rect x="-3" y="-108" width="3" height="38" rx="1.5" fill="#fff" opacity=".3"/><rect x="-11" y="-66" width="22" height="9" fill="${C.ink}"/><rect x="-27" y="-58" width="54" height="58" rx="10" fill="${h||C.rose}"/><rect x="-21" y="-50" width="9" height="44" rx="4.5" fill="#fff" opacity=".3"/>`,
top:()=>`<rect x="-13" y="-114" width="26" height="50" rx="8" fill="${C.gold}"/><rect x="-11" y="-66" width="22" height="9" fill="${C.gold}"/><rect x="-27" y="-58" width="54" height="58" rx="10" fill="#EAD9C0"/><rect x="-21" y="-50" width="9" height="44" rx="4.5" fill="#fff" opacity=".45"/>`
};
function scene(w,h,back,spec,o){
  o=o||{};
  const cx=w/2, fl=o.floor||Math.round(h*.8);
  let items='';
  spec.forEach(it=>{
    const x=Math.round(it.x!==undefined?it.x:cx+(it.dx||0));
    const y=it.y!==undefined?it.y:fl;
    items+=`<g transform="translate(${x} ${y}) rotate(${it.r||0}) scale(${it.s||1})">${G[it.t](it.hue)}</g>`;
  });
  const ring=o.ring?`<path d="M34 ${h-2} L34 ${Math.round(h*.46)} A ${Math.round(cx-34)} ${Math.round(cx-34)} 0 0 1 ${w-34} ${Math.round(h*.46)} L${w-34} ${h-2}" fill="none" stroke="${C.rose}" opacity=".15" stroke-width="2"/>`:'';
  const dia=(x,y)=>`<g transform="translate(${x} ${y}) rotate(45)"><rect x="-3" y="-3" width="6" height="6" fill="${C.rose}" opacity=".45"/></g>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><rect width="${w}" height="${h}" fill="${back}"/><circle cx="${Math.round(w*.16)}" cy="${Math.round(h*.2)}" r="${Math.round(w*.13)}" fill="${C.rose}" opacity=".07"/><circle cx="${Math.round(w*.84)}" cy="${Math.round(h*.64)}" r="${Math.round(w*.19)}" fill="${C.ink}" opacity=".05"/>${ring}<ellipse cx="${cx}" cy="${fl+6}" rx="${Math.round(w*.3)}" ry="8" fill="${C.ink}" opacity=".12"/>${items}${dia(cx-24,fl+24)}${dia(cx,fl+24)}${dia(cx+24,fl+24)}</svg>`;
}
const prodScene=(p,w,h,s)=>scene(w,h,BACK[p.cat],[{t:p.t,hue:p.hue,s:s||1.55}],{floor:Math.round(h*.8)});
const cluster=(sp,w,h,back,ring)=>scene(w,h,back||C.blush,sp,{floor:Math.round(h*.78),ring:!!ring});

/* ---- 2. helpers ---- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fa=n=>Number(n).toLocaleString('fa-IR');
const faD=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const oldP=p=>Math.round(p.price*100/(100-p.off));
const I={
 heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20.5S3.5 15.5 3.5 9.4A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.5 2.7c0 6.1-8.5 11.1-8.5 11.1z"/></svg>',
 bagSm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5.5 8h13l-1.1 12.5H6.6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;$('#toasts').appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),320)},2700);}
function bump(sel){const b=$(sel);b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}

/* ---- 3. hero carousel ---- */
const PANELS=['face','lips','hair','nails','nails'];
const HERO_PROMOS={
 cherry:'assets/hero-lipgloss-cherry.png',
 cyan:'assets/hero-lipgloss-cyan.png',
 roseGold:'assets/hero-lipgloss-rose-gold.png',
 nailsCherry:'assets/hero-nails-cherry.png',
 nailsCyan:'assets/hero-nails-cyan.png'
};
const HSCENES=[
 HERO_PROMOS.cherry,
 HERO_PROMOS.cyan,
 HERO_PROMOS.roseGold,
 HERO_PROMOS.nailsCherry,
 HERO_PROMOS.nailsCyan
].map(src=>`<img class="hero-promo" src="${src}" alt="">`);
function initHeroCarousel() {
  const hero = $('#hero');
  const stage = hero.querySelector('.trip');
  const tabs = $$('#heroCats .hcat');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const featuredProducts = [1, 5, 11, 13, 14];
  const slides = HSCENES.map((artwork, index) => {
    const slide = document.createElement('button');
    const product = P.find(item => item.id === featuredProducts[index]);
    slide.type = 'button';
    slide.className = 'tslot hero-slide';
    slide.setAttribute('aria-label', product.name);
    slide.innerHTML = artwork + '<span class="slide-label"></span>';
    slide.querySelector('.slide-label').textContent = CATS[PANELS[index]].n;
    slide.addEventListener('click', () => select(index));
    stage.append(slide);
    return slide;
  });

  const count = slides.length;
  const wrap = value => ((value % count) + count) % count;
  const distance = (to, from) => wrap(to - from + count / 2) - count / 2;
  const mix = (from, to, t) => from + (to - from) * t;
  let seats, position = 0, destination = 0, frame = 0, progress, drag;
  let hovering = false, suppressClick = false;

  function measure() {
    seats = Array.from(stage.querySelectorAll('[data-seat]'), seat => {
      const css = getComputedStyle(seat);
      return {
        x: seat.offsetLeft + seat.offsetWidth / 2,
        y: seat.offsetTop + seat.offsetHeight / 2 + (parseFloat(css.getPropertyValue('--ty')) || 0),
        width: seat.offsetWidth, height: seat.offsetHeight,
        tilt: parseFloat(css.getPropertyValue('--ry')) || 0
      };
    });
    paint(position);
  }

  function paint(value) {
    position = value;
    const center = seats[1];
    slides.forEach((slide, index) => {
      const offset = distance(index, value);
      const depth = Math.abs(offset);
      slide.hidden = depth >= 2;
      if (slide.hidden) return;
      const side = seats[offset > 0 ? 2 : 0];
      const t = Math.min(depth, 1);
      // The incoming fourth arch emerges from behind its neighbor.
      const entrance = Math.max(0, depth - 1);
      const width = mix(center.width, side.width, t);
      const height = mix(center.height, side.height, t);
      const x = mix(center.x, side.x, t) - (side.x - center.x) * entrance * .32;
      const y = mix(center.y, side.y, t) + entrance * 12;
      slide.style.width = width + 'px';
      slide.style.height = height + 'px';
      slide.style.transform = `translate3d(${x - width / 2}px,${y - height / 2}px,0) rotateY(${side.tilt * t}deg)`;
      slide.style.zIndex = depth < .5 ? 3 : depth <= 1 ? 2 : 1;
      slide.style.opacity = 1 - entrance;
      slide.style.boxShadow = `0 40px 80px -30px rgba(0,0,0,${.65 * (1 - t)})`;
      slide.lastElementChild.style.opacity = t;
      slide.tabIndex = depth === 1 ? 0 : -1;
    });
  }

  function syncAutoplay() {
    if (!progress) return;
    const pause = reducedMotion.matches || hovering || document.hidden ||
      hero.contains(document.activeElement) || drag || frame;
    if (pause) progress.pause();
    else progress.play();
  }

  function settle() {
    frame = 0;
    const index = wrap(destination);
    destination = index;
    paint(index);
    const key = PANELS[index];
    const category = CATS[key];
    const product = P.find(item => item.id === featuredProducts[index]);
    $('#hIdx').textContent = category.num;
    $('#hName').textContent = category.n;
    $('#hCount').textContent = category.count;
    $('#heroCap').textContent = $('#hCap2').textContent = '«' + category.cap + '»';
    $('#hCta').dataset.catgo = key;
    $('#tImg').innerHTML = prodScene(product, 120, 144, .6);
    $('#tBrand').textContent = product.brand;
    $('#tName').textContent = product.name;
    $('#tPrice').textContent = fa(product.price);
    $('#tOld').textContent = fa(oldP(product));
    $('#tAdd').dataset.add = product.id;
    tabs.forEach((tab, i) => {
      const active = KEYS[i] === key;
      tab.classList.toggle('on', active);
      tab.setAttribute('aria-pressed', String(active));
    });

    progress?.cancel();
    progress = null;
    if (!reducedMotion.matches) {
      const bar = tabs[KEYS.indexOf(key)].querySelector('.bar');
      progress = bar.animate([{transform:'scaleX(0)'}, {transform:'scaleX(1)'}], 4200);
      progress.onfinish = () => select(index + 1);
      syncAutoplay();
    }
  }

  function select(index) {
    cancelAnimationFrame(frame);
    progress?.cancel();
    progress = null;
    const start = position;
    const delta = distance(index, start);
    destination = Math.round(start + delta);
    if (reducedMotion.matches || Math.abs(delta) < .001) return settle();
    const began = performance.now();
    const duration = Math.min(700, 450 * Math.sqrt(Math.abs(delta)));
    function tick(now) {
      const t = Math.min(1, (now - began) / duration);
      if (t === 1) return settle();
      paint(start + delta * (1 - (1 - t) ** 3));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(PANELS.indexOf(KEYS[i]))));
  hero.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey ||
        event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (stage.contains(event.target)) stage.focus({preventScroll:true});
    const nextIsLeft = seats[2].x < seats[1].x;
    select(destination + ((event.key === 'ArrowLeft') === nextIsLeft ? 1 : -1));
  });

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY, active:false};
    syncAutoplay();
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        syncAutoplay();
        return;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      drag.active = true;
      drag.origin = position;
      drag.returnTo = Math.round(position);
      stage.setPointerCapture(event.pointerId);
      suppressClick = true;
    }
    const spacing = seats[1].x - seats[2].x;
    drag.travel = Math.max(-1, Math.min(1, dx / spacing));
    if (!reducedMotion.matches) paint(drag.origin + drag.travel);
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const gesture = drag;
    drag = null;
    if (gesture.active) {
      const advance = event.type === 'pointerup' && Math.abs(gesture.travel) >= .22;
      select(gesture.returnTo + (advance ? Math.sign(gesture.travel) : 0));
    } else syncAutoplay();
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);
  stage.addEventListener('click', event => {
    if (suppressClick && event.detail) {
      event.stopImmediatePropagation();
      event.preventDefault();
      suppressClick = false;
    }
  }, true);

  hero.addEventListener('pointerenter', event => {
    hovering = event.pointerType === 'mouse';
    syncAutoplay();
  });
  hero.addEventListener('pointerleave', () => { hovering = false; syncAutoplay(); });
  hero.addEventListener('focusin', syncAutoplay);
  hero.addEventListener('focusout', () => queueMicrotask(syncAutoplay));
  document.addEventListener('visibilitychange', syncAutoplay);
  reducedMotion.addEventListener('change', () => select(destination));
  measure();
  new ResizeObserver(measure).observe(stage);
  settle();
}
initHeroCarousel();

/* ---- 4. dark carousels + countdown ---- */
const favSet=new Set();
const mcard=(p,badge,i)=>`
<article class="mcard" style="animation-delay:${(i||0)*70}ms">
  <div class="mmedia${badge==='off'?' deal-media':' new-media'}">${badge==='off'||badge==='new'?`<img class="deal-art" src="${badge==='off'?DEAL_IMAGES[p.id]:NEW_IMAGES[p.id]}" alt="${p.brand} ${p.name}" loading="lazy">`:prodScene(p,340,400,1.7)}
    ${badge==='new'?'<span class="mnew">تازه</span>':`<span class="moff">${fa(p.off)}٪</span>`}
    <button class="mfav${favSet.has(p.id)?' on':''}" data-fav="${p.id}" aria-label="علاقه‌مندی">${I.heart}</button>
    <button class="madd" data-add="${p.id}" aria-label="افزودن به سبد">${I.bagSm}</button>
  </div>
  <div class="minfo">
    <span class="mbrand">${p.brand}</span>
    <h3 class="mname">${p.name}</h3>
    <div class="mprice"><b>${fa(p.price)}<i>تومان</i></b>${badge!=='new'?`<del>${fa(oldP(p))}</del>`:''}</div>
  </div>
</article>`;
 $('#dealRow').insertAdjacentHTML('beforeend',DEAL_IDS.map((id,i)=>mcard(P.find(p=>p.id===id),'off',i)).join(''));
 $('#newRow').innerHTML=NEW_IDS.map((id,i)=>mcard(P.find(p=>p.id===id),'new',i)).join('');
const khanoumiProducts=window.KHANoumiProducts||[];
$('#khanoumiRow').innerHTML=khanoumiProducts.map((p,i)=>`
  <article class="kcard" style="animation-delay:${Math.min(i,8)*45}ms">
    <a class="kphoto" href="${p.source}" target="_blank" rel="noopener noreferrer" aria-label="دیدن ${p.name} در خانومی">
      <img src="${p.image}" alt="${p.brand} ${p.name}" loading="lazy">
    </a>
    <div class="kinfo">
      <span class="kbrand">${p.brand}</span>
      <a class="kname" href="${p.source}" target="_blank" rel="noopener noreferrer">${p.name}</a>
      <b class="kprice">${fa(Number(String(p.priceToman).replace(/,/g,'')))} <small>تومان</small></b>
      <a class="ksource" href="${p.source}" target="_blank" rel="noopener noreferrer">مشاهده محصول ↗</a>
    </div>
  </article>`).join('');
$$('[data-snav]').forEach(b=>b.addEventListener('click',()=>{
  $(b.dataset.t).scrollBy({left:(+b.dataset.s)*(+b.dataset.px||380),behavior:'smooth'});
}));
const cdEnd=Date.now()+(9*3600+41*60+23)*1000;
function tick(){
  const d=Math.max(0,cdEnd-Date.now());
  $('#cdH').textContent=faD(String(Math.floor(d/3.6e6)).padStart(2,'0'));
  $('#cdM').textContent=faD(String(Math.floor(d%3.6e6/6e4)).padStart(2,'0'));
  $('#cdS').textContent=faD(String(Math.floor(d%6e4/1e3)).padStart(2,'0'));
}
tick();setInterval(tick,1000);

/* ---- 5. category chips ---- */
const CHIPS=[
 {k:'face',n:'آرایش صورت',c:'۱۲۸ کالا',sp:[{t:'pow',hue:'#E7CCC5',dx:-52,s:.95,r:-5},{t:'ser',dx:52,s:.95,r:5}]},
 {k:'lips',n:'آرایش لب',c:'۲۱۴ کالا',sp:[{t:'lip',hue:'#C51F45',dx:-52,s:1,r:-5},{t:'gls',hue:'#B9827D',dx:52,s:1,r:5}]},
 {k:'hair',n:'آرایش مو',c:'۹۶ کالا',sp:[{t:'shp',hue:'#E7CCC5',dx:-52,s:.95,r:-5},{t:'hoil',dx:52,s:1,r:5}]},
 {k:'nails',n:'آرایش ناخن',c:'۸۷ کالا',sp:[{t:'lac',hue:'#C51F45',dx:-52,s:1,r:-5},{t:'top',dx:52,s:1,r:5}]}
];
 $('#catrow').innerHTML=
  CHIPS.map(ch=>`<a class="catchip" href="#" data-catgo="${ch.k}"><span class="cimg">${cluster(ch.sp,300,355,BACK[ch.k],true)}</span><b>${ch.n}</b><small>${ch.c}</small></a>`).join('')+
  `<a class="catchip all" href="#" data-catgo="all"><span class="cimg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span><b>همه محصولات</b><small>۵۲۵+ کالا</small></a>`;

/* ---- 6. lines & banners ---- */
const LINES=[
 {brand:'مای لیدر',title:'ستِ مای فشن',desc:'از پرایمر تا پودر؛ خطِ کاملِ صورت با پوششِ طبیعی و ماندگاریِ روزانه.',count:'۱۲ کالا',badge:'برندِ هفته',bg:'',sp:[{t:'pow',hue:'#E7CCC5',dx:-62,s:1.1,r:-6},{t:'lip',hue:'#C51F45',dx:40,s:1.15,r:6},{t:'mas',hue:'#C51F45',dx:104,s:1,r:0}]},
 {brand:'سیمور',title:'کالکشنِ سوپر استی',desc:'هجده تنِ ماتِ ابریشمی که از صبح تا شب روی لب می‌مانند.',count:'۱۸ کالا',badge:'تا ۳۵٪',bg:'rosebg',sp:[{t:'lip',hue:'#92152F',dx:-62,s:1.1,r:-6},{t:'lip',hue:'#C51F45',dx:0,s:1.2,r:0},{t:'lip',hue:'#E8728B',dx:62,s:1.1,r:6}]},
 {brand:'اوردینری',title:'آزمایشگاهِ پوست',desc:'سرم‌های درمانی با غلظتِ دقیقِ فعال و فرمولِ مینیمال.',count:'۹ کالا',badge:'',bg:'',sp:[{t:'ser',dx:-55,s:1.05,r:-5},{t:'ser',dx:55,s:1.05,r:5}]},
 {brand:'لورال',title:'مراقبتِ الزو',desc:'شامپو، ماسک و روغنِ تقویتیِ ویژه‌ی موهای رنگ‌شده.',count:'۱۴ کالا',badge:'',bg:'',sp:[{t:'shp',hue:'#E7CCC5',dx:-62,s:1.05,r:-5},{t:'msk',dx:40,s:.95,r:4},{t:'hoil',dx:100,s:1,r:0}]},
 {brand:'لندا',title:'دنیایِ ژل',desc:'لاک‌های ژلِ ماندگار به‌همراهِ پایه و تاپ‌کیتِ مخصوص.',count:'۲۲ کالا',badge:'تازه رسید',bg:'rosebg',sp:[{t:'lac',hue:'#A91B3D',dx:-62,s:1.05,r:-6},{t:'top',dx:0,s:1.1,r:0},{t:'lac',hue:'#C51F45',dx:62,s:1.05,r:6}]},
 {brand:'فلورمار',title:'نگاهِ بیدار',desc:'ریملِ حجم‌دهنده و پالت‌های سایه‌ی هرروزه.',count:'۱۱ کالا',badge:'',bg:'',sp:[{t:'mas',hue:'#C51F45',dx:-55,s:1.1,r:-5},{t:'pal',dx:55,s:.9,r:0}]}
];
 $('#lineRow').innerHTML=LINES.map((l,i)=>`
  <article class="lcard ${l.bg}" style="animation-delay:${i*80}ms">
    <div class="lbody">
      ${l.badge?`<span class="lbadge">${l.badge}</span>`:''}
      <h3 class="fd"><b>${l.brand}</b> — ${l.title}</h3>
      <p>${l.desc}</p>
      <span class="lmeta">${l.count} · مرتب‌شده بر اساسِ محبوبیت</span>
      <button class="btn ghost ivory sm" data-q="${l.brand}">دیدنِ محصولاتِ برند<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
    </div>
    <div class="lwin">${cluster(l.sp,300,420,'#E7CCC5',true)}</div>
  </article>`).join('');
/* ---- 7. marquee / pills / editorial ---- */
const mqSet=MQ_BRANDS.map(b=>`<span>${b}</span><i></i>`).join('');
 $('#mq').innerHTML=`<div class="mq-set">${mqSet}</div><div class="mq-set" aria-hidden="true">${mqSet}</div>`;
 $('#brow').innerHTML=BRANDS.map(b=>`<button class="bpill" data-q="${b}">${b}</button>`).join('');
 $('#megaImg').innerHTML=cluster([{t:'lip',hue:'#C51F45',dx:-62,s:1.05,r:-6},{t:'gls',hue:'#B9827D',dx:0,s:1.1,r:0},{t:'lip',hue:'#92152F',dx:62,s:1.05,r:6}],420,460,BACK.lips,true);
 $('#rotArch').innerHTML=cluster([{t:'ser',dx:-95,s:1.5,r:-5},{t:'pow',hue:'#E7CCC5',dx:0,s:1.5,r:0},{t:'pal',dx:95,s:1.2,r:5}],560,740,BACK.face,true);
 $('#magFeat').innerHTML=cluster([{t:'lip',hue:'#92152F',dx:-70,s:1.15,r:-6},{t:'lip',hue:'#C51F45',dx:0,s:1.3,r:0},{t:'gls',hue:'#B9827D',dx:70,s:1.15,r:6}],560,480,BACK.lips,true);
 $('#mag1').innerHTML=cluster([{t:'pow',hue:'#E7CCC5',dx:-45,s:.8,r:-5},{t:'mas',hue:'#C51F45',dx:45,s:.8,r:5}],200,200,BACK.face,true);
 $('#mag2').innerHTML=cluster([{t:'shp',hue:'#E7CCC5',dx:-45,s:.8,r:-5},{t:'hoil',dx:45,s:.8,r:5}],200,200,BACK.hair,true);

/* ---- 8. cart & wishlist ---- */
let cart={};
function renderCart(){
  const items=Object.entries(cart).map(([id,q])=>({p:P.find(x=>x.id==id),q}));
  const count=items.reduce((a,b)=>a+b.q,0);
  const badge=$('#bCart');
  badge.textContent=fa(count);badge.style.display=count?'':'none';
  const sub=items.reduce((a,b)=>a+b.p.price*b.q,0);
  const ship=(sub>=800000||sub===0)?0:65000;
  $('#cartBody').innerHTML=items.length?items.map(it=>`
    <div class="citem">
      <span class="ci-th">${prodScene(it.p,132,164,.7)}</span>
      <div class="ci-info"><b>${it.p.name}</b><span>${fa(it.p.price)} تومان</span>
        <div class="qty"><button data-q2="-1" data-id="${it.p.id}" aria-label="کاهش">−</button><span>${fa(it.q)}</span><button data-q2="1" data-id="${it.p.id}" aria-label="افزایش">+</button></div>
      </div>
      <button class="ci-del" data-del="${it.p.id}" aria-label="حذف">${I.close}</button>
    </div>`).join('')
  :`<div class="cempty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="width:44px;height:44px;color:var(--line);margin:0 auto 16px;display:block"><path d="M5.5 8h13l-1.1 12.5H6.6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><p>سبد خرید شما خالی است.</p><button class="btn" data-close-drawers>بازگشت به فروشگاه</button></div>`;
  $('#subTotal').textContent=fa(sub)+' تومان';
  $('#shipCost').textContent=ship?fa(ship)+' تومان':'رایگان';
  $('#total').textContent=fa(sub+ship)+' تومان';
  $('#checkoutBtn').disabled=!items.length;
}
function addCart(id){cart[id]=(cart[id]||0)+1;renderCart();bump('#bCart');toast(`«${P.find(p=>p.id==id).name}» به سبد خرید اضافه شد`);}
renderCart();
function toggleFav(btn){
  const id=+btn.dataset.fav,p=P.find(x=>x.id===id);
  if(favSet.has(id)){favSet.delete(id);toast(`«${p.name}» از علاقه‌مندی‌ها حذف شد`);}
  else{favSet.add(id);toast(`«${p.name}» به علاقه‌مندی‌ها اضافه شد`);}
  $$('[data-fav="'+id+'"]').forEach(b=>b.classList.toggle('on',favSet.has(id)));
  const bd=$('#bFav');bd.textContent=fa(favSet.size);bd.style.display=favSet.size?'':'none';bump('#bFav');
}
 $('#openFav').addEventListener('click',()=>toast(favSet.size?`${fa(favSet.size)} کالا در علاقه‌مندی‌های شماست`:'لیست علاقه‌مندی‌ها خالی است'));

/* ---- 9. overlays & search ---- */
const scrim=$('#scrim');
function openLayer(el){
  closeAll(true);el.classList.add('open');
  scrim.classList.add('show');
  document.documentElement.classList.add('lock');document.body.classList.add('lock');
}
function closeAll(keepScrim){
  $$('.drawer.open, #searchOv.open').forEach(el=>el.classList.remove('open'));
  if(!keepScrim){
    scrim.classList.remove('show');
    document.documentElement.classList.remove('lock');document.body.classList.remove('lock');
  }
}
 $('#openCart').addEventListener('click',()=>openLayer($('#cartDrawer')));
 $('#openNav').addEventListener('click',()=>openLayer($('#navDrawer')));
 $('#openSearch').addEventListener('click',()=>openSearchWith(''));
scrim.addEventListener('click',()=>closeAll());
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
const srow=p=>`
  <div class="srow">
    <span class="s-th">${prodScene(p,100,120,.7)}</span>
    <div><b>${p.name}</b><small>${p.brand} · ${CATS[p.cat].n}</small></div>
    <span class="price">${fa(p.price)} تومان</span>
    <button class="mini" data-add="${p.id}">افزودن</button>
  </div>`;
function doSearch(q){
  q=(q||'').trim();
  if(!q){$('#sRes').innerHTML=`<p class="sEmpty">نام کالا یا برند را بنویس…</p>`;return;}
  const r=P.filter(p=>(p.name+' '+p.brand+' '+CATS[p.cat].n).includes(q));
  $('#sRes').innerHTML=r.length?r.map(p=>srow(p)).join(''):`<p class="sEmpty">نتیجه‌ای برای «${q}» پیدا نشد؛ عبارت دیگری را امتحان کن.</p>`;
}
function openSearchWith(q){
  openLayer($('#searchOv'));
  $('#sInput').value=q||'';
  doSearch(q);
  setTimeout(()=>$('#sInput').focus(),300);
}
 $('#sInput').addEventListener('input',e=>doSearch(e.target.value));
$$('.s-chips button').forEach(b=>b.addEventListener('click',()=>{$('#sInput').value=b.dataset.qc;doSearch(b.dataset.qc);}));

/* ---- 10. global delegation ---- */
const WORD={face:'صورت',lips:'لب',hair:'مو',nails:'ناخن'};
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){addCart(+add.dataset.add);return;}
  const fv=e.target.closest('[data-fav]');
  if(fv){toggleFav(fv);return;}
  const q2=e.target.closest('[data-q2]');
  if(q2){const id=q2.dataset.id;cart[id]+=+q2.dataset.q2;if(cart[id]<=0)delete cart[id];renderCart();return;}
  const del=e.target.closest('[data-del]');
  if(del){delete cart[del.dataset.del];renderCart();return;}
  const qEl=e.target.closest('[data-q]');
  if(qEl){e.preventDefault();closeAll();openSearchWith(qEl.dataset.q||'');return;}
  const cg=e.target.closest('[data-catgo]');
  if(cg){e.preventDefault();closeAll();const k=cg.dataset.catgo;openSearchWith(k==='all'?'رژ':WORD[k]);return;}
  if(e.target.closest('[data-close-drawers]')){closeAll();return;}
  if(e.target.closest('[data-nav]')){closeAll();return;}
  const stub=e.target.closest('[data-stub]');
  if(stub){e.preventDefault();toast('این بخش در نسخه نهایی به سایت متصل می‌شود');return;}
});
 $('#checkoutBtn').addEventListener('click',()=>toast('پیش‌نمایش طراحی — پرداخت در نسخه نهایی'));

/* ---- 11. routine / newsletter / reveal ---- */
let skin='پوست خشک';
$$('#schips .schip').forEach(b=>b.addEventListener('click',()=>{
  $$('#schips .schip').forEach(x=>x.classList.toggle('on',x===b));skin=b.dataset.skin;
}));
 $('#rotBtn').addEventListener('click',()=>{
  const q={'پوست خشک':'سرم','پوست معمولی':'کرم‌پودر','پوست چرب':'نیاسینامید'}[skin];
  openSearchWith(q);
  toast(`پیشنهادهای رُزا برای «${skin}» آماده شد`);
});
 $('#nlForm').addEventListener('submit',e=>{
  e.preventDefault();
  const v=$('#nlMail').value.trim();
  if(!/^\S+@\S+\.\S+$/.test(v)){$('#nlErr').style.display='block';return;}
  $('#nlErr').style.display='none';$('#nlMail').value='';
  toast('خوش آمدی! کد تخفیف ۱۵٪ به ایمیلت ارسال شد');
});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));
window.addEventListener('scroll',()=>$('#hdr').classList.toggle('scrolled',scrollY>10),{passive:true});
