/* ================================================================
   core.js — Shared Store, Native <dialog> Shell, Search, Cart,
   Wishlist, Auth OTP, Quick View, Tabs & Form Validation Utilities
   ================================================================ */
window.Rosallery = (() => {
  const DATA = window.ROSALLERY_DATA;
  const STORAGE_KEY = 'rosallery_store_v1';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  /* ---- Number & Persian Text Normalization Helpers ---- */
  const fa = (n) => Number(n || 0).toLocaleString('fa-IR');
  const faD = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const toEnDigits = (s) =>
    String(s || '')
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const normalizeFa = (s) =>
    toEnDigits(s)
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\u200c/g, ' ')
      .trim()
      .toLowerCase();

  const oldPrice = (p) => (p.off ? Math.round((p.price * 100) / (100 - p.off)) : p.price);
  const getProduct = (id) => DATA.products.find((p) => Number(p.id) === Number(id));
  const productUrl = (id) => `product.html?id=${id}`;
  const shopUrl = (params = {}) => {
    const u = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') u.set(k, v);
    });
    const qs = u.toString();
    return qs ? `shop.html?${qs}` : 'shop.html';
  };

  /* ---- Shared SVG Icons ---- */
  const ICONS = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 20.5S3.5 15.5 3.5 9.4A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.5 2.7c0 6.1-8.5 11.1-8.5 11.1z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5.5 8h13l-1.1 12.5H6.6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>',
    arrowLeft: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/></svg>'
  };

  /* ---- Persistent State ---- */
  const defaultState = () => ({
    cart: [],
    wishlist: [5, 2],
    recentlyViewed: [1, 5, 2],
    recentSearches: ['رژ لب', 'نیاسینامید'],
    promoCode: '',
    giftWrap: false,
    giftNote: '',
    freeSampleId: 'smp-1',
    user: {
      loggedIn: false,
      name: 'نیلوفر پارسا',
      mobile: '۰۹۱۲۳۴۵۶۷۸۹',
      points: 420,
      beautyProfile: {
        skinType: 'پوست مختلط',
        hairType: 'موی رنگ‌شده',
        undertone: 'خنثی',
        concern: 'آبرسانی و درخشش'
      },
      addresses: [
        {
          id: 'addr-1',
          label: 'منزل',
          receiver: 'نیلوفر پارسا',
          mobile: '۰۹۱۲۳۴۵۶۷۸۹',
          province: 'تهران',
          city: 'تهران',
          postalCode: '۱۹۶۶۷۳۴۵۱۱',
          address: 'خیابان الهیه، خیابان مریم شرقی، پلاک ۱۸، واحد ۴'
        }
      ]
    },
    orders: [
      {
        id: 'RS-1405-7120',
        date: '۱۴۰۵/۰۱/۲۴',
        statusStep: 4,
        statusLabel: 'تحویل شده به مشتری',
        total: 1388000,
        shippingLabel: 'ارسال سریع تهران (۲۴ ساعته)',
        paymentLabel: 'پرداخت آنلاین شاپرک',
        receiver: 'نیلوفر پارسا',
        mobile: '09123456789',
        address: 'تهران، خیابان الهیه، پلاک ۱۸',
        items: [
          { id: 1, name: 'کرم‌پودر مای فشن کاور ابریشمی مای لیدر', shade: '۰۲ بژ طبیعی', qty: 1, price: 498000 },
          { id: 2, name: 'سرم نیاسینامید ۱۰٪ + زینک ۱٪ اوردینری', shade: '۳۰ میل', qty: 1, price: 890000 }
        ]
      }
    ],
    customReviews: {},
    customQna: {},
    notifyRequests: []
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        user: { ...defaultState().user, ...(parsed.user || {}) }
      };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  const listeners = new Set();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore storage quota issues */
    }
    syncBadges();
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  /* ---- Live Region Announcer & Toasts ---- */
  let announcerEl;
  let announceTimer;

  function ensureAnnouncer() {
    if (!announcerEl) {
      announcerEl = $('#liveAnnouncer');
      if (!announcerEl) {
        announcerEl = document.createElement('div');
        announcerEl.id = 'liveAnnouncer';
        announcerEl.setAttribute('aria-live', 'polite');
        announcerEl.className = 'visually-hidden';
        document.body.appendChild(announcerEl);
      }
    }
    return announcerEl;
  }

  function announce(msg, delay = 0) {
    const el = ensureAnnouncer();
    clearTimeout(announceTimer);
    el.textContent = '';
    announceTimer = setTimeout(() => {
      el.textContent = msg;
    }, delay);
  }

  function toast(msg) {
    let wrap = $('#toasts');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toasts';
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2800);
    announce(msg, 100);
  }

  function bump(sel) {
    $$(sel).forEach((b) => {
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    });
  }

  /* ---- Cart & Pricing Calculations ---- */
  function getCartTotals(shippingMethod = 'standard') {
    const items = state.cart
      .map((entry) => {
        const product = getProduct(entry.id);
        if (!product) return null;
        const sizeObj = (product.sizes || []).find((s) => s.label === entry.size);
        const unitPrice = product.price + (sizeObj ? sizeObj.priceDelta : 0);
        return { ...entry, product, unitPrice, lineTotal: unitPrice * entry.qty };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const promo = DATA.config.promoCodes[state.promoCode];
    let discount = 0;
    if (promo && promo.type === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100);
    }
    const afterDiscount = Math.max(0, subtotal - discount);

    let shipping = 0;
    const isFreeShipPromo = promo && promo.type === 'freeship';
    if (afterDiscount > 0 && !isFreeShipPromo && afterDiscount < DATA.config.freeShippingThreshold) {
      if (shippingMethod === 'post') shipping = DATA.config.postShippingFee;
      else if (shippingMethod === 'tipax') shipping = DATA.config.tipaxShippingFee;
      else shipping = DATA.config.tehranShippingFee;
    }

    const giftFee = state.giftWrap && items.length ? DATA.config.giftWrapFee : 0;
    const total = afterDiscount + shipping + giftFee;
    const count = items.reduce((s, it) => s + it.qty, 0);
    const remainingForFreeShip = Math.max(0, DATA.config.freeShippingThreshold - afterDiscount);
    const freeSampleEligible = afterDiscount >= DATA.config.freeSampleThreshold;

    return {
      items,
      count,
      subtotal,
      discount,
      promo,
      shipping,
      giftFee,
      total,
      remainingForFreeShip,
      freeSampleEligible
    };
  }

  function addToCart(id, options = {}) {
    const p = getProduct(id);
    if (!p) return;
    if (!p.inStock) {
      openNotifyDialog(p.id);
      return;
    }
    const shade = options.shade || (p.shades && p.shades[0] ? p.shades[0].name : '');
    const size = options.size || (p.sizes && p.sizes[0] ? p.sizes[0].label : '');
    const qty = Math.max(1, Number(options.qty || 1));

    const existing = state.cart.find(
      (it) => Number(it.id) === Number(id) && it.shade === shade && it.size === size
    );
    if (existing) existing.qty += qty;
    else state.cart.push({ id: Number(id), qty, shade, size });

    saveState();
    renderCartDrawer();
    bump('.js-cart-badge');
    toast(`«${p.name}» به سبد خرید اضافه شد`);
  }

  function updateCartQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart.splice(index, 1);
    saveState();
    renderCartDrawer();
  }

  function removeCartItem(index) {
    state.cart.splice(index, 1);
    saveState();
    renderCartDrawer();
  }

  function toggleWishlist(id) {
    const pid = Number(id);
    const p = getProduct(pid);
    if (!p) return;
    const idx = state.wishlist.indexOf(pid);
    if (idx >= 0) {
      state.wishlist.splice(idx, 1);
      toast(`«${p.name}» از علاقه‌مندی‌ها حذف شد`);
    } else {
      state.wishlist.unshift(pid);
      toast(`«${p.name}» به علاقه‌مندی‌ها اضافه شد`);
    }
    saveState();
    syncWishlistButtons();
    renderWishlistDrawer();
    bump('.js-fav-badge');
  }

  function trackRecentlyViewed(id) {
    const pid = Number(id);
    if (!getProduct(pid)) return;
    state.recentlyViewed = [pid, ...state.recentlyViewed.filter((x) => x !== pid)].slice(0, 10);
    saveState();
  }

  function applyPromoCode(code) {
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) {
      state.promoCode = '';
      saveState();
      return { ok: true, msg: 'کد تخفیف حذف شد' };
    }
    if (!DATA.config.promoCodes[clean]) {
      return { ok: false, msg: 'کد تخفیف واردشده معتبر نیست (مثال: ROSALLERY15)' };
    }
    state.promoCode = clean;
    saveState();
    return { ok: true, msg: DATA.config.promoCodes[clean].label };
  }

  /* ---- Sync Badges & Wishlist Heart Buttons ---- */
  function syncBadges() {
    const { count } = getCartTotals();
    $$('.js-cart-badge').forEach((b) => {
      b.textContent = fa(count);
      b.style.display = count ? '' : 'none';
    });
    const favCount = state.wishlist.length;
    $$('.js-fav-badge').forEach((b) => {
      b.textContent = fa(favCount);
      b.style.display = favCount ? '' : 'none';
    });
    $$('.js-user-dot').forEach((d) => {
      d.hidden = !state.user.loggedIn;
    });
  }

  function syncWishlistButtons() {
    $$('[data-fav]').forEach((btn) => {
      const pid = Number(btn.dataset.fav);
      const active = state.wishlist.includes(pid);
      btn.classList.toggle('on', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  /* ---- Unified Product Card Markup ---- */
  function renderProductCard(p, opts = {}) {
    const badgeMode = opts.badgeMode || (p.isDeal ? 'off' : p.isNew ? 'new' : '');
    const isFav = state.wishlist.includes(p.id);
    const oldP = oldPrice(p);
    const swatches = (p.shades || []).slice(0, 4);
    const delayStyle = opts.index !== undefined ? ` style="animation-delay:${Math.min(opts.index, 8) * 55}ms"` : '';

    return `
      <article class="mcard"${delayStyle}>
        <div class="mmedia-wrap">
          <div class="mmedia${p.isPackshot ? ' is-packshot' : ''}">
            <a class="mthumb-link" href="${productUrl(p.id)}">
              <img class="deal-art" src="${p.image}" alt="${p.brand} ${p.name}" width="340" height="357" loading="lazy">
            </a>
            ${!p.inStock ? '<span class="moos">ناموجود</span>' : ''}
          </div>
          ${p.off && badgeMode !== 'new' ? `<span class="moff">${fa(p.off)}٪</span>` : ''}
          ${badgeMode === 'new' || (!p.off && p.isNew) ? '<span class="mnew">تازه</span>' : ''}
          <div class="mcard-actions">
            <button type="button" class="mfav${isFav ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="افزودن ${p.name} به علاقه‌مندی‌ها">${ICONS.heart}</button>
            <button type="button" class="mqv" data-qv="${p.id}" aria-label="نمای سریع ${p.name}">${ICONS.eye}</button>
          </div>
          ${
            p.inStock
              ? `<button type="button" class="madd" data-add="${p.id}" aria-label="افزودن ${p.name} به سبد خرید">${ICONS.bag}</button>`
              : `<button type="button" class="madd" data-notify="${p.id}" aria-label="خبرم کن وقتی ${p.name} موجود شد">!</button>`
          }
        </div>
        <div class="minfo">
          <div class="mtoprow">
            <span class="mbrand">${p.brand}</span>
            <span class="mrate">${ICONS.star}<span>${faD(p.rating)}</span></span>
          </div>
          <h3 class="mname"><a href="${productUrl(p.id)}">${p.name}</a></h3>
          <div class="mswatches" aria-hidden="true">
            ${swatches.map((s) => `<span style="background:${s.hex}"></span>`).join('')}
            ${p.shades && p.shades.length > 4 ? `<i>+${fa(p.shades.length - 4)}</i>` : ''}
          </div>
          <div class="mprice">
            <b>${fa(p.price)}<i>تومان</i></b>
            ${p.off ? `<del>${fa(oldP)}</del>` : ''}
          </div>
        </div>
      </article>`;
  }

  /* ---- Native <dialog> Shell Injection & Safari closedby Fallback ---- */
  function installDialogLightDismissFallback() {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const isOutside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    document.addEventListener('pointerdown', (e) => {
      const dialog = e.target;
      if (dialog?.tagName === 'DIALOG' && dialog.open && dialog.getAttribute('closedby') === 'any') {
        dialog._pressedOutside = isOutside(e, dialog);
      }
    });
    document.addEventListener('pointerup', (e) => {
      const dialog = e.target;
      if (dialog?.tagName === 'DIALOG' && dialog.open && dialog._pressedOutside && isOutside(e, dialog)) {
        dialog.close();
      }
      if (dialog?.tagName === 'DIALOG') dialog._pressedOutside = false;
    });
  }

  function injectSharedShell() {
    if (!$('.night-sky')) {
      document.body.insertAdjacentHTML(
        'afterbegin',
        `<div class="night-sky" aria-hidden="true">
          <div class="star-field s-sm"></div>
          <div class="star-field s-lg"></div>
          <span class="comet"></span>
        </div>`
      );
    }

    // Ensure Theme Toggle & Concierge trigger exist inside header icons
    const hIcons = $('.h-icons');
    if (hIcons && !$('#themeToggle')) {
      hIcons.insertAdjacentHTML(
        'afterbegin',
        `<button type="button" class="icbtn theme-toggle-btn" id="themeToggle" data-theme-toggle aria-label="تغییر حالت شب و روز">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/><path d="M17.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button type="button" class="icbtn hide-xs" id="conciergeHeaderBtn" popovertarget="conciergePop" aria-label="مشاور زیبایی">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l1.9 4.8L19 9.5l-5.1 1.7L12 16l-1.9-4.8L5 9.5l5.1-1.7z"/><circle cx="18.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/></svg>
        </button>`
      );
    }

    if ($('#cartDialog')) return;

    const currentPage = location.pathname.split('/').pop() || 'index.html';

    const shellHTML = `
      <!-- Mobile Navigation Drawer (<dialog>) -->
      <dialog class="rs-drawer" id="navDialog" closedby="any" aria-labelledby="navDialogTitle">
        <div class="d-head">
          <h1 id="navDialogTitle">منوی رزالری</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن منو" autofocus>${ICONS.close}</button>
        </div>
        <nav class="d-body-scroll nd-body" aria-label="منوی موبایل">
          <details open>
            <summary>دسته‌بندی‌های زیبایی</summary>
            <ul>
              <li><a href="${shopUrl({ cat: 'face' })}">آرایش صورت</a></li>
              <li><a href="${shopUrl({ cat: 'skincare' })}">مراقبت پوست</a></li>
              <li><a href="${shopUrl({ cat: 'lips' })}">آرایش لب</a></li>
              <li><a href="${shopUrl({ cat: 'hair' })}">مراقبت و استایل مو</a></li>
              <li><a href="${shopUrl({ cat: 'nails' })}">آرایش ناخن</a></li>
              <li><a href="shop.html">مشاهده همه محصولات</a></li>
            </ul>
          </details>
          <a class="nd-link" href="${shopUrl({ deals: '1' })}">شگفت‌انگیزهای امروز</a>
          <a class="nd-link" href="${shopUrl({ new: '1' })}">تازه‌های وارداتی</a>
          <a class="nd-link" href="routine.html">مشاور و سازنده روتین پوست</a>
          <a class="nd-link" href="brands.html">برندهای رسمی (الف–ی)</a>
          <a class="nd-link" href="magazine.html">مجله زیبایی رزالری</a>
          <a class="nd-link" href="track-order.html">پیگیری سفارش</a>
          <a class="nd-link" href="account.html">حساب کاربری و باشگاه مشتریان</a>
          <a class="nd-link" href="faq.html">سوالات متداول و بازگشت کالا</a>
          <a class="nd-link" href="contact.html">تماس با پشتیبانی</a>
        </nav>
      </dialog>

      <!-- Mini-Cart Drawer (<dialog>) -->
      <dialog class="rs-drawer is-start" id="cartDialog" closedby="any" aria-labelledby="cartDialogTitle">
        <div class="d-head">
          <h1 id="cartDialogTitle">سبد خرید شما</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن سبد خرید" autofocus>${ICONS.close}</button>
        </div>
        <div class="d-body-scroll" id="cartDialogBody"></div>
        <div class="d-foot">
          <div class="trow"><span>جمع سفارش</span><b id="cdSubTotal">۰ تومان</b></div>
          <div class="trow" id="cdDiscountRow" style="display:none"><span>تخفیف</span><b id="cdDiscount" style="color:var(--ok)">۰</b></div>
          <div class="trow"><span>هزینه ارسال تخمینی</span><b id="cdShipCost">رایگان</b></div>
          <div class="trow total"><span>مبلغ قابل پرداخت</span><b id="cdTotal">۰ تومان</b></div>
          <div class="d-foot-actions">
            <a class="btn ghost" href="cart.html" id="cdViewCartBtn">مشاهده سبد</a>
            <a class="btn rose" href="checkout.html" id="cdCheckoutBtn">تسویه حساب</a>
          </div>
        </div>
      </dialog>

      <!-- Wishlist Drawer (<dialog>) -->
      <dialog class="rs-drawer is-start" id="favDialog" closedby="any" aria-labelledby="favDialogTitle">
        <div class="d-head">
          <h1 id="favDialogTitle">لیست علاقه‌مندی‌ها</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن علاقه‌مندی‌ها" autofocus>${ICONS.close}</button>
        </div>
        <div class="d-body-scroll" id="favDialogBody"></div>
        <div class="d-foot">
          <a class="btn rose" href="account.html?tab=wishlist">مدیریت علاقه‌مندی‌ها در پروفایل</a>
        </div>
      </dialog>

      <!-- Search Top Dialog (<dialog>) -->
      <dialog class="rs-top-dialog" id="searchDialog" closedby="any" aria-labelledby="searchDialogTitle">
        <div class="s-in">
          <div class="d-head" style="padding:0 0 12px;border:none">
            <h1 id="searchDialogTitle" style="font-size:1.3rem">جستجو در میان محصولات و برندهای رزالری</h1>
            <button type="button" class="icbtn" data-close-dialog aria-label="بستن جستجو">${ICONS.close}</button>
          </div>
          <search>
            <form class="s-bar" id="globalSearchForm" action="shop.html" method="GET">
              ${ICONS.search}
              <label for="sInput" class="visually-hidden">عبارت جستجو</label>
              <input id="sInput" name="q" type="search" placeholder="نام محصول، برند یا دغدغه پوستی را بنویس…" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" autofocus>
              <button type="submit" class="btn rose sm">جستجو</button>
            </form>
          </search>
          <div class="s-chips" id="searchChips">
            <b>پرطرفدارها:</b>
            <button type="button" data-qc="رژ لب">رژ لب</button>
            <button type="button" data-qc="نیاسینامید">نیاسینامید</button>
            <button type="button" data-qc="کرم‌پودر">کرم‌پودر</button>
            <button type="button" data-qc="لاک">لاک ناخن</button>
            <button type="button" data-qc="لورال">لورال</button>
          </div>
          <div id="sRes" aria-live="polite"></div>
        </div>
      </dialog>

      <!-- Quick View Modal (<dialog>) -->
      <dialog class="rs-modal" id="quickViewDialog" closedby="any" aria-labelledby="qvTitle">
        <div class="d-head">
          <h1 id="qvTitle">نمای سریع محصول</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن نمای سریع" autofocus>${ICONS.close}</button>
        </div>
        <div class="d-body-scroll" id="qvBody" style="padding:0"></div>
      </dialog>

      <!-- Mobile OTP Login Modal (<dialog>) -->
      <dialog class="rs-modal sm" id="authDialog" closedby="any" aria-labelledby="authTitle">
        <div class="d-head">
          <h1 id="authTitle">ورود / عضویت در رزالری</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن ورود">${ICONS.close}</button>
        </div>
        <div class="d-body-scroll" id="authBody"></div>
      </dialog>

      <!-- Back-in-Stock Notification Modal (<dialog>) -->
      <dialog class="rs-modal sm" id="notifyDialog" closedby="any" aria-labelledby="notifyTitle">
        <div class="d-head">
          <h1 id="notifyTitle">اطلاع‌رسانی موجود شدن کالا</h1>
          <button type="button" class="icbtn" data-close-dialog aria-label="بستن">${ICONS.close}</button>
        </div>
        <div class="d-body-scroll" id="notifyBody"></div>
      </dialog>

      <!-- Beauty Concierge Popover (triggered from header — no bottom-left floating clutter) -->
      <div id="conciergePop" class="concierge-popover" popover="auto">
        <h3>مشاور اختصاصی رزالری</h3>
        <p>برای انتخاب رنگ رژلب، ساخت روتین پوست یا پیگیری سفارش همراه شما هستیم.</p>
        <div class="concierge-links">
          <a href="routine.html"><span>آزمون ۴ مرحله‌ای روتین پوست</span><span>←</span></a>
          <a href="track-order.html"><span>پیگیری وضعیت سفارش</span><span>←</span></a>
          <a href="faq.html"><span>راهنمای اصالت و بازگشت ۷ روزه</span><span>←</span></a>
          <a href="contact.html"><span>تماس با مشاور: ${DATA.config.supportPhone}</span><span>←</span></a>
        </div>
      </div>

      <!-- Mobile Bottom Navigation Dock (Minimal Red-Accented Arch Shapes) -->
      <nav class="mobile-dock" aria-label="دسترسی سریع موبایل">
        <a href="index.html"${currentPage === 'index.html' ? ' aria-current="page"' : ''}>
          <span class="dock-shape" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span>
          <span class="dock-label">خانه</span>
        </a>
        <a href="shop.html"${currentPage === 'shop.html' ? ' aria-current="page"' : ''}>
          <span class="dock-shape" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>
          <span class="dock-label">فروشگاه</span>
        </a>
        <button type="button" data-open-cart aria-label="سبد خرید">
          <span class="dock-shape" aria-hidden="true">${ICONS.bag}</span>
          <span class="badge js-cart-badge" style="display:none">۰</span>
          <span class="dock-label">سبد خرید</span>
        </button>
        <button type="button" data-open-fav aria-label="علاقه‌مندی‌ها">
          <span class="dock-shape" aria-hidden="true">${ICONS.heart}</span>
          <span class="badge js-fav-badge" style="display:none">۰</span>
          <span class="dock-label">علاقه‌مندی</span>
        </button>
        <a href="account.html"${currentPage === 'account.html' ? ' aria-current="page"' : ''}>
          <span class="dock-shape" aria-hidden="true">${ICONS.user}</span>
          <span class="dock-label">حساب من</span>
        </a>
      </nav>

      <button type="button" class="scroll-top-btn" id="scrollTopBtn" aria-label="بازگشت به بالای صفحه" aria-hidden="true" tabindex="-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
      </button>

      <div id="toasts"></div>
      <div id="liveAnnouncer" class="visually-hidden" aria-live="polite"></div>
    `;

    document.body.insertAdjacentHTML('afterbegin', '<div class="scroll-sentinel" id="scrollTopSentinel" aria-hidden="true"></div>');
    document.body.insertAdjacentHTML('beforeend', shellHTML);
    installDialogLightDismissFallback();
    initGlobalSearchEvents();
    initScrollTopButton();
    renderCartDrawer();
    renderWishlistDrawer();
    syncBadges();
  }

  function initScrollTopButton() {
    const btn = $('#scrollTopBtn');
    const sentinel = $('#scrollTopSentinel');
    if (!btn || !sentinel) return;

    const setVisible = (visible) => {
      if (!visible && document.activeElement === btn) {
        const targetFocus = document.querySelector('main') || document.body;
        if (!targetFocus.hasAttribute('tabindex')) targetFocus.setAttribute('tabindex', '-1');
        targetFocus.focus({ preventScroll: true });
      }
      btn.classList.toggle('is-visible', visible);
      btn.tabIndex = visible ? 0 : -1;
      if (visible) btn.removeAttribute('aria-hidden');
      else btn.setAttribute('aria-hidden', 'true');
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisible(!entry.isIntersecting && window.scrollY > 120);
          });
        },
        { threshold: 0 }
      );
      observer.observe(sentinel);
    } else {
      window.addEventListener('scroll', () => setVisible(window.scrollY > 320), { passive: true });
    }

    setVisible(window.scrollY > 320);

    btn.addEventListener('click', () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---- Dialog Openers & Renderers ---- */
  function openDialog(sel) {
    const dlg = $(sel);
    if (!dlg) return;
    $$('dialog[open]').forEach((d) => {
      if (d !== dlg) d.close();
    });
    if (!dlg.open) dlg.showModal();
  }

  function renderCartDrawer() {
    const body = $('#cartDialogBody');
    if (!body) return;
    const totals = getCartTotals();
    const pct = Math.min(100, Math.round((totals.subtotal / DATA.config.freeShippingThreshold) * 100));

    if (!totals.items.length) {
      body.innerHTML = `
        <div class="cempty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;color:var(--rose-gold);margin:0 auto 14px;display:block" aria-hidden="true"><path d="M5.5 8h13l-1.1 12.5H6.6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
          <p>سبد خرید شما در حال حاضر خالی است.</p>
          <a class="btn rose" href="shop.html">شروع خرید از فروشگاه</a>
        </div>`;
    } else {
      body.innerHTML = `
        <div class="ship-meter${totals.remainingForFreeShip === 0 ? ' done' : ''}">
          ${
            totals.remainingForFreeShip === 0
              ? '<b>تبریک!</b> ارسال سفارش شما کاملاً رایگان شد.'
              : `تنها <b>${fa(totals.remainingForFreeShip)} تومان</b> تا ارسال رایگان فاصله دارید.`
          }
          <div class="ship-bar"><span style="width:${pct}%"></span></div>
        </div>
        ${totals.items
          .map(
            (it, idx) => `
          <div class="citem">
            <a class="ci-th${it.product.isPackshot ? ' is-packshot' : ''}" href="${productUrl(it.id)}">
              <img src="${it.product.image}" alt="${it.product.name}" width="64" height="74">
            </a>
            <div class="ci-info">
              <b><a href="${productUrl(it.id)}">${it.product.name}</a></b>
              ${it.shade || it.size ? `<span class="ci-sub">${[it.shade, it.size].filter(Boolean).join(' · ')}</span>` : ''}
              <span class="ci-price">${fa(it.unitPrice)} تومان</span>
              <div class="qty">
                <button type="button" data-cart-qty="-1" data-idx="${idx}" aria-label="کاهش تعداد">−</button>
                <span>${fa(it.qty)}</span>
                <button type="button" data-cart-qty="1" data-idx="${idx}" aria-label="افزایش تعداد">+</button>
              </div>
            </div>
            <button type="button" class="ci-del" data-cart-del="${idx}" aria-label="حذف ${it.product.name}">${ICONS.close}</button>
          </div>`
          )
          .join('')}`;
    }

    $('#cdSubTotal').textContent = `${fa(totals.subtotal)} تومان`;
    if (totals.discount > 0) {
      $('#cdDiscountRow').style.display = '';
      $('#cdDiscount').textContent = `−${fa(totals.discount)} تومان`;
    } else {
      $('#cdDiscountRow').style.display = 'none';
    }
    $('#cdShipCost').textContent = totals.shipping ? `${fa(totals.shipping)} تومان` : 'رایگان';
    $('#cdTotal').textContent = `${fa(totals.total)} تومان`;
    const checkoutBtn = $('#cdCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.setAttribute('aria-disabled', String(!totals.items.length));
      checkoutBtn.style.pointerEvents = totals.items.length ? '' : 'none';
      checkoutBtn.style.opacity = totals.items.length ? '' : '0.45';
    }
  }

  function renderWishlistDrawer() {
    const body = $('#favDialogBody');
    if (!body) return;
    const favProducts = state.wishlist.map(getProduct).filter(Boolean);
    if (!favProducts.length) {
      body.innerHTML = `
        <div class="cempty">
          <p>هنوز محصولی به لیست علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
          <a class="btn ghost" href="shop.html">کشف محصولات</a>
        </div>`;
      return;
    }
    body.innerHTML = favProducts
      .map(
        (p) => `
      <div class="citem">
        <a class="ci-th${p.isPackshot ? ' is-packshot' : ''}" href="${productUrl(p.id)}">
          <img src="${p.image}" alt="${p.name}" width="64" height="74">
        </a>
        <div class="ci-info">
          <b><a href="${productUrl(p.id)}">${p.name}</a></b>
          <span class="ci-sub">${p.brand}</span>
          <span class="ci-price">${fa(p.price)} تومان</span>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button type="button" class="btn rose sm" data-add="${p.id}">افزودن به سبد</button>
          </div>
        </div>
        <button type="button" class="ci-del" data-fav="${p.id}" aria-label="حذف ${p.name} از علاقه‌مندی‌ها">${ICONS.close}</button>
      </div>`
      )
      .join('');
  }

  /* ---- Global Search Modal ---- */
  function runSearchRender(query) {
    const resEl = $('#sRes');
    if (!resEl) return;
    const q = normalizeFa(query);

    if (!q) {
      resEl.innerHTML = `
        <p class="sEmpty">نام محصول، برند (مثلاً لانکوم، اوردینری) یا دسته‌بندی را جستجو کنید.</p>
        ${
          state.recentSearches.length
            ? `<div class="s-chips"><b>جستجوهای اخیر:</b>${state.recentSearches
                .map((term) => `<button type="button" data-qc="${term}">${term}</button>`)
                .join('')}</div>`
            : ''
        }`;
      return;
    }

    const matchedCats = Object.values(DATA.categories).filter((c) => normalizeFa(c.name).includes(q));
    const matchedBrands = DATA.brands.filter(
      (b) => normalizeFa(b.name).includes(q) || normalizeFa(b.nameEn).includes(q)
    );
    const matchedProducts = DATA.products.filter((p) => {
      const haystack = normalizeFa(
        `${p.name} ${p.nameEn} ${p.brand} ${p.brandEn} ${p.subcat} ${DATA.categories[p.cat]?.name || ''} ${(p.concerns || []).join(' ')}`
      );
      return haystack.includes(q);
    });

    if (!matchedProducts.length && !matchedBrands.length && !matchedCats.length) {
      resEl.innerHTML = `<p class="sEmpty">نتیجه‌ای برای «${query}» پیدا نشد؛ عبارت دیگری یا نام برند را امتحان کنید.</p>`;
      return;
    }

    let html = '';
    if (matchedBrands.length || matchedCats.length) {
      html += `<div class="s-chips" style="margin-top:4px">
        ${matchedCats.map((c) => `<a class="pill-btn" href="${shopUrl({ cat: c.key })}">دسته: ${c.name}</a>`).join('')}
        ${matchedBrands.map((b) => `<a class="pill-btn" href="${shopUrl({ brand: b.name })}">برند: ${b.name}</a>`).join('')}
      </div>`;
    }

    html += matchedProducts
      .slice(0, 12)
      .map(
        (p) => `
      <div class="srow">
        <a class="s-th${p.isPackshot ? ' is-packshot' : ''}" href="${productUrl(p.id)}">
          <img src="${p.image}" alt="${p.name}" width="50" height="56">
        </a>
        <div class="s-meta">
          <b><a href="${productUrl(p.id)}">${p.name}</a></b>
          <small>${p.brand} · ${DATA.categories[p.cat]?.name || ''}</small>
        </div>
        <span class="price">${fa(p.price)} تومان</span>
        <button type="button" class="mini" data-add="${p.id}">افزودن</button>
      </div>`
      )
      .join('');

    if (matchedProducts.length > 12) {
      html += `<div style="text-align:center;padding-top:14px"><a class="btn ghost sm" href="${shopUrl({ q: query.trim() })}">مشاهده هر ${fa(matchedProducts.length)} نتیجه در فروشگاه</a></div>`;
    }
    resEl.innerHTML = html;
  }

  function openSearchWith(q = '') {
    openDialog('#searchDialog');
    const inp = $('#sInput');
    if (inp) {
      inp.value = q;
      runSearchRender(q);
      requestAnimationFrame(() => inp.focus());
    }
  }

  function initGlobalSearchEvents() {
    const inp = $('#sInput');
    const form = $('#globalSearchForm');
    if (inp) {
      inp.addEventListener('input', (e) => runSearchRender(e.target.value));
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        const val = (inp?.value || '').trim();
        if (!val) {
          e.preventDefault();
          toast('لطفاً نام کالا یا برند را وارد کنید');
          return;
        }
        state.recentSearches = [val, ...state.recentSearches.filter((x) => x !== val)].slice(0, 5);
        saveState();
      });
    }
    $('#searchDialog')?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-qc]');
      if (chip && inp) {
        inp.value = chip.dataset.qc;
        runSearchRender(chip.dataset.qc);
      }
    });
  }

  /* ---- Quick View Modal ---- */
  function openQuickView(id) {
    const p = getProduct(id);
    const body = $('#qvBody');
    if (!p || !body) return;

    let selectedShade = p.shades && p.shades[0] ? p.shades[0].name : '';
    let selectedSize = p.sizes && p.sizes[0] ? p.sizes[0].label : '';

    const render = () => {
      const sizeObj = (p.sizes || []).find((s) => s.label === selectedSize);
      const activePrice = p.price + (sizeObj ? sizeObj.priceDelta : 0);
      body.innerHTML = `
        <div class="qv-grid">
          <div class="qv-img${p.isPackshot ? ' is-packshot' : ''}">
            <img src="${p.image}" alt="${p.name}" width="360" height="360">
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="pdp-brand-pill">${p.brand}</span>
              <span class="mrate">${ICONS.star}<span>${faD(p.rating)} (${fa(p.reviewCount)} دیدگاه)</span></span>
            </div>
            <h2 class="fd" style="font-size:1.65rem;line-height:1.2">${p.name}</h2>
            <p style="font-size:.84rem;color:var(--ink2)">${p.description}</p>
            ${
              p.shades && p.shades.length
                ? `<div>
                    <small style="font-weight:700">رنگ انتخابی: ${selectedShade}</small>
                    <div class="swatch-row">
                      ${p.shades
                        .map(
                          (s) => `
                        <button type="button" class="swatch-btn${!s.stock ? ' oos' : ''}" data-qv-shade="${s.name}" aria-pressed="${selectedShade === s.name}" aria-label="${s.name}" style="background:${s.hex}"></button>`
                        )
                        .join('')}
                    </div>
                  </div>`
                : ''
            }
            ${
              p.sizes && p.sizes.length > 1
                ? `<div style="display:flex;gap:8px;flex-wrap:wrap">
                    ${p.sizes
                      .map(
                        (s) => `<button type="button" class="pill-btn${selectedSize === s.label ? ' on' : ''}" data-qv-size="${s.label}">${s.label}</button>`
                      )
                      .join('')}
                  </div>`
                : ''
            }
            <div class="pdp-price-row" style="margin-top:4px">
              <span class="pdp-price-now">${fa(activePrice)} <small style="font-size:.82rem">تومان</small></span>
              ${p.off ? `<span class="pdp-price-old">${fa(oldPrice(p))}</span><span class="pdp-off-pill">${fa(p.off)}٪</span>` : ''}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:auto;padding-top:8px">
              ${
                p.inStock
                  ? `<button type="button" class="btn rose" id="qvAddBtn" style="flex:1">افزودن به سبد خرید</button>`
                  : `<button type="button" class="btn" data-notify="${p.id}" style="flex:1">موجود شد خبرم کن</button>`
              }
              <a class="btn ghost" href="${productUrl(p.id)}">مشاهده صفحه کامل</a>
            </div>
          </div>
        </div>`;

      $$('[data-qv-shade]', body).forEach((b) =>
        b.addEventListener('click', () => {
          selectedShade = b.dataset.qvShade;
          render();
        })
      );
      $$('[data-qv-size]', body).forEach((b) =>
        b.addEventListener('click', () => {
          selectedSize = b.dataset.qvSize;
          render();
        })
      );
      $('#qvAddBtn', body)?.addEventListener('click', () => {
        addToCart(p.id, { shade: selectedShade, size: selectedSize });
        $('#quickViewDialog')?.close();
      });
    };

    render();
    openDialog('#quickViewDialog');
  }

  /* ---- OTP Auth Modal ---- */
  function openAuthDialog(onSuccess) {
    const body = $('#authBody');
    if (!body) return;
    let step = state.user.loggedIn ? 'logged' : 'phone';
    let enteredPhone = '';
    let resendSec = 60;
    let timerId;

    const render = () => {
      clearInterval(timerId);
      if (step === 'logged') {
        body.innerHTML = `
          <div style="text-align:center;padding:12px 0">
            <p style="font-weight:700;font-size:1rem">شما با نام «${state.user.name}» وارد شده‌اید.</p>
            <p style="font-size:.84rem;color:var(--ink2);margin:6px 0 18px">امتیاز رز کلاب شما: ${fa(state.user.points)} امتیاز</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <a class="btn rose" href="account.html">ورود به حساب کاربری</a>
              <button type="button" class="btn ghost" id="authLogoutBtn">خروج از حساب</button>
            </div>
          </div>`;
        $('#authLogoutBtn', body)?.addEventListener('click', () => {
          state.user.loggedIn = false;
          saveState();
          toast('از حساب کاربری خارج شدید');
          $('#authDialog')?.close();
        });
        return;
      }

      if (step === 'phone') {
        body.innerHTML = `
          <form id="otpPhoneForm" novalidate>
            <p style="font-size:.88rem;color:var(--ink2);margin-bottom:16px">برای مشاهده سفارش‌ها، پروفایل زیبایی و باشگاه مشتریان، شماره موبایل خود را وارد کنید.</p>
            <div class="field">
              <label for="authPhone">شماره موبایل</label>
              <span id="authPhoneHint" class="field-hint">۱۱ رقم با شروع ۰۹ (مثال: ۰۹۱۲۳۴۵۶۷۸۹)</span>
              <input type="tel" id="authPhone" name="mobile" inputmode="tel" autocomplete="tel" required pattern="^(09|\\+989)[0-9]{9}$" placeholder="09123456789" aria-describedby="authPhoneHint" data-error="authPhoneErr" dir="ltr" autofocus>
              <div id="authPhoneErr" class="field-error">لطفاً شماره موبایل معتبر ۱۱ رقمی با شروع 09 وارد کنید.</div>
            </div>
            <button type="submit" class="btn rose" style="width:100%">دریافت کد تایید پیامکی</button>
            <button type="button" class="btn ghost" id="authDemoBtn" style="width:100%;margin-top:8px">ورود سریع با حساب دمو رزالری</button>
          </form>`;

        initFormValidation(body);
        $('#otpPhoneForm', body).addEventListener('submit', (e) => {
          e.preventDefault();
          const inp = $('#authPhone', body);
          inp.value = toEnDigits(inp.value).replace(/\s+/g, '');
          if (!inp.reportValidity()) return;
          enteredPhone = inp.value;
          step = 'otp';
          resendSec = 60;
          render();
          toast('کد تایید آزمایشی ۱۲۳۴۵ پیامک شد');
        });
        $('#authDemoBtn', body).addEventListener('click', () => {
          state.user.loggedIn = true;
          saveState();
          toast(`خوش آمدید ${state.user.name}`);
          $('#authDialog')?.close();
          if (onSuccess) onSuccess();
        });
      } else {
        body.innerHTML = `
          <form id="otpCodeForm" novalidate>
            <p style="font-size:.86rem;color:var(--ink2);margin-bottom:14px">کد ۵ رقمی ارسال‌شده به شماره <b dir="ltr">${enteredPhone}</b> را وارد کنید (کد نمونه: <b>12345</b>).</p>
            <div class="field">
              <label for="authOtp">کد تایید یک‌بارمصرف</label>
              <span id="authOtpHint" class="field-hint">۵ رقم عددی پیامک‌شده</span>
              <!-- Single text input with numeric mode & one-time-code per modern-web-guidance -->
              <input type="text" id="authOtp" name="otp" inputmode="numeric" autocomplete="one-time-code" required pattern="\\d{5}" maxlength="5" placeholder="12345" aria-describedby="authOtpHint" data-error="authOtpErr" dir="ltr" style="letter-spacing:0.45em;text-align:center;font-weight:700" autofocus>
              <div id="authOtpErr" class="field-error">لطفاً کد ۵ رقمی معتبر وارد کنید.</div>
            </div>
            <button type="submit" class="btn rose" style="width:100%">تایید و ورود</button>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:.8rem">
              <button type="button" id="authEditPhone" style="color:var(--rose-deep);font-weight:600">تغییر شماره</button>
              <span id="otpTimer" style="color:var(--ink2)">ارسال مجدد تا ${fa(resendSec)} ثانیه</span>
            </div>
          </form>`;

        initFormValidation(body);
        timerId = setInterval(() => {
          resendSec--;
          const tEl = $('#otpTimer', body);
          if (!tEl) return clearInterval(timerId);
          if (resendSec <= 0) {
            clearInterval(timerId);
            tEl.innerHTML = `<button type="button" id="resendOtpBtn" style="color:var(--rose-deep);font-weight:700">ارسال مجدد کد</button>`;
            $('#resendOtpBtn', body)?.addEventListener('click', () => {
              resendSec = 60;
              render();
              toast('کد مجدد ارسال شد: ۱۲۳۴۵');
            });
          } else {
            tEl.textContent = `ارسال مجدد تا ${fa(resendSec)} ثانیه`;
          }
        }, 1000);

        $('#authEditPhone', body).addEventListener('click', () => {
          step = 'phone';
          render();
        });
        $('#otpCodeForm', body).addEventListener('submit', (e) => {
          e.preventDefault();
          const otpInp = $('#authOtp', body);
          otpInp.value = toEnDigits(otpInp.value).trim();
          if (!otpInp.reportValidity()) return;
          state.user.loggedIn = true;
          state.user.mobile = faD(enteredPhone);
          saveState();
          toast('ورود با موفقیت انجام شد');
          $('#authDialog')?.close();
          if (onSuccess) onSuccess();
        });
      }
    };

    render();
    openDialog('#authDialog');
  }

  /* ---- Back-in-Stock Notify Modal ---- */
  function openNotifyDialog(id) {
    const p = getProduct(id);
    const body = $('#notifyBody');
    if (!p || !body) return;
    body.innerHTML = `
      <form id="notifyForm" novalidate>
        <p style="font-size:.86rem;color:var(--ink2);margin-bottom:14px">به محض شارژ مجدد <b>«${p.name}»</b> در انبار رزالری به شما اطلاع می‌دهیم.</p>
        <div class="field">
          <label for="notifyContact">ایمیل یا شماره موبایل</label>
          <span id="notifyHint" class="field-hint">مثال: 09123456789 یا you@example.com</span>
          <input type="text" id="notifyContact" required minlength="6" autocomplete="email" aria-describedby="notifyHint" data-error="notifyErr" autofocus>
          <div id="notifyErr" class="field-error">لطفاً ایمیل یا شماره موبایل معتبر وارد کنید.</div>
        </div>
        <button type="submit" class="btn rose" style="width:100%">ثبت درخواست اطلاع‌رسانی</button>
      </form>`;
    initFormValidation(body);
    $('#notifyForm', body).addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = $('#notifyContact', body);
      if (!inp.reportValidity()) return;
      state.notifyRequests.push({ productId: p.id, contact: inp.value.trim() });
      saveState();
      $('#notifyDialog')?.close();
      toast('درخواست شما ثبت شد؛ به‌محض موجود شدن خبرتان می‌کنیم');
    });
    openDialog('#notifyDialog');
  }

  /* ---- Form Validation + :user-invalid ARIA Sync + Fallback ---- */
  function initFormValidation(root = document) {
    const hasNativeUserInvalid = CSS.supports('selector(:user-invalid)');
    const dirtyMap = new WeakMap();
    const flagged = new WeakSet();
    const announced = new WeakSet();

    const linkError = (el, shown) => {
      const errorId = el.dataset?.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const syncField = (el, shouldAnnounce = false, forceInvalid = false) => {
      if (!el?.matches?.('input, select, textarea') || el.type === 'hidden') return;
      let isInvalid = false;

      if (hasNativeUserInvalid) {
        isInvalid = forceInvalid ? !el.validity.valid : el.matches(':user-invalid');
      } else {
        const st = dirtyMap.get(el);
        isInvalid = (forceInvalid || (st?.interacted && st?.blurred)) && !el.validity.valid;
        el.classList.toggle('user-invalid-fallback', isInvalid);
        el.classList.toggle('user-valid-fallback', !isInvalid && Boolean(st?.blurred));
      }

      if (isInvalid) {
        if (shouldAnnounce && !announced.has(el)) {
          const errEl = el.dataset?.error ? document.getElementById(el.dataset.error) : null;
          const labelEl = el.labels?.[0];
          if (errEl) {
            announce(`${labelEl ? labelEl.textContent.trim() + ': ' : ''}${errEl.textContent.trim()}`, 450);
          }
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
        announced.delete(el);
      }
    };

    $$('input, select, textarea', root).forEach((el) => {
      if (el.type !== 'hidden' && !el.hasAttribute('aria-invalid')) {
        el.setAttribute('aria-invalid', 'false');
      }
    });

    root.addEventListener(
      'blur',
      (e) => {
        const el = e.target;
        if (!el?.matches?.('input, select, textarea')) return;
        const st = dirtyMap.get(el) || { interacted: false, blurred: false };
        st.blurred = true;
        dirtyMap.set(el, st);
        syncField(el, true);
      },
      true
    );

    root.addEventListener('input', (e) => {
      const el = e.target;
      if (!el?.matches?.('input, select, textarea')) return;
      const st = dirtyMap.get(el) || { interacted: false, blurred: false };
      st.interacted = true;
      dirtyMap.set(el, st);
      if (el.hasAttribute('aria-invalid')) syncField(el, false);
    });

    root.addEventListener(
      'change',
      (e) => {
        const el = e.target;
        if (!el?.matches?.('input, select, textarea')) return;
        dirtyMap.set(el, { interacted: true, blurred: true });
        syncField(el, true);
      },
      true
    );

    root.addEventListener(
      'invalid',
      (e) => {
        const el = e.target;
        dirtyMap.set(el, { interacted: true, blurred: true });
        announced.add(el);
        syncField(el, false, true);
      },
      true
    );
  }

  /* ---- Accessible Tabs Controller ---- */
  function initTabs(container, onSwitch) {
    if (!container) return;
    const tablist = $('[role="tablist"]', container);
    const tabs = $$('[role="tab"]', tablist);
    const panels = $$('[role="tabpanel"]', container);
    if (!tabs.length) return;

    const selectTab = (tab, moveFocus = false) => {
      tabs.forEach((t, idx) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        if (panels[idx]) panels[idx].hidden = !selected;
      });
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      if (moveFocus) tab.focus();
      if (onSwitch) onSwitch(tab, tabs.indexOf(tab));
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => selectTab(tab, false));
    });

    tablist.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(document.activeElement);
      if (idx < 0) return;
      const isRtl = getComputedStyle(tablist).direction === 'rtl';
      let nextIdx = null;
      if (e.key === 'ArrowLeft') nextIdx = (idx + (isRtl ? 1 : -1) + tabs.length) % tabs.length;
      else if (e.key === 'ArrowRight') nextIdx = (idx + (isRtl ? -1 : 1) + tabs.length) % tabs.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabs.length - 1;
      if (nextIdx !== null) {
        e.preventDefault();
        selectTab(tabs[nextIdx], true);
      }
    });
  }

  /* ---- Global Click Delegation & Header Scroll ---- */
  function bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        addToCart(addBtn.dataset.add);
        return;
      }
      const favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        toggleWishlist(favBtn.dataset.fav);
        return;
      }
      const qvBtn = e.target.closest('[data-qv]');
      if (qvBtn) {
        openQuickView(qvBtn.dataset.qv);
        return;
      }
      const notifyBtn = e.target.closest('[data-notify]');
      if (notifyBtn) {
        openNotifyDialog(notifyBtn.dataset.notify);
        return;
      }
      const qtyBtn = e.target.closest('[data-cart-qty]');
      if (qtyBtn) {
        updateCartQty(Number(qtyBtn.dataset.idx), Number(qtyBtn.dataset.cartQty));
        return;
      }
      const delBtn = e.target.closest('[data-cart-del]');
      if (delBtn) {
        removeCartItem(Number(delBtn.dataset.cartDel));
        return;
      }
      if (e.target.closest('[data-open-cart], #openCart')) {
        renderCartDrawer();
        openDialog('#cartDialog');
        return;
      }
      if (e.target.closest('[data-open-fav], #openFav')) {
        renderWishlistDrawer();
        openDialog('#favDialog');
        return;
      }
      if (e.target.closest('[data-open-nav], #openNav')) {
        openDialog('#navDialog');
        return;
      }
      if (e.target.closest('[data-open-search], #openSearch')) {
        openSearchWith('');
        return;
      }
      if (e.target.closest('[data-open-auth]')) {
        e.preventDefault();
        openAuthDialog();
        return;
      }
      const closeBtn = e.target.closest('[data-close-dialog]');
      if (closeBtn) {
        closeBtn.closest('dialog')?.close();
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        $('#hdr')?.classList.toggle('scrolled', window.scrollY > 10);
      },
      { passive: true }
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    $$('.rv').forEach((el) => io.observe(el));
  }

  /* ---- Dark Mode Toggle (Meta + localStorage + OS media query sync) ---- */
  function initColorSchemeToggle() {
    const meta = document.querySelector('meta[name="color-scheme"]');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const mq = matchMedia('(prefers-color-scheme: dark)');

    const getStored = () => {
      try {
        const v = localStorage.getItem('color-scheme');
        return v === 'light' || v === 'dark' ? v : null;
      } catch {
        return null;
      }
    };

    const resolvedScheme = () => {
      const m = meta?.content;
      if (m === 'light' || m === 'dark') return m;
      return mq.matches ? 'dark' : 'light';
    };

    const syncUi = () => {
      const active = resolvedScheme();
      if (themeColorMeta) themeColorMeta.content = active === 'dark' ? '#0E0A0E' : '#FAF7F2';
      $$('[data-theme-toggle]').forEach((btn) => {
        btn.setAttribute('aria-pressed', String(active === 'dark'));
        btn.setAttribute('aria-label', active === 'dark' ? 'فعال‌سازی حالت روز' : 'فعال‌سازی حالت شب');
      });
    };

    syncUi();

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn || !meta) return;
      const target = resolvedScheme() === 'dark' ? 'light' : 'dark';
      const system = mq.matches ? 'dark' : 'light';
      try {
        if (target === system) localStorage.removeItem('color-scheme');
        else localStorage.setItem('color-scheme', target);
      } catch {}
      meta.content = target === system ? 'light dark' : target;
      syncUi();
      toast(target === 'dark' ? 'حالت شب رزالری فعال شد' : 'حالت روز رزالری فعال شد');
    });

    mq.addEventListener('change', () => {
      if (!getStored() && meta) meta.content = 'light dark';
      syncUi();
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'color-scheme' && meta) {
        const next = getStored();
        meta.content = next || 'light dark';
        syncUi();
      }
    });
  }

  /* ---- Boot Shared Shell ---- */
  function init() {
    injectSharedShell();
    initColorSchemeToggle();
    bindGlobalEvents();
    initFormValidation(document);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    DATA,
    ICONS,
    $,
    $$,
    fa,
    faD,
    toEnDigits,
    normalizeFa,
    oldPrice,
    getProduct,
    productUrl,
    shopUrl,
    getState: () => state,
    setState: (updater) => {
      state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
      saveState();
    },
    subscribe,
    getCartTotals,
    addToCart,
    updateCartQty,
    removeCartItem,
    toggleWishlist,
    trackRecentlyViewed,
    applyPromoCode,
    renderProductCard,
    syncWishlistButtons,
    openDialog,
    openSearchWith,
    openQuickView,
    openAuthDialog,
    openNotifyDialog,
    initFormValidation,
    initTabs,
    toast,
    announce
  };
})();
