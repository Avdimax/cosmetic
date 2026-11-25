/* ================================================================
   home.js — Homepage Interactive Controller (Rosallery / رزالری)
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const R = window.Rosallery;
  if (!R) return;
  const { DATA, $, $$, fa, faD, oldPrice, getProduct, productUrl, shopUrl, renderProductCard, toast, openDialog } = R;

  /* ---- 1. Hero Triptych Carousel (5 Worlds, 1:1 Category/Image Match, Play/Pause) ---- */
  function initHeroCarousel() {
    const hero = $('#hero');
    if (!hero) return;
    const stage = hero.querySelector('.trip');
    const tabs = $$('#heroCats .hcat');
    const toggleAutoBtn = $('#heroAutoBtn');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const panelKeys = ['face', 'skincare', 'lips', 'hair', 'nails'];

    // Adopt static LCP slide if present, and build remaining slides
    const existingInitial = stage.querySelector('[data-hero-initial]');
    const slides = panelKeys.map((key, index) => {
      const cat = DATA.categories[key];
      let slide;
      if (index === 0 && existingInitial) {
        slide = existingInitial;
        slide.removeAttribute('data-hero-initial');
      } else {
        slide = document.createElement('button');
        slide.type = 'button';
        slide.className = 'tslot hero-slide';
        slide.setAttribute('aria-label', `${cat.name} — ${cat.caption}`);
        slide.innerHTML = `<img class="hero-promo" data-cat="${key}" src="${cat.heroImage}" alt="${cat.heroAlt}" width="941" height="1254" fetchpriority="low"><span class="slide-label">${cat.name}</span>`;
        stage.append(slide);
      }
      slide.addEventListener('click', () => select(index));
      return slide;
    });

    const count = slides.length;
    const wrap = (v) => ((v % count) + count) % count;
    const distance = (to, from) => wrap(to - from + count / 2) - count / 2;
    const mix = (a, b, t) => a + (b - a) * t;

    let seats = [];
    let position = 0;
    let destination = 0;
    let frame = 0;
    let progress = null;
    let drag = null;
    let hovering = false;
    let userPaused = false;
    let suppressClick = false;

    function measure() {
      seats = Array.from(stage.querySelectorAll('[data-seat]'), (seat) => {
        const css = getComputedStyle(seat);
        return {
          x: seat.offsetLeft + seat.offsetWidth / 2,
          y: seat.offsetTop + seat.offsetHeight / 2 + (parseFloat(css.getPropertyValue('--ty')) || 0),
          width: seat.offsetWidth,
          height: seat.offsetHeight,
          tilt: parseFloat(css.getPropertyValue('--ry')) || 0
        };
      });
      paint(position);
    }

    function paint(val) {
      position = val;
      if (seats.length < 3) return;
      const center = seats[1];
      slides.forEach((slide, index) => {
        const offset = distance(index, val);
        const depth = Math.abs(offset);
        slide.hidden = depth >= 2;
        if (slide.hidden) return;
        const side = seats[offset > 0 ? 2 : 0];
        const t = Math.min(depth, 1);
        const entrance = Math.max(0, depth - 1);
        const width = mix(center.width, side.width, t);
        const height = mix(center.height, side.height, t);
        const x = mix(center.x, side.x, t) - (side.x - center.x) * entrance * 0.32;
        const y = mix(center.y, side.y, t) + entrance * 12;
        slide.style.width = `${width}px`;
        slide.style.height = `${height}px`;
        slide.style.transform = `translate3d(${x - width / 2}px,${y - height / 2}px,0) rotateY(${side.tilt * t}deg)`;
        slide.style.zIndex = depth < 0.5 ? 3 : depth <= 1 ? 2 : 1;
        slide.style.opacity = 1 - entrance;
        slide.style.boxShadow = `0 40px 80px -30px rgba(0,0,0,${0.65 * (1 - t)})`;
        const lbl = slide.querySelector('.slide-label');
        if (lbl) lbl.style.opacity = t;
        slide.tabIndex = depth === 1 ? 0 : -1;
      });
    }

    function syncAutoplay() {
      if (!progress) return;
      const paused =
        userPaused ||
        reducedMotion.matches ||
        hovering ||
        document.hidden ||
        hero.contains(document.activeElement) ||
        Boolean(drag) ||
        Boolean(frame);
      if (paused) progress.pause();
      else progress.play();
    }

    function updateAutoplayButton() {
      if (!toggleAutoBtn) return;
      toggleAutoBtn.setAttribute('aria-pressed', String(userPaused));
      toggleAutoBtn.setAttribute('aria-label', userPaused ? 'ادامه پخش خودکار اسلایدر' : 'توقف پخش خودکار اسلایدر');
      toggleAutoBtn.innerHTML = userPaused
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
    }

    if (toggleAutoBtn) {
      updateAutoplayButton();
      toggleAutoBtn.addEventListener('click', () => {
        userPaused = !userPaused;
        updateAutoplayButton();
        syncAutoplay();
      });
    }

    function settle() {
      frame = 0;
      const index = wrap(destination);
      destination = index;
      paint(index);

      const key = panelKeys[index];
      const cat = DATA.categories[key];
      const product = getProduct(cat.featuredProductId);

      $('#hIdx').textContent = cat.num;
      $('#hName').textContent = cat.name;
      $('#hCount').textContent = cat.countLabel;
      $('#heroCap').textContent = $('#hCap2').textContent = `«${cat.caption}»`;

      const hCta = $('#hCta');
      if (hCta) hCta.href = shopUrl({ cat: key });

      if (product) {
        const tImg = $('#tImg');
        if (tImg) {
          tImg.innerHTML = `<img src="${product.image}" alt="${product.name}" width="56" height="64">`;
        }
        $('#tBrand').textContent = product.brand;
        const tNameLink = $('#tName');
        if (tNameLink) {
          tNameLink.textContent = product.name;
          tNameLink.href = productUrl(product.id);
        }
        $('#tPrice').textContent = fa(product.price);
        $('#tOld').textContent = product.off ? fa(oldPrice(product)) : '';
        $('#tAdd').dataset.add = product.id;
      }

      tabs.forEach((tab, i) => {
        const active = panelKeys[i] === key;
        tab.classList.toggle('on', active);
        tab.setAttribute('aria-pressed', String(active));
      });

      progress?.cancel();
      progress = null;
      if (!reducedMotion.matches && tabs[index]) {
        const bar = tabs[index].querySelector('.bar');
        if (bar) {
          progress = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 4600);
          progress.onfinish = () => {
            if (!userPaused) select(index + 1);
          };
          syncAutoplay();
        }
      }
    }

    function select(index) {
      cancelAnimationFrame(frame);
      progress?.cancel();
      progress = null;
      const start = position;
      const delta = distance(index, start);
      destination = Math.round(start + delta);
      if (reducedMotion.matches || Math.abs(delta) < 0.001) return settle();
      const began = performance.now();
      const duration = Math.min(680, 440 * Math.sqrt(Math.abs(delta)));
      function tick(now) {
        const t = Math.min(1, (now - began) / duration);
        if (t === 1) return settle();
        paint(start + delta * (1 - (1 - t) ** 3));
        frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }

    tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

    hero.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      if (stage.contains(e.target)) stage.focus({ preventScroll: true });
      const nextIsLeft = seats[2].x < seats[1].x;
      select(destination + ((e.key === 'ArrowLeft') === nextIsLeft ? 1 : -1));
    });

    stage.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      suppressClick = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, active: false };
      syncAutoplay();
    });

    stage.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
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
        if (e.pointerType === 'mouse') stage.setPointerCapture(e.pointerId);
        suppressClick = true;
      }
      const spacing = seats[1].x - seats[2].x || 160;
      drag.travel = Math.max(-1, Math.min(1, dx / spacing));
      if (!reducedMotion.matches) paint(drag.origin + drag.travel);
    });

    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const gesture = drag;
      drag = null;
      if (gesture.active) {
        const advance = e.type === 'pointerup' && Math.abs(gesture.travel) >= 0.22;
        select(gesture.returnTo + (advance ? Math.sign(gesture.travel) : 0));
      } else syncAutoplay();
    }

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    stage.addEventListener('lostpointercapture', release);
    stage.addEventListener(
      'click',
      (e) => {
        if (suppressClick && e.detail) {
          e.stopImmediatePropagation();
          e.preventDefault();
          suppressClick = false;
        }
      },
      true
    );

    hero.addEventListener('pointerenter', (e) => {
      hovering = e.pointerType === 'mouse';
      syncAutoplay();
    });
    hero.addEventListener('pointerleave', () => {
      hovering = false;
      syncAutoplay();
    });
    hero.addEventListener('focusin', syncAutoplay);
    hero.addEventListener('focusout', () => queueMicrotask(syncAutoplay));
    document.addEventListener('visibilitychange', syncAutoplay);
    reducedMotion.addEventListener('change', () => select(destination));

    measure();
    new ResizeObserver(measure).observe(stage);
    settle();
  }

  initHeroCarousel();

  /* ---- 2. Amazing Deals & New Arrivals Carousels (Deduplicated) ---- */
  const dealProducts = DATA.products.filter((p) => p.isDeal).slice(0, 7);
  const dealIds = new Set(dealProducts.map((p) => p.id));
  const newProducts = DATA.products.filter((p) => p.isNew && !dealIds.has(p.id)).slice(0, 7);

  const dealRow = $('#dealRow');
  if (dealRow) {
    dealRow.insertAdjacentHTML(
      'beforeend',
      dealProducts.map((p, i) => renderProductCard(p, { badgeMode: 'off', index: i })).join('')
    );
  }

  const newRow = $('#newRow');
  if (newRow) {
    newRow.innerHTML = newProducts.map((p, i) => renderProductCard(p, { badgeMode: 'new', index: i })).join('');
  }

  /* ---- 3. Rosallery Curated Lip Studio (No competitor links, native Rosallery PDP + Cart!) ---- */
  const lipRow = $('#lipStudioRow');
  if (lipRow) {
    const lipProducts = DATA.products.filter((p) => p.cat === 'lips').slice(0, 12);
    lipRow.innerHTML = lipProducts
      .map((p, i) => renderProductCard(p, { badgeMode: p.off ? 'off' : 'new', index: i }))
      .join('');
  }

  /* ---- 4. Persistent End-of-Day Countdown Timer ---- */
  function startDailyCountdown() {
    const hEl = $('#cdH');
    const mEl = $('#cdM');
    const sEl = $('#cdS');
    if (!hEl || !mEl || !sEl) return;

    const getMidnight = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    };

    function tick() {
      const d = Math.max(0, getMidnight() - Date.now());
      hEl.textContent = faD(String(Math.floor(d / 3.6e6)).padStart(2, '0'));
      mEl.textContent = faD(String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, '0'));
      sEl.textContent = faD(String(Math.floor((d % 6e4) / 1e3)).padStart(2, '0'));
    }
    tick();
    setInterval(tick, 1000);
  }
  startDailyCountdown();

  /* ---- 5. Horizontal Carousel Arrow Navigation ---- */
  $$('[data-snav]').forEach((b) =>
    b.addEventListener('click', () => {
      const target = $(b.dataset.t);
      if (target) {
        target.scrollBy({ left: Number(b.dataset.s) * (Number(b.dataset.px) || 380), behavior: 'smooth' });
      }
    })
  );

  /* ---- 6. Category Chips Row (Real PLP Links + Real Studio Visuals) ---- */
  const catRow = $('#catrow');
  if (catRow) {
    const chips = [
      { key: 'face', img: 'assets/deal-foundation.webp', label: 'آرایش صورت', count: '۱۲۸ کالا' },
      { key: 'skincare', img: 'assets/new-serum.webp', label: 'مراقبت پوست', count: '۹۴ کالا' },
      { key: 'lips', img: 'assets/deal-lipstick-cherry.webp', label: 'آرایش لب', count: '۲۱۴ کالا' },
      { key: 'hair', img: 'assets/new-hair-iron.webp', label: 'مراقبت و استایل مو', count: '۹۶ کالا' },
      { key: 'nails', img: 'assets/deal-nail-polish.webp', label: 'آرایش ناخن', count: '۸۷ کالا' }
    ];
    catRow.innerHTML =
      chips
        .map(
          (ch) => `
      <a class="catchip" href="${shopUrl({ cat: ch.key })}">
        <span class="cimg"><img src="${ch.img}" alt="${ch.label}" width="176" height="198" loading="lazy"></span>
        <b>${ch.label}</b>
        <small>${ch.count}</small>
      </a>`
        )
        .join('') +
      `<a class="catchip all" href="shop.html">
        <span class="cimg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span>
        <b>همه محصولات</b>
        <small>مشاهده کل فروشگاه</small>
      </a>`;
  }

  /* ---- 7. Brand Lines Editorial Cards ---- */
  const lineRow = $('#lineRow');
  if (lineRow) {
    lineRow.innerHTML = DATA.brandLines
      .map(
        (l, i) => `
      <article class="lcard ${l.highlight ? 'rosebg' : ''}" style="animation-delay:${i * 70}ms">
        <div class="lbody">
          ${l.badge ? `<span class="lbadge">${l.badge}</span>` : ''}
          <h3 class="fd"><b>${l.brand}</b> — ${l.title}</h3>
          <p>${l.desc}</p>
          <span class="lmeta">${l.count} · تضمین اصالت کالا</span>
          <a class="btn ghost ivory sm" href="${shopUrl({ brand: l.brand })}">دیدن محصولات برند${R.ICONS.arrowLeft}</a>
        </div>
        <div class="lwin"><img src="${l.image}" alt="${l.brand} ${l.title}" width="170" height="210" loading="lazy"></div>
      </article>`
      )
      .join('');
  }

  /* ---- 8. Brand Marquee & Trusted Brand Pills ---- */
  const mqEl = $('#mq');
  if (mqEl) {
    const mqBrands = DATA.brands.slice(0, 12).map((b) => `<span>${b.name}</span><i></i>`).join('');
    mqEl.innerHTML = `<div class="mq-set">${mqBrands}</div><div class="mq-set" aria-hidden="true">${mqBrands}</div>`;
  }

  const browEl = $('#brow');
  if (browEl) {
    browEl.innerHTML = DATA.brands
      .slice(0, 14)
      .map((b) => `<a class="bpill" href="${shopUrl({ brand: b.name })}">${b.name}</a>`)
      .join('');
  }

  /* ---- 9. Routine Builder Teaser (Routes to full 4-Step Quiz!) ---- */
  let selectedSkin = 'پوست خشک';
  const skinChips = $$('#schips .schip');
  skinChips.forEach((btn) =>
    btn.addEventListener('click', () => {
      skinChips.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('on', active);
        b.setAttribute('aria-pressed', String(active));
      });
      selectedSkin = btn.dataset.skin;
    })
  );
  $('#rotBtn')?.addEventListener('click', () => {
    location.href = `routine.html?skin=${encodeURIComponent(selectedSkin)}`;
  });

  /* ---- 10. Newsletter Form (Real Redeemable ROSALLERY15 Code) ---- */
  const nlForm = $('#nlForm');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = $('#nlMail');
      if (!inp.reportValidity()) return;
      const email = inp.value.trim();
      inp.value = '';
      R.setState((s) => ({ ...s, newsletterEmail: email, promoCode: 'ROSALLERY15' }));
      const conf = $('#nlConfirm');
      if (conf) {
        conf.hidden = false;
        conf.innerHTML = `کد تخفیف ۱۵٪ <b>ROSALLERY15</b> به ایمیل <b>${email}</b> ارسال و به‌صورت خودکار روی سبد خرید شما فعال شد.`;
      }
      toast('خوش آمدید! کد تخفیف ROSALLERY15 روی سبد خرید فعال شد');
    });
  }
});
