/* ================================================================
   pages.js — Page Controllers for All Rosallery (رزالری) Templates
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const R = window.Rosallery;
  if (!R) return;
  const {
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
    renderProductCard,
    openDialog,
    initFormValidation,
    initTabs,
    toast
  } = R;

  const page = document.body.dataset.page;
  if (!page || page === 'home') return;

  const params = new URLSearchParams(location.search);

  /* ================================================================
     1. SHOP / CATEGORY & FACETED FILTER PAGE (shop.html)
     ================================================================ */
  if (page === 'shop') {
    const stateFilter = {
      cat: params.get('cat') || '',
      brand: params.get('brand') ? [params.get('brand')] : [],
      skin: params.get('skin') ? [params.get('skin')] : [],
      finish: [],
      priceMax: Number(params.get('max')) || 0,
      deals: params.get('deals') === '1',
      isNew: params.get('new') === '1',
      inStockOnly: false,
      q: params.get('q') || '',
      sort: params.get('sort') || 'featured',
      view: 'grid',
      pageLimit: 12
    };

    const gridEl = $('#plpGrid');
    const countEl = $('#plpCount');
    const chipsEl = $('#activeFilterChips');
    const titleEl = $('#plpTitle');
    const leadEl = $('#plpLead');
    const crumbEl = $('#plpCrumb');
    const loadMoreBtn = $('#plpLoadMore');

    const allSkins = ['خشک', 'معمولی', 'چرب', 'مختلط', 'حساس'];
    const allFinishes = ['مات', 'مخملی', 'براق', 'طبیعی', 'سرم سبک', 'تخصصی'];
    const allBrands = [...new Set(DATA.products.map((p) => p.brand))];

    function buildFilterHtml() {
      return `
        <div class="filter-head">
          <h2>فیلترها</h2>
          <button type="button" class="filter-clear" data-clear-filters>پاک کردن همه</button>
        </div>
        <details class="filter-group" open>
          <summary>دسته‌بندی</summary>
          <div class="filter-options">
            <label class="f-check"><input type="radio" name="fcat" value="" ${!stateFilter.cat ? 'checked' : ''}><span>همه دسته‌ها</span><span class="f-count">${fa(DATA.products.length)}</span></label>
            ${Object.values(DATA.categories)
              .map(
                (c) => `
              <label class="f-check">
                <input type="radio" name="fcat" value="${c.key}" ${stateFilter.cat === c.key ? 'checked' : ''}>
                <span>${c.name}</span>
                <span class="f-count">${fa(DATA.products.filter((p) => p.cat === c.key).length)}</span>
              </label>`
              )
              .join('')}
          </div>
        </details>
        <details class="filter-group" open>
          <summary>برند</summary>
          <div class="filter-options">
            ${allBrands
              .map(
                (b) => `
              <label class="f-check">
                <input type="checkbox" name="fbrand" value="${b}" ${stateFilter.brand.includes(b) ? 'checked' : ''}>
                <span>${b}</span>
                <span class="f-count">${fa(DATA.products.filter((p) => p.brand === b).length)}</span>
              </label>`
              )
              .join('')}
          </div>
        </details>
        <details class="filter-group" open>
          <summary>محدوده قیمت</summary>
          <div class="price-presets">
            <button type="button" class="pill-btn${stateFilter.priceMax === 0 ? ' on' : ''}" data-pmax="0">همه</button>
            <button type="button" class="pill-btn${stateFilter.priceMax === 500000 ? ' on' : ''}" data-pmax="500000">تا ۵۰۰ هزار</button>
            <button type="button" class="pill-btn${stateFilter.priceMax === 1000000 ? ' on' : ''}" data-pmax="1000000">تا ۱ میلیون</button>
            <button type="button" class="pill-btn${stateFilter.priceMax === 2500000 ? ' on' : ''}" data-pmax="2500000">تا ۲.۵ میلیون</button>
          </div>
        </details>
        <details class="filter-group">
          <summary>نوع پوست</summary>
          <div class="filter-options">
            ${allSkins
              .map(
                (sk) => `
              <label class="f-check">
                <input type="checkbox" name="fskin" value="${sk}" ${stateFilter.skin.includes(sk) ? 'checked' : ''}>
                <span>${sk}</span>
              </label>`
              )
              .join('')}
          </div>
        </details>
        <details class="filter-group">
          <summary>جلوه و بافت (Finish)</summary>
          <div class="filter-options">
            ${allFinishes
              .map(
                (fn) => `
              <label class="f-check">
                <input type="checkbox" name="ffinish" value="${fn}" ${stateFilter.finish.includes(fn) ? 'checked' : ''}>
                <span>${fn}</span>
              </label>`
              )
              .join('')}
          </div>
        </details>
        <details class="filter-group" open>
          <summary>وضعیت عرضه</summary>
          <div class="filter-options">
            <label class="f-check"><input type="checkbox" name="fdeals" ${stateFilter.deals ? 'checked' : ''}><span>فقط شگفت‌انگیزها (تخفیف‌دار)</span></label>
            <label class="f-check"><input type="checkbox" name="fnew" ${stateFilter.isNew ? 'checked' : ''}><span>تازه‌های رزالری</span></label>
            <label class="f-check"><input type="checkbox" name="fstock" ${stateFilter.inStockOnly ? 'checked' : ''}><span>فقط کالاهای موجود</span></label>
          </div>
        </details>`;
    }

    function syncFilterSidebars() {
      const html = buildFilterHtml();
      const desktopBox = $('#filterSidebar');
      const mobileBox = $('#mobileFilterBody');
      if (desktopBox) desktopBox.innerHTML = html;
      if (mobileBox) mobileBox.innerHTML = html;
    }

    function syncUrl() {
      const u = new URLSearchParams();
      if (stateFilter.cat) u.set('cat', stateFilter.cat);
      if (stateFilter.brand.length === 1) u.set('brand', stateFilter.brand[0]);
      if (stateFilter.deals) u.set('deals', '1');
      if (stateFilter.isNew) u.set('new', '1');
      if (stateFilter.q) u.set('q', stateFilter.q);
      if (stateFilter.sort !== 'featured') u.set('sort', stateFilter.sort);
      const next = u.toString() ? `?${u.toString()}` : location.pathname;
      history.replaceState(null, '', next);
    }

    function applyFilters() {
      let list = [...DATA.products];
      if (stateFilter.cat) list = list.filter((p) => p.cat === stateFilter.cat);
      if (stateFilter.brand.length) list = list.filter((p) => stateFilter.brand.includes(p.brand));
      if (stateFilter.skin.length) list = list.filter((p) => stateFilter.skin.some((s) => (p.skinTypes || []).includes(s)));
      if (stateFilter.finish.length) list = list.filter((p) => stateFilter.finish.includes(p.finish));
      if (stateFilter.priceMax > 0) list = list.filter((p) => p.price <= stateFilter.priceMax);
      if (stateFilter.deals) list = list.filter((p) => p.off > 0);
      if (stateFilter.isNew) list = list.filter((p) => p.isNew);
      if (stateFilter.inStockOnly) list = list.filter((p) => p.inStock);
      if (stateFilter.q) {
        const q = normalizeFa(stateFilter.q);
        list = list.filter((p) =>
          normalizeFa(`${p.name} ${p.nameEn} ${p.brand} ${p.brandEn} ${p.subcat} ${DATA.categories[p.cat]?.name || ''}`).includes(q)
        );
      }

      if (stateFilter.sort === 'bestseller') list.sort((a, b) => b.soldCount - a.soldCount);
      else if (stateFilter.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
      else if (stateFilter.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
      else if (stateFilter.sort === 'discount') list.sort((a, b) => b.off - a.off);
      else if (stateFilter.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      else if (stateFilter.sort === 'newest') list.sort((a, b) => Number(b.isNew) - Number(a.isNew));

      // Header & Breadcrumb
      const catObj = DATA.categories[stateFilter.cat];
      if (stateFilter.q) {
        titleEl.textContent = `نتایج جستجو برای «${stateFilter.q}»`;
        leadEl.textContent = 'محصولات منطبق با جستجوی شما در کالکشن رزالری.';
        crumbEl.textContent = 'جستجو';
      } else if (stateFilter.deals) {
        titleEl.textContent = 'شگفت‌انگیزهای امروز رزالری';
        leadEl.textContent = 'تخفیف‌های ویژه محدود با تضمین ۱۰۰٪ اصالت کالا و کد سیب سلامت.';
        crumbEl.textContent = 'شگفت‌انگیزها';
      } else if (catObj) {
        titleEl.textContent = catObj.name;
        leadEl.textContent = catObj.caption;
        crumbEl.textContent = catObj.name;
      } else if (stateFilter.brand.length === 1) {
        titleEl.textContent = `محصولات برند ${stateFilter.brand[0]}`;
        leadEl.textContent = 'مجموعه کامل کالاهای اصل با ضمانت مستقیم برند.';
        crumbEl.textContent = stateFilter.brand[0];
      } else {
        titleEl.textContent = 'فروشگاه جامع زیبایی رزالری';
        leadEl.textContent = 'تمامی محصولات آرایش صورت، مراقبت پوست، لب، مو و ناخن از برترین برندهای دنیا.';
        crumbEl.textContent = 'فروشگاه';
      }

      countEl.textContent = `${fa(list.length)} کالا`;

      // Active Chips
      const chips = [];
      if (catObj) chips.push({ label: `دسته: ${catObj.name}`, key: 'cat' });
      stateFilter.brand.forEach((b) => chips.push({ label: `برند: ${b}`, key: 'brand', val: b }));
      stateFilter.skin.forEach((s) => chips.push({ label: `پوست: ${s}`, key: 'skin', val: s }));
      stateFilter.finish.forEach((f) => chips.push({ label: `بافت: ${f}`, key: 'finish', val: f }));
      if (stateFilter.priceMax) chips.push({ label: `سقف ${fa(stateFilter.priceMax)} تومان`, key: 'priceMax' });
      if (stateFilter.deals) chips.push({ label: 'فقط تخفیف‌دارها', key: 'deals' });
      if (stateFilter.isNew) chips.push({ label: 'تازه‌ها', key: 'isNew' });
      if (stateFilter.inStockOnly) chips.push({ label: 'فقط موجود', key: 'inStockOnly' });
      if (stateFilter.q) chips.push({ label: `جستجو: ${stateFilter.q}`, key: 'q' });

      chipsEl.innerHTML = chips
        .map(
          (ch) =>
            `<button type="button" class="active-chip" data-drop-chip="${ch.key}" data-val="${ch.val || ''}">${ch.label} ×</button>`
        )
        .join('');

      const shown = list.slice(0, stateFilter.pageLimit);
      gridEl.classList.toggle('is-list', stateFilter.view === 'list');
      gridEl.innerHTML = shown.length
        ? shown.map((p, i) => renderProductCard(p, { index: i })).join('')
        : `<div class="surface-card" style="grid-column:1/-1;text-align:center;padding:44px">
             <p style="font-weight:700;font-size:1.05rem;margin-bottom:10px">محصولی با فیلترهای انتخاب‌شده پیدا نشد.</p>
             <button type="button" class="btn rose" data-clear-filters>نمایش همه محصولات</button>
           </div>`;

      if (loadMoreBtn) {
        loadMoreBtn.hidden = list.length <= stateFilter.pageLimit;
        loadMoreBtn.textContent = `نمایش محصولات بیشتر (${fa(list.length - shown.length)} کالای باقیمانده)`;
      }
      syncUrl();
    }

    function handleFilterInteraction(root) {
      root.addEventListener('change', (e) => {
        const t = e.target;
        if (t.name === 'fcat') stateFilter.cat = t.value;
        else if (t.name === 'fbrand') {
          stateFilter.brand = $$('input[name="fbrand"]:checked', root).map((x) => x.value);
        } else if (t.name === 'fskin') {
          stateFilter.skin = $$('input[name="fskin"]:checked', root).map((x) => x.value);
        } else if (t.name === 'ffinish') {
          stateFilter.finish = $$('input[name="ffinish"]:checked', root).map((x) => x.value);
        } else if (t.name === 'fdeals') stateFilter.deals = t.checked;
        else if (t.name === 'fnew') stateFilter.isNew = t.checked;
        else if (t.name === 'fstock') stateFilter.inStockOnly = t.checked;
        stateFilter.pageLimit = 12;
        syncFilterSidebars();
        applyFilters();
      });
      root.addEventListener('click', (e) => {
        const pBtn = e.target.closest('[data-pmax]');
        if (pBtn) {
          stateFilter.priceMax = Number(pBtn.dataset.pmax);
          syncFilterSidebars();
          applyFilters();
          return;
        }
        if (e.target.closest('[data-clear-filters]')) {
          Object.assign(stateFilter, {
            cat: '', brand: [], skin: [], finish: [], priceMax: 0, deals: false, isNew: false, inStockOnly: false, q: ''
          });
          syncFilterSidebars();
          applyFilters();
        }
      });
    }

    syncFilterSidebars();
    handleFilterInteraction($('#filterSidebar'));
    handleFilterInteraction($('#mobileFilterBody'));
    applyFilters();

    $('#plpSort')?.addEventListener('change', (e) => {
      stateFilter.sort = e.target.value;
      applyFilters();
    });
    $$('[data-view]').forEach((b) =>
      b.addEventListener('click', () => {
        stateFilter.view = b.dataset.view;
        $$('[data-view]').forEach((x) => x.classList.toggle('on', x === b));
        applyFilters();
      })
    );
    chipsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-drop-chip]');
      if (!btn) return;
      const k = btn.dataset.dropChip;
      const v = btn.dataset.val;
      if (Array.isArray(stateFilter[k])) stateFilter[k] = stateFilter[k].filter((x) => x !== v);
      else if (typeof stateFilter[k] === 'boolean') stateFilter[k] = false;
      else stateFilter[k] = typeof stateFilter[k] === 'number' ? 0 : '';
      syncFilterSidebars();
      applyFilters();
    });
    loadMoreBtn?.addEventListener('click', () => {
      stateFilter.pageLimit += 12;
      applyFilters();
    });
    $('#openFilterBtn')?.addEventListener('click', () => openDialog('#filterDialog'));
  }

  /* ================================================================
     2. PRODUCT DETAIL PAGE (product.html)
     ================================================================ */
  if (page === 'product') {
    const pid = Number(params.get('id')) || 1;
    const p = getProduct(pid) || DATA.products[0];
    R.trackRecentlyViewed(p.id);
    document.title = `${p.name} — رزالری | Rosallery`;

    let activeImg = p.gallery?.[0] || p.image;
    let activeShade = p.shades?.[0]?.name || '';
    let activeSize = p.sizes?.[0]?.label || '';
    let qty = 1;

    const st = R.getState();
    const allReviews = [...(p.reviews || []), ...(st.customReviews[p.id] || [])];
    const allQna = [...(p.qna || []), ...(st.customQna[p.id] || [])];

    const cat = DATA.categories[p.cat];
    $('#pdpCrumbCat').textContent = cat?.name || 'محصولات';
    $('#pdpCrumbCat').href = shopUrl({ cat: p.cat });
    $('#pdpCrumbName').textContent = p.name;

    function renderPDP() {
      const sizeObj = (p.sizes || []).find((s) => s.label === activeSize);
      const currentPrice = p.price + (sizeObj ? sizeObj.priceDelta : 0);
      const oldP = p.off ? Math.round((currentPrice * 100) / (100 - p.off)) : currentPrice;
      const installment = Math.round(currentPrice / 4);
      const isFav = R.getState().wishlist.includes(p.id);
      const gallery = p.gallery?.length ? p.gallery : [p.image];
      const shadeObj = (p.shades || []).find((s) => s.name === activeShade);

      $('#pdpRoot').innerHTML = `
        <div class="pdp-grid">
          <div class="pdp-gallery">
            <div class="pdp-stage${p.isPackshot ? ' is-packshot' : ''}">
              <img id="pdpMainImg" src="${activeImg}" alt="${p.name}" width="600" height="600" fetchpriority="high">
              ${p.off ? `<span class="moff">${fa(p.off)}٪</span>` : ''}
            </div>
            ${
              gallery.length > 1
                ? `<div class="pdp-thumbs">
                    ${gallery
                      .map(
                        (img) => `
                      <button type="button" class="pdp-thumb${p.isPackshot ? ' is-packshot' : ''}${activeImg === img ? ' on' : ''}" data-gal="${img}" aria-label="نمای محصول">
                        <img src="${img}" alt="" width="76" height="76">
                      </button>`
                      )
                      .join('')}
                  </div>`
                : ''
            }
          </div>

          <div class="pdp-buybox">
            <div class="pdp-brand-row">
              <a class="pdp-brand-pill" href="${shopUrl({ brand: p.brand })}">${p.brand} · <span lang="en">${p.brandEn}</span></a>
              <span class="pdp-sku">کد کالا: ${p.sku}</span>
            </div>
            <h1>${p.name}</h1>
            <p class="pdp-en" lang="en">${p.nameEn}</p>

            <div class="pdp-rating-row">
              <span class="stars" aria-label="امتیاز ${faD(p.rating)} از ۵">★★★★★</span>
              <b>${faD(p.rating)}</b>
              <a href="#pdpTabs" data-jump-tab="tab-reviews" style="color:var(--rose-deep);font-weight:600">${fa(p.reviewCount + (st.customReviews[p.id]?.length || 0))} دیدگاه خریداران</a>
              <span>·</span>
              <span>${fa(p.soldCount)} فروش موفق</span>
            </div>

            <div class="pdp-badges">
              ${(p.badges || []).map((b) => `<span class="pdp-badge">✓ ${b}</span>`).join('')}
            </div>

            <div class="pdp-variants">
              ${
                p.shades && p.shades.length
                  ? `<div>
                      <div style="display:flex;justify-content:space-between;font-size:.86rem">
                        <span><b>انتخاب رنگ:</b> ${activeShade}</span>
                        ${shadeObj?.undertone ? `<span style="color:var(--ink2)">زیرتون: ${shadeObj.undertone}</span>` : ''}
                      </div>
                      <div class="swatch-row">
                        ${p.shades
                          .map(
                            (s) => `
                          <button type="button" class="swatch-btn${!s.stock ? ' oos' : ''}" data-shade="${s.name}" aria-pressed="${activeShade === s.name}" aria-label="${s.name}${!s.stock ? ' (ناموجود)' : ''}" style="background:${s.hex}"></button>`
                          )
                          .join('')}
                      </div>
                    </div>`
                  : ''
              }
              ${
                p.sizes && p.sizes.length
                  ? `<div>
                      <b style="font-size:.86rem;display:block;margin-bottom:8px">حجم / بسته‌بندی:</b>
                      <div style="display:flex;gap:8px;flex-wrap:wrap">
                        ${p.sizes
                          .map(
                            (s) => `<button type="button" class="pill-btn${activeSize === s.label ? ' on' : ''}" data-size="${s.label}">${s.label}</button>`
                          )
                          .join('')}
                      </div>
                    </div>`
                  : ''
              }
            </div>

            <div class="pdp-price-card">
              <div class="pdp-price-row">
                <span class="pdp-price-now">${fa(currentPrice)} <small style="font-size:.9rem">تومان</small></span>
                ${p.off ? `<span class="pdp-price-old">${fa(oldP)} تومان</span><span class="pdp-off-pill">${fa(p.off)}٪ تخفیف</span>` : ''}
              </div>
              <div class="pdp-bnpl">
                <span>پرداخت اقساطی اسنپ‌پی: <b>۴ قسط ماهیانه ${fa(installment)} تومان</b> (بدون کارمزد)</span>
              </div>
            </div>

            <div class="pdp-cta-row">
              <div class="qty" style="min-height:48px;padding:4px 12px;margin:0">
                <button type="button" id="pdpQtyMinus" aria-label="کاهش تعداد">−</button>
                <span id="pdpQtyVal">${fa(qty)}</span>
                <button type="button" id="pdpQtyPlus" aria-label="افزایش تعداد">+</button>
              </div>
              ${
                p.inStock && (!shadeObj || shadeObj.stock)
                  ? `<button type="button" class="btn rose" id="pdpAddBtn">${ICONS.bag} افزودن به سبد خرید</button>`
                  : `<button type="button" class="btn" data-notify="${p.id}" style="flex:1;min-height:50px">ناموجود — موجود شد خبرم کن</button>`
              }
              <button type="button" class="btn ghost${isFav ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="علاقه‌مندی">
                ${ICONS.heart} <span>${isFav ? 'ذخیره‌شده' : 'علاقه‌مندی'}</span>
              </button>
              <button type="button" class="btn ghost" id="pdpShareBtn" aria-label="کپی لینک محصول">اشتراک‌گذاری</button>
            </div>

            <div class="pdp-trust-grid">
              <div class="pdp-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l7 2.5V11c0 4.8-3 7.6-7 9-4-1.4-7-4.2-7-9V5.5z"/><path d="M9 11.5l2 2 4-4"/></svg><span><b>کد سیب سلامت:</b> ${p.sibSalamat}</span></div>
              <div class="pdp-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 7h11v8H2z"/><path d="M13 10h4.5L21 13.5V15h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg><span><b>ارسال سریع:</b> ۲۴ ساعته تهران و ۲-۴ روزه ایران</span></div>
              <div class="pdp-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 10a8 8 0 0 1 14-4l2 2M20 4v4h-4"/><path d="M20 14a8 8 0 0 1-14 4l-2-2"/></svg><span><b>۷ روز ضمانت بازگشت</b> کالای پلمپ</span></div>
              <div class="pdp-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span><b>انقضا پس از باز شدن:</b> <span lang="en">${p.pao}</span></span></div>
            </div>
          </div>
        </div>`;

      $$('[data-gal]').forEach((b) =>
        b.addEventListener('click', () => {
          activeImg = b.dataset.gal;
          renderPDP();
        })
      );
      $$('[data-shade]').forEach((b) =>
        b.addEventListener('click', () => {
          activeShade = b.dataset.shade;
          renderPDP();
        })
      );
      $$('[data-size]').forEach((b) =>
        b.addEventListener('click', () => {
          activeSize = b.dataset.size;
          renderPDP();
        })
      );
      $('#pdpQtyMinus')?.addEventListener('click', () => {
        qty = Math.max(1, qty - 1);
        $('#pdpQtyVal').textContent = fa(qty);
      });
      $('#pdpQtyPlus')?.addEventListener('click', () => {
        qty++;
        $('#pdpQtyVal').textContent = fa(qty);
      });
      $('#pdpAddBtn')?.addEventListener('click', () => {
        R.addToCart(p.id, { shade: activeShade, size: activeSize, qty });
      });
      $('#pdpShareBtn')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(location.href);
        } catch { /* ignore */ }
        toast('لینک صفحه محصول کپی شد');
      });
      $$('[data-jump-tab]').forEach((a) =>
        a.addEventListener('click', () => {
          $(`#${a.dataset.jumpTab}`)?.click();
        })
      );
    }

    function renderPDPTabs() {
      const customRevs = R.getState().customReviews[p.id] || [];
      const revs = [...(p.reviews || []), ...customRevs];
      const qnas = [...(p.qna || []), ...(R.getState().customQna[p.id] || [])];

      $('#tabOverviewPanel').innerHTML = `
        <div class="surface-card">
          <h2 class="fd" style="font-size:1.7rem;margin-bottom:10px">توضیحات تخصصی محصول</h2>
          <p style="margin-bottom:14px">${p.description}</p>
          <table class="spec-table">
            <tbody>
              <tr><th scope="row">مناسب نوع پوست</th><td>${(p.skinTypes || []).join('، ')}</td></tr>
              <tr><th scope="row">جلوه نهایی (Finish)</th><td>${p.finish}</td></tr>
              <tr><th scope="row">کشور مبدا برند</th><td>${p.origin}</td></tr>
              <tr><th scope="row">شماره پروانه / سیب سلامت</th><td>${p.sibSalamat}</td></tr>
              <tr><th scope="row">ماندگاری پس از باز شدن (PAO)</th><td lang="en">${p.pao}</td></tr>
            </tbody>
          </table>
        </div>`;

      $('#tabInciPanel').innerHTML = `
        <div class="surface-card">
          <h2 class="fd" style="font-size:1.7rem;margin-bottom:10px">ترکیبات موثر و لیست کامل INCI</h2>
          <div class="pdp-badges" style="margin-bottom:12px">
            ${(p.keyActives || []).map((k) => `<span class="pdp-badge" style="background:var(--blush);color:var(--rose-deep)">★ ${k}</span>`).join('')}
          </div>
          <div class="inci-box" lang="en"><strong>INCI:</strong> ${p.inci}</div>
        </div>`;

      $('#tabUsagePanel').innerHTML = `
        <div class="surface-card">
          <h2 class="fd" style="font-size:1.7rem;margin-bottom:10px">روش مصرف و جایگاه در روتین</h2>
          <p>${p.howToUse}</p>
          <div class="tip-callout" style="margin-top:14px">
            پیشنهاد تیم زیبایی رزالری: برای بهترین نتیجه، محصولات هم‌خانواده را از طریق <a href="routine.html" style="color:var(--rose-deep);text-decoration:underline;font-weight:700">سازنده روتین رزالری</a> ست کنید.
          </div>
        </div>`;

      $('#tabReviewsPanel').innerHTML = `
        <div class="surface-card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
            <div>
              <h2 class="fd" style="font-size:1.7rem">دیدگاه و تجربه خریداران (${fa(p.reviewCount + customRevs.length)})</h2>
              <p style="font-size:.84rem;color:var(--ink2)">میانگین رضایت: <b>${faD(p.rating)}</b> از ۵ ستاره</p>
            </div>
          </div>
          <div class="review-list">
            ${
              revs.length
                ? revs
                    .map(
                      (r) => `
                  <article class="review-card">
                    <div class="review-head">
                      <div><b>${r.author}</b> · <small style="color:var(--ink2)">${r.date} · ${r.skinType || ''}${r.shade ? ' · رنگ: ' + r.shade : ''}</small></div>
                      ${r.verified ? '<span class="verified-tag">✓ خریدار تاییدشده</span>' : ''}
                    </div>
                    <div class="stars" aria-label="${fa(r.rating)} ستاره">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                    <p style="margin-top:6px;font-size:.9rem">${r.text}</p>
                  </article>`
                    )
                    .join('')
                : '<p style="color:var(--ink2)">هنوز دیدگاه متنی ثبت نشده است؛ اولین نفر باشید!</p>'
            }
          </div>
          <form id="addReviewForm" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)" novalidate>
            <h3 class="fd" style="font-size:1.45rem;margin-bottom:12px">ثبت دیدگاه شما</h3>
            <div class="two-col-form">
              <div class="field">
                <label for="revAuthor">نام شما</label>
                <input id="revAuthor" required autocomplete="name" data-error="revAuthorErr">
                <div id="revAuthorErr" class="field-error">لطفاً نام خود را وارد کنید.</div>
              </div>
              <div class="field">
                <label for="revSkin">نوع پوست / مو</label>
                <select id="revSkin">
                  <option value="پوست خشک">پوست خشک</option>
                  <option value="پوست معمولی">پوست معمولی</option>
                  <option value="پوست چرب">پوست چرب</option>
                  <option value="پوست مختلط">پوست مختلط</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label for="revRating">امتیاز شما</label>
              <select id="revRating">
                <option value="5">۵ ستاره — عالی</option>
                <option value="4">۴ ستاره — خوب</option>
                <option value="3">۳ ستاره — متوسط</option>
              </select>
            </div>
            <div class="field">
              <label for="revText">نظر شما درباره این محصول</label>
              <textarea id="revText" required minlength="10" data-error="revTextErr" placeholder="تجربه خود از بافت، ماندگاری یا رنگ را بنویسید…"></textarea>
              <div id="revTextErr" class="field-error">لطفاً حداقل ۱۰ کاراکتر نظر بنویسید.</div>
            </div>
            <button type="submit" class="btn rose">ارسال دیدگاه</button>
          </form>
        </div>`;

      initFormValidation($('#tabReviewsPanel'));
      $('#addReviewForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.reportValidity()) return;
        const rev = {
          author: $('#revAuthor').value.trim(),
          skinType: $('#revSkin').value,
          rating: Number($('#revRating').value),
          text: $('#revText').value.trim(),
          shade: activeShade || activeSize,
          date: 'امروز',
          verified: R.getState().user.loggedIn
        };
        R.setState((s) => ({
          ...s,
          customReviews: { ...s.customReviews, [p.id]: [rev, ...(s.customReviews[p.id] || [])] }
        }));
        toast('دیدگاه ارزشمند شما با موفقیت ثبت شد');
        renderPDPTabs();
      });

      $('#tabQnaPanel').innerHTML = `
        <div class="surface-card">
          <h2 class="fd" style="font-size:1.7rem;margin-bottom:12px">پرسش و پاسخ محصول</h2>
          <div class="review-list">
            ${
              qnas.length
                ? qnas
                    .map(
                      (q) => `
                  <article class="review-card">
                    <p style="font-weight:700">پرسش: ${q.q}</p>
                    <p style="margin-top:6px;color:var(--ink2);font-size:.88rem">پاسخ مشاور رزالری: ${q.a}</p>
                  </article>`
                    )
                    .join('')
                : '<p style="color:var(--ink2)">سوالی ثبت نشده است؛ سوال خود را بپرسید تا مشاورین ما پاسخ دهند.</p>'
            }
          </div>
          <form id="addQnaForm" style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line)" novalidate>
            <div class="field">
              <label for="qnaInput">پرسش شما از متخصصین رزالری</label>
              <textarea id="qnaInput" required minlength="8" data-error="qnaErr" placeholder="سوال خود درباره نحوه مصرف یا سازگاری محصول را بنویسید…"></textarea>
              <div id="qnaErr" class="field-error">لطفاً متن پرسش را وارد کنید.</div>
            </div>
            <button type="submit" class="btn ghost">ثبت پرسش</button>
          </form>
        </div>`;

      initFormValidation($('#tabQnaPanel'));
      $('#addQnaForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.reportValidity()) return;
        const item = {
          q: $('#qnaInput').value.trim(),
          a: 'پرسش شما ثبت شد؛ متخصصین پوست و زیبایی رزالری به‌زودی پاسخ تخصصی را درج می‌کنند.'
        };
        R.setState((s) => ({
          ...s,
          customQna: { ...s.customQna, [p.id]: [item, ...(s.customQna[p.id] || [])] }
        }));
        toast('پرسش شما ثبت شد');
        renderPDPTabs();
      });
    }

    renderPDP();
    renderPDPTabs();
    initTabs($('#pdpTabs'));

    // Cross-sell & Recently Viewed
    const related = DATA.products.filter((x) => x.id !== p.id && (x.cat === p.cat || x.brand === p.brand)).slice(0, 6);
    if ($('#pdpRelatedRow')) {
      $('#pdpRelatedRow').innerHTML = related.map((x, i) => renderProductCard(x, { index: i })).join('');
    }
    const recent = R.getState().recentlyViewed.filter((id) => id !== p.id).map(getProduct).filter(Boolean).slice(0, 5);
    if ($('#pdpRecentRow')) {
      $('#pdpRecentRow').innerHTML = recent.map((x, i) => renderProductCard(x, { index: i })).join('');
    }
  }

  /* ================================================================
     3. FULL CART PAGE (cart.html)
     ================================================================ */
  if (page === 'cart') {
    function renderCartPage() {
      const totals = R.getCartTotals();
      const s = R.getState();
      const pct = Math.min(100, Math.round((totals.subtotal / DATA.config.freeShippingThreshold) * 100));

      if (!totals.items.length) {
        $('#cartPageMain').innerHTML = `
          <div class="surface-card" style="grid-column:1/-1;text-align:center;padding:54px 20px">
            <h2 class="fd" style="font-size:2rem;margin-bottom:8px">سبد خرید شما خالی است</h2>
            <p style="color:var(--ink2);margin-bottom:20px">بهترین محصولات آرایشی و مراقبت پوست اصل در انتظار شما هستند.</p>
            <a class="btn rose" href="shop.html">ورود به فروشگاه رزالری</a>
          </div>`;
        return;
      }

      $('#cartItemsCol').innerHTML = `
        <div class="surface-card" style="margin-bottom:18px">
          <div class="ship-meter${totals.remainingForFreeShip === 0 ? ' done' : ''}">
            ${
              totals.remainingForFreeShip === 0
                ? '<b>ارسال رایگان فعال شد!</b> سفارش شما بدون هزینه پستی ارسال می‌شود.'
                : `تنها <b>${fa(totals.remainingForFreeShip)} تومان</b> خرید دیگر تا <b>ارسال رایگان سراسر ایران</b>`
            }
            <div class="ship-bar"><span style="width:${pct}%"></span></div>
          </div>
          ${totals.items
            .map(
              (it, idx) => `
            <div class="citem">
              <a class="ci-th${it.product.isPackshot ? ' is-packshot' : ''}" href="${productUrl(it.id)}" style="width:82px;height:94px">
                <img src="${it.product.image}" alt="${it.product.name}">
              </a>
              <div class="ci-info">
                <small style="color:var(--rose-deep);font-weight:700">${it.product.brand}</small>
                <b style="font-size:.95rem"><a href="${productUrl(it.id)}">${it.product.name}</a></b>
                ${it.shade || it.size ? `<span class="ci-sub">${[it.shade, it.size].filter(Boolean).join(' · ')}</span>` : ''}
                <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:8px">
                  <div class="qty" style="margin:0">
                    <button type="button" data-cart-qty="-1" data-idx="${idx}" aria-label="کاهش">−</button>
                    <span>${fa(it.qty)}</span>
                    <button type="button" data-cart-qty="1" data-idx="${idx}" aria-label="افزایش">+</button>
                  </div>
                  <button type="button" style="font-size:.76rem;color:var(--ink2)" data-save-later="${idx}">انتقال به علاقه‌مندی‌ها</button>
                </div>
              </div>
              <div style="text-align:end">
                <b style="display:block;font-size:.95rem">${fa(it.lineTotal)} تومان</b>
                <button type="button" class="ci-del" data-cart-del="${idx}" aria-label="حذف" style="margin-inline-start:auto;margin-top:8px">${ICONS.close}</button>
              </div>
            </div>`
            )
            .join('')}
        </div>

        <div class="surface-card" style="margin-bottom:18px">
          <h2 class="fd" style="font-size:1.5rem;margin-bottom:6px">اشانتیون رایگان رزالری (هدیه خرید بالای ۱ میلیون تومان)</h2>
          <p style="font-size:.82rem;color:var(--ink2);margin-bottom:10px">
            ${totals.freeSampleEligible ? 'یک نمونه رایگان دلخواه به انتخاب خودتان همراه سفارش ارسال می‌شود:' : `با خرید بالای ${fa(DATA.config.freeSampleThreshold)} تومان یکی از این ۳ سمپل هدیه را دریافت کنید.`}
          </p>
          <div class="sample-grid">
            ${DATA.config.freeSamples
              .map(
                (smp) => `
              <button type="button" class="sample-opt${s.freeSampleId === smp.id ? ' on' : ''}" data-pick-sample="${smp.id}" ${!totals.freeSampleEligible ? 'disabled' : ''}>
                <img src="${smp.image}" alt="" width="54" height="54">
                <span>${smp.name}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>

        <div class="surface-card">
          <label class="f-check" style="font-weight:700">
            <input type="checkbox" id="giftWrapChk" ${s.giftWrap ? 'checked' : ''}>
            <span>بسته‌بندی هدیه لوکس رزالری با روبان ساتن و کارت تبریک (+${fa(DATA.config.giftWrapFee)} تومان)</span>
          </label>
          <div class="field" id="giftNoteBox" style="margin-top:10px;margin-bottom:0;${s.giftWrap ? '' : 'display:none'}">
            <label for="giftNoteInp">متن دلخواه روی کارت هدیه</label>
            <input type="text" id="giftNoteInp" value="${s.giftNote || ''}" placeholder="تولدت مبارک عزیزم…">
          </div>
        </div>`;

      $('#cartSummaryCol').innerHTML = `
        <h2 class="fd" style="font-size:1.6rem">خلاصه سفارش</h2>
        <form class="promo-form" id="promoForm">
          <label for="promoInp" class="visually-hidden">کد تخفیف</label>
          <input type="text" id="promoInp" value="${s.promoCode || ''}" placeholder="کد تخفیف (مثلاً ROSALLERY15)" dir="ltr">
          <button type="submit" class="btn sm">اعمال</button>
        </form>
        ${
          s.promoCode && DATA.config.promoCodes[s.promoCode]
            ? `<div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--ok);font-weight:700">
                 <span>✓ کد ${s.promoCode} فعال است</span>
                 <button type="button" id="removePromoBtn" style="color:var(--rose-deep)">حذف</button>
               </div>`
            : ''
        }
        <div class="trow"><span>جمع کل کالاها (${fa(totals.count)})</span><b>${fa(totals.subtotal)} تومان</b></div>
        ${totals.discount ? `<div class="trow"><span>تخفیف کد (${s.promoCode})</span><b style="color:var(--ok)">−${fa(totals.discount)} تومان</b></div>` : ''}
        ${totals.giftFee ? `<div class="trow"><span>بسته‌بندی هدیه</span><b>${fa(totals.giftFee)} تومان</b></div>` : ''}
        <div class="trow"><span>هزینه ارسال تخمینی</span><b>${totals.shipping ? fa(totals.shipping) + ' تومان' : 'رایگان'}</b></div>
        <div class="trow total"><span>مبلغ قابل پرداخت</span><b>${fa(totals.total)} تومان</b></div>
        <a class="btn rose" href="checkout.html" style="width:100%;min-height:48px">ادامه جهت ثبت سفارش و پرداخت</a>
        <a class="btn ghost" href="shop.html" style="width:100%">افزودن محصولات بیشتر</a>`;

      $('#promoForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = R.applyPromoCode($('#promoInp').value);
        toast(res.msg);
        renderCartPage();
      });
      $('#removePromoBtn')?.addEventListener('click', () => {
        R.applyPromoCode('');
        renderCartPage();
      });
      $('#giftWrapChk')?.addEventListener('change', (e) => {
        R.setState((st) => ({ ...st, giftWrap: e.target.checked }));
        renderCartPage();
      });
      $('#giftNoteInp')?.addEventListener('input', (e) => {
        R.setState((st) => ({ ...st, giftNote: e.target.value }));
      });
      $$('[data-pick-sample]').forEach((b) =>
        b.addEventListener('click', () => {
          R.setState((st) => ({ ...st, freeSampleId: b.dataset.pickSample }));
          toast('اشانتیون هدیه شما انتخاب شد');
          renderCartPage();
        })
      );
      $$('[data-save-later]').forEach((b) =>
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.saveLater);
          const item = R.getState().cart[idx];
          if (!item) return;
          if (!R.getState().wishlist.includes(item.id)) R.toggleWishlist(item.id);
          R.removeCartItem(idx);
          renderCartPage();
        })
      );
    }

    renderCartPage();
    R.subscribe(renderCartPage);
    if ($('#cartUpsellRow')) {
      $('#cartUpsellRow').innerHTML = DATA.products.filter((p) => p.isBestseller).slice(0, 6).map((p, i) => renderProductCard(p, { index: i })).join('');
    }
  }

  /* ================================================================
     4. MULTI-STEP CHECKOUT PAGE (checkout.html)
     ================================================================ */
  if (page === 'checkout') {
    let step = 1;
    let shippingMethod = 'tehran';
    let deliverySlot = 'فردا — بازه ۹ تا ۱۵';
    let paymentMethod = 'shaparak';
    let placedOrder = null;

    const savedAddr = R.getState().user.addresses?.[0] || {};
    const formState = {
      name: savedAddr.receiver || R.getState().user.name || '',
      mobile: toEnDigits(savedAddr.mobile || R.getState().user.mobile || '09123456789'),
      email: '',
      province: savedAddr.province || 'تهران',
      city: savedAddr.city || 'تهران',
      postalCode: toEnDigits(savedAddr.postalCode || '1966734511'),
      address: savedAddr.address || ''
    };

    function renderCheckout() {
      const totals = R.getCartTotals(shippingMethod === 'tehran' ? 'standard' : shippingMethod);
      const stepItems = $$('#checkoutStepper li');
      stepItems.forEach((li, idx) => {
        const sNum = idx + 1;
        li.classList.toggle('done', !placedOrder && sNum < step);
        if (!placedOrder && sNum === step) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });

      if (placedOrder) {
        $('#checkoutRoot').innerHTML = `
          <div class="surface-card" style="grid-column:1/-1;max-width:720px;margin:0 auto;text-align:center;padding:40px 26px">
            <div style="width:68px;height:68px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;margin:0 auto 16px;font-size:2rem">✓</div>
            <h2 class="fd" style="font-size:2.3rem;margin-bottom:8px">سفارش شما با موفقیت ثبت شد!</h2>
            <p style="color:var(--ink2);margin-bottom:18px">کد رهگیری سفارش شما: <b dir="ltr" style="color:var(--rose-deep);font-size:1.15rem">${placedOrder.id}</b></p>
            <div class="surface-card" style="background:var(--paper2);text-align:start;margin-bottom:22px">
              <p><b>گیرنده:</b> ${placedOrder.receiver} (${placedOrder.mobile})</p>
              <p><b>نشانی:</b> ${placedOrder.address}</p>
              <p><b>روش ارسال:</b> ${placedOrder.shippingLabel}</p>
              <p><b>مبلغ پرداخت‌شده:</b> ${fa(placedOrder.total)} تومان</p>
            </div>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              <a class="btn rose" href="track-order.html?order=${encodeURIComponent(placedOrder.id)}">پیگیری لحظه‌ای سفارش</a>
              <a class="btn ghost" href="shop.html">بازگشت به فروشگاه</a>
            </div>
          </div>`;
        return;
      }

      if (!totals.items.length) {
        $('#checkoutRoot').innerHTML = `
          <div class="surface-card" style="grid-column:1/-1;text-align:center;padding:48px">
            <h2 class="fd" style="font-size:1.8rem;margin-bottom:10px">سبد خرید شما خالی است</h2>
            <a class="btn rose" href="shop.html">بازگشت به فروشگاه</a>
          </div>`;
        return;
      }

      const summaryHtml = `
        <aside class="summary-card">
          <h2 class="fd" style="font-size:1.5rem">مرور سفارش (${fa(totals.count)} کالا)</h2>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto">
            ${totals.items
              .map(
                (it) => `
              <div style="display:flex;justify-content:space-between;gap:8px;font-size:.82rem;border-bottom:1px solid var(--line);padding-bottom:6px">
                <span>${it.product.name} × ${fa(it.qty)}</span>
                <b>${fa(it.lineTotal)}</b>
              </div>`
              )
              .join('')}
          </div>
          <div class="trow"><span>جمع کالاها</span><b>${fa(totals.subtotal)} تومان</b></div>
          ${totals.discount ? `<div class="trow"><span>تخفیف</span><b style="color:var(--ok)">−${fa(totals.discount)} تومان</b></div>` : ''}
          ${totals.giftFee ? `<div class="trow"><span>بسته‌بندی هدیه</span><b>${fa(totals.giftFee)} تومان</b></div>` : ''}
          <div class="trow"><span>هزینه ارسال</span><b>${totals.shipping ? fa(totals.shipping) + ' تومان' : 'رایگان'}</b></div>
          <div class="trow total"><span>مبلغ نهایی</span><b>${fa(totals.total)} تومان</b></div>
        </aside>`;

      let stepHtml = '';
      if (step === 1) {
        const provOptions = Object.keys(DATA.provinces);
        const cityOptions = DATA.provinces[formState.province] || ['تهران'];
        stepHtml = `
          <form class="surface-card" id="chkStep1Form" novalidate>
            <h2 class="fd" style="font-size:1.7rem;margin-bottom:14px" tabindex="-1">۱. مشخصات گیرنده و نشانی تحویل</h2>
            <div class="two-col-form">
              <div class="field">
                <label for="chkName">نام و نام خانوادگی گیرنده</label>
                <input id="chkName" name="name" autocomplete="name" required value="${formState.name}" data-error="chkNameErr">
                <div id="chkNameErr" class="field-error">لطفاً نام گیرنده را وارد کنید.</div>
              </div>
              <div class="field">
                <label for="chkMobile">شماره موبایل</label>
                <span id="chkMobileHint" class="field-hint">برای پیامک کد رهگیری</span>
                <input id="chkMobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel" required pattern="^(09|\\+989)[0-9]{9}$" dir="ltr" value="${formState.mobile}" aria-describedby="chkMobileHint" data-error="chkMobileErr">
                <div id="chkMobileErr" class="field-error">شماره موبایل ۱۱ رقمی معتبر وارد کنید.</div>
              </div>
            </div>
            <div class="two-col-form">
              <div class="field">
                <label for="chkProvince">استان</label>
                <select id="chkProvince" name="province" autocomplete="address-level1" required>
                  ${provOptions.map((pr) => `<option value="${pr}"${pr === formState.province ? ' selected' : ''}>${pr}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <label for="chkCity">شهر</label>
                <select id="chkCity" name="city" autocomplete="address-level2" required>
                  ${cityOptions.map((ct) => `<option value="${ct}"${ct === formState.city ? ' selected' : ''}>${ct}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="two-col-form">
              <div class="field">
                <label for="chkPostal">کد پستی ۱۰ رقمی</label>
                <span id="chkPostalHint" class="field-hint">بدون خط تیره</span>
                <input id="chkPostal" name="postal" type="text" inputmode="numeric" autocomplete="postal-code" pattern="\\d{10}" maxlength="10" dir="ltr" value="${formState.postalCode}" aria-describedby="chkPostalHint" data-error="chkPostalErr">
                <div id="chkPostalErr" class="field-error">کد پستی باید دقیقاً ۱۰ رقم باشد.</div>
              </div>
              <div class="field">
                <label for="chkEmail">ایمیل (اختیاری — برای فاکتور)</label>
                <input id="chkEmail" name="email" type="email" autocomplete="email" dir="ltr" value="${formState.email}" data-error="chkEmailErr">
                <div id="chkEmailErr" class="field-error">لطفاً ایمیل معتبر وارد کنید.</div>
              </div>
            </div>
            <div class="field">
              <label for="chkAddr">نشانی دقیق پستی</label>
              <span id="chkAddrHint" class="field-hint">خیابان، کوچه، پلاک و واحد</span>
              <textarea id="chkAddr" name="address" autocomplete="street-address" required minlength="10" aria-describedby="chkAddrHint" data-error="chkAddrErr">${formState.address}</textarea>
              <div id="chkAddrErr" class="field-error">لطفاً نشانی کامل را وارد کنید.</div>
            </div>
            <button type="submit" class="btn rose" enterkeyhint="next">ادامه و انتخاب روش ارسال</button>
          </form>`;
      } else if (step === 2) {
        stepHtml = `
          <form class="surface-card" id="chkStep2Form">
            <h2 class="fd" style="font-size:1.7rem;margin-bottom:14px" tabindex="-1">۲. انتخاب شیوه و زمان ارسال</h2>
            <label class="radio-card">
              <input type="radio" name="shipMethod" value="tehran" ${shippingMethod === 'tehran' ? 'checked' : ''}>
              <div><b>پیک اختصاصی رزالری (تهران — ۲۴ ساعته)</b><p style="font-size:.82rem;color:var(--ink2)">تحویل در بازه زمانی انتخابی (${totals.afterDiscount >= DATA.config.freeShippingThreshold ? 'رایگان' : fa(DATA.config.tehranShippingFee) + ' تومان'})</p></div>
            </label>
            <label class="radio-card">
              <input type="radio" name="shipMethod" value="post" ${shippingMethod === 'post' ? 'checked' : ''}>
              <div><b>پست پیشتاز سراسر ایران (۲ تا ۴ روز کاری)</b><p style="font-size:.82rem;color:var(--ink2)">بسته‌بندی ضربه‌گیر ضدگرما (${totals.afterDiscount >= DATA.config.freeShippingThreshold ? 'رایگان' : fa(DATA.config.postShippingFee) + ' تومان'})</p></div>
            </label>
            <label class="radio-card">
              <input type="radio" name="shipMethod" value="tipax" ${shippingMethod === 'tipax' ? 'checked' : ''}>
              <div><b>ارسال سریع تیپاکس</b><p style="font-size:.82rem;color:var(--ink2)">۱ تا ۲ روز کاری به مراکز استان (${totals.afterDiscount >= DATA.config.freeShippingThreshold ? 'رایگان' : fa(DATA.config.tipaxShippingFee) + ' تومان'})</p></div>
            </label>
            <div class="field" style="margin-top:16px">
              <label for="chkSlot">بازه زمانی پیشنهادی تحویل</label>
              <select id="chkSlot">
                <option value="امروز — بازه ۱۵ تا ۲۱"${deliverySlot.includes('امروز') ? ' selected' : ''}>امروز — بازه ۱۵ تا ۲۱ (ویژه تهران)</option>
                <option value="فردا — بازه ۹ تا ۱۵"${deliverySlot.includes('۹ تا ۱۵') ? ' selected' : ''}>فردا — بازه ۹ تا ۱۵</option>
                <option value="فردا — بازه ۱۵ تا ۲۱"${deliverySlot.includes('فردا — بازه ۱۵') ? ' selected' : ''}>فردا — بازه ۱۵ تا ۲۱</option>
              </select>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button type="button" class="btn ghost" id="chkBack1">بازگشت به مرحله قبل</button>
              <button type="submit" class="btn rose" enterkeyhint="next">ادامه و انتخاب روش پرداخت</button>
            </div>
          </form>`;
      } else {
        const inst = Math.round(totals.total / 4);
        stepHtml = `
          <form class="surface-card" id="chkStep3Form">
            <h2 class="fd" style="font-size:1.7rem;margin-bottom:14px" tabindex="-1">۳. شیوه پرداخت و تایید نهایی</h2>
            <label class="radio-card">
              <input type="radio" name="payMethod" value="shaparak" ${paymentMethod === 'shaparak' ? 'checked' : ''}>
              <div><b>پرداخت آنلاین با کلیه کارت‌های عضو شاپرک</b><p style="font-size:.82rem;color:var(--ink2)">اتصال امن SSL به درگاه بانکی</p></div>
            </label>
            <label class="radio-card">
              <input type="radio" name="payMethod" value="snapppay" ${paymentMethod === 'snapppay' ? 'checked' : ''}>
              <div><b>پرداخت اعتباری اقساطی اسنپ‌پی (۴ قسط بدون کارمزد)</b><p style="font-size:.82rem;color:var(--ink2)">قسط اول هنگام خرید: <b>${fa(inst)} تومان</b> و ۳ قسط بعدی ماهانه</p></div>
            </label>
            <div style="background:var(--paper2);border-radius:14px;padding:14px;margin:14px 0;font-size:.84rem">
              <b>نشانی انتخابی:</b> ${formState.province}، ${formState.city} — ${formState.address} (${deliverySlot})
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button type="button" class="btn ghost" id="chkBack2">بازگشت به ارسال</button>
              <button type="submit" class="btn rose">پرداخت ${fa(totals.total)} تومان و ثبت نهایی</button>
            </div>
          </form>`;
      }

      $('#checkoutRoot').innerHTML = `${stepHtml}${summaryHtml}`;
      initFormValidation($('#checkoutRoot'));

      if (step === 1) {
        $('#chkProvince')?.addEventListener('change', (e) => {
          formState.province = e.target.value;
          formState.city = (DATA.provinces[formState.province] || [])[0] || '';
          const citySel = $('#chkCity');
          if (citySel) {
            citySel.innerHTML = (DATA.provinces[formState.province] || []).map((c) => `<option value="${c}">${c}</option>`).join('');
          }
        });
        $('#chkStep1Form')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const mob = $('#chkMobile');
          mob.value = toEnDigits(mob.value).replace(/\s+/g, '');
          const pos = $('#chkPostal');
          pos.value = toEnDigits(pos.value).trim();
          if (!e.target.reportValidity()) return;
          formState.name = $('#chkName').value.trim();
          formState.mobile = mob.value;
          formState.province = $('#chkProvince').value;
          formState.city = $('#chkCity').value;
          formState.postalCode = pos.value;
          formState.email = $('#chkEmail').value.trim();
          formState.address = $('#chkAddr').value.trim();
          step = 2;
          renderCheckout();
          $('#checkoutRoot h2')?.focus();
        });
      } else if (step === 2) {
        $$('input[name="shipMethod"]').forEach((r) =>
          r.addEventListener('change', () => {
            shippingMethod = r.value;
            renderCheckout();
          })
        );
        $('#chkBack1')?.addEventListener('click', () => {
          step = 1;
          renderCheckout();
        });
        $('#chkStep2Form')?.addEventListener('submit', (e) => {
          e.preventDefault();
          deliverySlot = $('#chkSlot').value;
          step = 3;
          renderCheckout();
          $('#checkoutRoot h2')?.focus();
        });
      } else {
        $$('input[name="payMethod"]').forEach((r) =>
          r.addEventListener('change', () => {
            paymentMethod = r.value;
          })
        );
        $('#chkBack2')?.addEventListener('click', () => {
          step = 2;
          renderCheckout();
        });
        $('#chkStep3Form')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const newOrder = {
            id: `RS-1405-${Math.floor(1000 + Math.random() * 9000)}`,
            date: '۱۴۰۵/۰۲/۰۹',
            statusStep: 1,
            statusLabel: 'در حال آماده‌سازی در انبار کنترل دما',
            total: totals.total,
            shippingLabel:
              shippingMethod === 'tehran'
                ? `پیک سریع تهران (${deliverySlot})`
                : shippingMethod === 'post'
                  ? 'پست پیشتاز'
                  : 'تیپاکس',
            paymentLabel: paymentMethod === 'snapppay' ? 'اقساطی اسنپ‌پی' : 'درگاه آنلاین شاپرک',
            receiver: formState.name,
            mobile: formState.mobile,
            address: `${formState.province}، ${formState.city}، ${formState.address}`,
            items: totals.items.map((it) => ({
              id: it.id,
              name: it.product.name,
              shade: it.shade || it.size,
              qty: it.qty,
              price: it.unitPrice
            }))
          };
          R.setState((s) => ({
            ...s,
            cart: [],
            promoCode: '',
            giftWrap: false,
            giftNote: '',
            orders: [newOrder, ...s.orders],
            user: { ...s.user, points: (s.user.points || 0) + Math.round(totals.total / 10000) }
          }));
          placedOrder = newOrder;
          renderCheckout();
          toast(`سفارش ${newOrder.id} با موفقیت ثبت شد`);
        });
      }
    }

    renderCheckout();
  }

  /* ================================================================
     5. CUSTOMER ACCOUNT PAGE (account.html)
     ================================================================ */
  if (page === 'account') {
    const initialTab = params.get('tab') || 'overview';
    let activeTab = initialTab;

    function renderAccount() {
      const s = R.getState();
      if (!s.user.loggedIn) {
        $('#accountRoot').innerHTML = `
          <div class="surface-card" style="max-width:520px;margin:36px auto 64px;text-align:center;padding:34px 24px">
            <h2 class="fd" style="font-size:2rem;margin-bottom:8px">ورود به حساب کاربری رزالری</h2>
            <p style="color:var(--ink2);font-size:.9rem;margin-bottom:20px">برای مشاهده سفارش‌ها، امتیازهای رز کلاب و پروفایل زیبایی با شماره موبایل وارد شوید.</p>
            <button type="button" class="btn rose" data-open-auth>ورود با شماره موبایل و رمز یک‌بارمصرف</button>
          </div>`;
        return;
      }

      const tabButtons = [
        { k: 'overview', label: 'پیشخوان و باشگاه مشتریان' },
        { k: 'orders', label: `سفارش‌های من (${fa(s.orders.length)})` },
        { k: 'beauty', label: 'پروفایل زیبایی من' },
        { k: 'wishlist', label: `علاقه‌مندی‌ها (${fa(s.wishlist.length)})` },
        { k: 'addresses', label: 'نشانی‌های ثبت‌شده' }
      ];

      let contentHtml = '';
      if (activeTab === 'overview') {
        contentHtml = `
          <div class="kpi-row">
            <div class="kpi-box"><small>امتیاز رز کلاب</small><b>${fa(s.user.points)}</b><span>قابل تبدیل به کد تخفیف</span></div>
            <div class="kpi-box"><small>تعداد سفارش‌ها</small><b>${fa(s.orders.length)}</b><span>ارسال سریع رزالری</span></div>
            <div class="kpi-box"><small>پروفایل پوست</small><b style="font-size:1.35rem;margin-top:6px">${s.user.beautyProfile.skinType}</b><span>${s.user.beautyProfile.undertone}</span></div>
          </div>
          <div class="surface-card">
            <h2 class="fd" style="font-size:1.6rem;margin-bottom:8px">سلام ${s.user.name} عزیز!</h2>
            <p style="font-size:.88rem;color:var(--ink2);margin-bottom:14px">کد تخفیف فعال شما برای خرید بعدی: <b style="color:var(--rose-deep)">WELCOME10</b> (۱۰٪ تخفیف)</p>
            <a class="btn rose sm" href="routine.html">مشاهده روتین پیشنهادی برای ${s.user.beautyProfile.skinType}</a>
          </div>`;
      } else if (activeTab === 'orders') {
        contentHtml = s.orders
          .map(
            (o) => `
          <article class="surface-card" style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:10px">
              <div><b>شماره سفارش: <span dir="ltr">${o.id}</span></b> · <small style="color:var(--ink2)">${o.date}</small></div>
              <span class="verified-tag">${o.statusLabel}</span>
            </div>
            <p style="font-size:.84rem;color:var(--ink2)">${o.items.map((x) => `${x.name} (×${fa(x.qty)})`).join('، ')}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:8px">
              <b>مبلغ کل: ${fa(o.total)} تومان</b>
              <a class="btn ghost sm" href="track-order.html?order=${encodeURIComponent(o.id)}">پیگیری وضعیت مرسوله</a>
            </div>
          </article>`
          )
          .join('');
      } else if (activeTab === 'beauty') {
        const bp = s.user.beautyProfile;
        contentHtml = `
          <form class="surface-card" id="beautyProfileForm">
            <h2 class="fd" style="font-size:1.6rem;margin-bottom:12px">پروفایل زیبایی و شخصی‌سازی</h2>
            <div class="two-col-form">
              <div class="field"><label for="bpSkin">نوع پوست</label><select id="bpSkin">${['پوست خشک', 'پوست معمولی', 'پوست چرب', 'پوست مختلط', 'پوست حساس'].map((x) => `<option${bp.skinType === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
              <div class="field"><label for="bpHair">نوع مو</label><select id="bpHair">${['موی نرمال', 'موی خشک و رنگ‌شده', 'موی چرب', 'موی فر و وز'].map((x) => `<option${bp.hairType === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
              <div class="field"><label for="bpTone">زیرتون پوست</label><select id="bpTone">${['سرد', 'خنثی', 'گرم'].map((x) => `<option${bp.undertone === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
              <div class="field"><label for="bpConcern">دغدغه اصلی</label><select id="bpConcern">${['آبرسانی و درخشش', 'ضدلک و کنترل منافذ', 'ضدچروک و سفتی پوست', 'ترمیم و رشد مو'].map((x) => `<option${bp.concern === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
            </div>
            <button type="submit" class="btn rose">ذخیره پروفایل زیبایی</button>
          </form>`;
      } else if (activeTab === 'wishlist') {
        const favs = s.wishlist.map(getProduct).filter(Boolean);
        contentHtml = favs.length
          ? `<div class="product-grid">${favs.map((p, i) => renderProductCard(p, { index: i })).join('')}</div>`
          : `<div class="surface-card" style="text-align:center;padding:36px"><p>علاقه‌مندی‌های شما خالی است.</p><a class="btn rose" href="shop.html" style="margin-top:12px">بازدید از فروشگاه</a></div>`;
      } else if (activeTab === 'addresses') {
        contentHtml = `
          <div class="surface-card">
            <h2 class="fd" style="font-size:1.6rem;margin-bottom:12px">نشانی‌های من</h2>
            ${s.user.addresses
              .map(
                (a) => `
              <div style="border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px">
                <b>${a.label} — ${a.receiver}</b>
                <p style="font-size:.86rem;color:var(--ink2);margin-top:4px">${a.province}، ${a.city}، ${a.address} (کد پستی: ${a.postalCode})</p>
              </div>`
              )
              .join('')}
          </div>`;
      }

      $('#accountRoot').innerHTML = `
        <div class="account-grid">
          <aside class="account-nav" role="tablist" aria-label="بخش‌های حساب کاربری" aria-orientation="vertical">
            ${tabButtons
              .map(
                (tb) => `<button type="button" role="tab" aria-selected="${activeTab === tb.k}" data-acctab="${tb.k}">${tb.label}</button>`
              )
              .join('')}
            <button type="button" id="accLogoutBtn" style="color:var(--err);margin-top:8px;border-top:1px solid var(--line);border-radius:0;padding-top:12px">خروج از حساب</button>
          </aside>
          <div role="tabpanel">${contentHtml}</div>
        </div>`;

      $$('[data-acctab]').forEach((b) =>
        b.addEventListener('click', () => {
          activeTab = b.dataset.acctab;
          renderAccount();
        })
      );
      $('#accLogoutBtn')?.addEventListener('click', () => {
        R.setState((st) => ({ ...st, user: { ...st.user, loggedIn: false } }));
        toast('خروج از حساب انجام شد');
      });
      $('#beautyProfileForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        R.setState((st) => ({
          ...st,
          user: {
            ...st.user,
            beautyProfile: {
              skinType: $('#bpSkin').value,
              hairType: $('#bpHair').value,
              undertone: $('#bpTone').value,
              concern: $('#bpConcern').value
            }
          }
        }));
        toast('پروفایل زیبایی شما ذخیره شد');
      });
    }

    renderAccount();
    R.subscribe(renderAccount);
  }

  /* ================================================================
     6. INTERACTIVE 4-STEP ROUTINE QUIZ (routine.html)
     ================================================================ */
  if (page === 'routine') {
    const answers = {
      skin: params.get('skin') || 'پوست خشک',
      concern: 'آبرسانی',
      sensitivity: 'بدون حساسیت خاص',
      steps: 'روتین کامل ۴ مرحله‌ای'
    };
    let step = params.get('skin') ? 2 : 1;

    const stepsData = [
      {
        num: 1,
        key: 'skin',
        title: 'نوع پوست شما کدام است؟',
        options: [
          { val: 'پوست خشک', desc: 'احساس کشیدگی بعد از شستشو و نیاز به تغذیه عمیق' },
          { val: 'پوست چرب', desc: 'براقیت در ناحیه T و مستعد منافذ باز' },
          { val: 'پوست مختلط', desc: 'پیشانی و بینی چرب اما گونه‌ها نرمال یا خشک' },
          { val: 'پوست حساس', desc: 'قرمزی سریع در برابر محصولات معطر یا اسیدی' }
        ]
      },
      {
        num: 2,
        key: 'concern',
        title: 'اولویت اصلی شما در این دوره چیست؟',
        options: [
          { val: 'آبرسانی', desc: 'پرشدن خطوط دهیدراته و درخشش شیشه‌ای' },
          { val: 'ضدلک و منافذ', desc: 'متعادل‌سازی چربی و یکدستی رنگ پوست' },
          { val: 'میکاپ بادوام', desc: 'زیرسازی مخملی و ماندگاری بالای آرایش روزانه' },
          { val: 'ترمیم مو و ناخن', desc: 'بازسازی ساقه موی آسیب‌دیده و تقویت ناخن' }
        ]
      },
      {
        num: 3,
        key: 'sensitivity',
        title: 'ترجیح شما درباره بافت و فرمولاسیون چیست؟',
        options: [
          { val: 'بدون عطر و الکل', desc: 'مناسب پوست‌های واکنش‌پذیر و حساس' },
          { val: 'وگان و سبک', desc: 'جذب سریع بدون ایجاد سنگینی یا برق اضافه' }
        ]
      }
    ];

    function renderQuiz() {
      if (step <= 3) {
        const cur = stepsData[step - 1];
        $('#quizRoot').innerHTML = `
          <div class="quiz-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <span class="tag">گام ${fa(step)} از ۳</span>
              <progress value="${step}" max="3" style="accent-color:var(--rose);width:160px"></progress>
            </div>
            <h2 class="fd" style="font-size:1.9rem">${cur.title}</h2>
            <div class="quiz-opts">
              ${cur.options
                .map(
                  (o) => `
                <button type="button" class="quiz-opt${answers[cur.key] === o.val ? ' on' : ''}" data-qval="${o.val}">
                  <b>${o.val}</b>
                  <small>${o.desc}</small>
                </button>`
                )
                .join('')}
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px">
              ${step > 1 ? `<button type="button" class="btn ghost" id="qPrev">مرحله قبل</button>` : '<span></span>'}
              <button type="button" class="btn rose" id="qNext">${step === 3 ? 'مشاهده روتین اختصاصی من' : 'مرحله بعد'}</button>
            </div>
          </div>`;

        $$('[data-qval]').forEach((b) =>
          b.addEventListener('click', () => {
            answers[cur.key] = b.dataset.qval;
            renderQuiz();
          })
        );
        $('#qPrev')?.addEventListener('click', () => {
          step--;
          renderQuiz();
        });
        $('#qNext')?.addEventListener('click', () => {
          step++;
          renderQuiz();
        });
      } else {
        // Compute tailored 4-product routine
        const recIds =
          answers.concern === 'ترمیم مو و ناخن'
            ? [9, 10, 11, 14]
            : answers.skin === 'پوست چرب'
              ? [2, 17, 1, 5]
              : [17, 2, 1, 8];
        const recs = recIds.map(getProduct).filter(Boolean);
        const totalSum = recs.reduce((s, x) => s + x.price, 0);
        const bundleTotal = Math.round(totalSum * 0.9);

        $('#quizRoot').innerHTML = `
          <div class="quiz-card" style="max-width:1040px">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:14px;margin-bottom:20px">
              <div>
                <span class="tag">روتین پیشنهادی اختصاصی رزالری</span>
                <h2 class="fd" style="font-size:2rem;margin-top:6px">برنامه زیبایی برای ${answers.skin} (${answers.concern})</h2>
                <p style="color:var(--ink2);font-size:.88rem">با خرید هم‌زمان این پکیج و کد <b>ROUTINE10</b> از ۱۰٪ تخفیف ست روتین بهره‌مند شوید.</p>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button type="button" class="btn ghost sm" id="qRestart">شروع مجدد آزمون</button>
                <button type="button" class="btn rose" id="qAddAll">افزودن کل روتین (${fa(bundleTotal)} تومان)</button>
              </div>
            </div>
            <div class="product-grid">
              ${recs.map((p, i) => renderProductCard(p, { index: i })).join('')}
            </div>
          </div>`;

        $('#qRestart')?.addEventListener('click', () => {
          step = 1;
          renderQuiz();
        });
        $('#qAddAll')?.addEventListener('click', () => {
          recs.forEach((p) => {
            if (p.inStock) R.addToCart(p.id);
          });
          R.applyPromoCode('ROUTINE10');
          toast('کل روتین + کد تخفیف ۱۰٪ به سبد خرید اضافه شد');
        });
      }
    }

    renderQuiz();
  }

  /* ================================================================
     7. BRANDS DIRECTORY (brands.html)
     ================================================================ */
  if (page === 'brands') {
    let activeLetter = '';
    let searchB = '';
    const letters = [...new Set(DATA.brands.map((b) => b.letter))];

    function renderBrands() {
      const filtered = DATA.brands.filter((b) => {
        const matchL = !activeLetter || b.letter === activeLetter;
        const matchQ =
          !searchB || normalizeFa(`${b.name} ${b.nameEn} ${b.origin}`).includes(normalizeFa(searchB));
        return matchL && matchQ;
      });

      $('#brandLetters').innerHTML =
        `<button type="button" class="pill-btn${!activeLetter ? ' on' : ''}" data-bl="">همه</button>` +
        letters.map((l) => `<button type="button" class="pill-btn${activeLetter === l ? ' on' : ''}" data-bl="${l}">${l}</button>`).join('');

      $('#brandsGrid').innerHTML = filtered
        .map(
          (b) => `
        <a class="brand-card" href="${shopUrl({ brand: b.name })}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="brand-monogram" style="background:${b.color}">${b.letterEn}</span>
            <span class="verified-tag">نمایندگی رسمی · ${b.origin}</span>
          </div>
          <h2 class="fd" style="font-size:1.55rem;margin-top:4px">${b.name}</h2>
          <small lang="en" style="color:var(--ink2)">${b.nameEn}</small>
          <p style="font-size:.83rem;color:var(--ink2);margin-top:4px">${b.tagline}</p>
        </a>`
        )
        .join('');

      $$('[data-bl]').forEach((btn) =>
        btn.addEventListener('click', () => {
          activeLetter = btn.dataset.bl;
          renderBrands();
        })
      );
    }

    $('#brandSearchInp')?.addEventListener('input', (e) => {
      searchB = e.target.value;
      renderBrands();
    });
    renderBrands();
  }

  /* ================================================================
     8. MAGAZINE & ARTICLE DETAIL (magazine.html & article.html)
     ================================================================ */
  if (page === 'magazine') {
    let activeCat = '';
    const cats = [...new Set(DATA.articles.map((a) => a.category))];

    function renderMag() {
      $('#magFilterRow').innerHTML =
        `<button type="button" class="pill-btn${!activeCat ? ' on' : ''}" data-mc="">همه مقالات</button>` +
        cats.map((c) => `<button type="button" class="pill-btn${activeCat === c ? ' on' : ''}" data-mc="${c}">${c}</button>`).join('');

      const list = activeCat ? DATA.articles.filter((a) => a.category === activeCat) : DATA.articles;
      $('#magGrid').innerHTML = list
        .map(
          (a) => `
        <article class="article-card">
          <a class="acover" href="article.html?slug=${encodeURIComponent(a.slug)}">
            <img src="${a.cover}" alt="${a.title}" loading="lazy">
          </a>
          <div class="abody">
            <span class="tag">${a.category}</span>
            <h2><a href="article.html?slug=${encodeURIComponent(a.slug)}">${a.title}</a></h2>
            <p style="font-size:.84rem;color:var(--ink2)">${a.excerpt}</p>
            <span class="meta" style="margin-top:auto">${a.readTime} · ${a.author}</span>
          </div>
        </article>`
        )
        .join('');

      $$('[data-mc]').forEach((b) =>
        b.addEventListener('click', () => {
          activeCat = b.dataset.mc;
          renderMag();
        })
      );
    }
    renderMag();
  }

  if (page === 'article') {
    const slug = params.get('slug') || DATA.articles[0].slug;
    const art = DATA.articles.find((a) => a.slug === slug) || DATA.articles[0];
    document.title = `${art.title} — مجله زیبایی رزالری`;
    $('#artCrumbTitle').textContent = art.title;
    $('#artHeroCat').textContent = art.category;
    $('#artHeroTitle').textContent = art.title;
    $('#artHeroMeta').textContent = `${art.readTime} · ${art.author} (${art.authorRole}) · ${art.date}`;

    $('#artProse').innerHTML = `
      <div style="border-radius:20px;overflow:hidden;margin-bottom:22px;max-height:430px;border:1px solid var(--line)">
        <img src="${art.cover}" alt="${art.title}" style="width:100%;height:100%;object-fit:cover;display:block">
      </div>
      <p style="font-size:1.05rem;font-weight:600;color:var(--ink2)">${art.excerpt}</p>
      ${art.sections
        .map(
          (sec, idx) => `
        <section id="sec-${idx}">
          <h2>${sec.heading}</h2>
          ${sec.paragraphs.map((p) => `<p>${p}</p>`).join('')}
          ${sec.tip ? `<div class="tip-callout">${sec.tip}</div>` : ''}
        </section>`
        )
        .join('')}`;

    const related = (art.relatedProductIds || []).map(getProduct).filter(Boolean);
    $('#artSidebar').innerHTML = `
      <div class="surface-card" style="margin-bottom:18px">
        <h3 class="fd" style="font-size:1.45rem;margin-bottom:10px">فهرست مطالب</h3>
        <ol style="padding-inline-start:18px;font-size:.86rem;display:flex;flex-direction:column;gap:6px">
          ${art.toc.map((t, i) => `<li><a href="#sec-${Math.min(i, art.sections.length - 1)}" style="color:var(--rose-deep)">${t}</a></li>`).join('')}
        </ol>
      </div>
      <div class="surface-card">
        <h3 class="fd" style="font-size:1.45rem;margin-bottom:12px">محصولات معرفی‌شده در مقاله</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${related
            .map(
              (p) => `
            <div style="display:flex;gap:10px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:10px">
              <a class="ci-th${p.isPackshot ? ' is-packshot' : ''}" href="${productUrl(p.id)}" style="width:56px;height:64px">
                <img src="${p.image}" alt="${p.name}">
              </a>
              <div style="flex:1;min-width:0">
                <b style="display:block;font-size:.8rem;line-height:1.4"><a href="${productUrl(p.id)}">${p.name}</a></b>
                <small style="color:var(--rose-deep);font-weight:700">${fa(p.price)} تومان</small>
              </div>
              <button type="button" class="btn rose sm" data-add="${p.id}">+</button>
            </div>`
            )
            .join('')}
        </div>
      </div>`;
  }

  /* ================================================================
     9. TRACK ORDER (track-order.html)
     ================================================================ */
  if (page === 'track-order') {
    const initialOrder = params.get('order') || R.getState().orders[0]?.id || '';
    if ($('#trackCodeInp')) $('#trackCodeInp').value = initialOrder;

    function lookupOrder(code) {
      const clean = toEnDigits(code).trim().toUpperCase();
      const found = R.getState().orders.find((o) => o.id.toUpperCase() === clean);
      const out = $('#trackResult');
      if (!clean) {
        out.innerHTML = '';
        return;
      }
      if (!found) {
        out.innerHTML = `<div class="surface-card" style="text-align:center"><p>سفارشی با کد <b dir="ltr">${clean}</b> یافت نشد. نمونه فعال: <b dir="ltr">RS-1405-7120</b></p></div>`;
        return;
      }
      const steps = ['ثبت سفارش', 'آماده‌سازی در انبار دماکنترل‌شده', 'تحویل به واحد ارسال', 'در مسیر تحویل', 'تحویل‌شده به مشتری'];
      out.innerHTML = `
        <div class="surface-card">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px">
            <h2 class="fd" style="font-size:1.7rem">وضعیت سفارش <span dir="ltr">${found.id}</span></h2>
            <span class="verified-tag">${found.statusLabel}</span>
          </div>
          <p style="font-size:.88rem;color:var(--ink2)">گیرنده: ${found.receiver} · روش ارسال: ${found.shippingLabel}</p>
          <ol class="timeline">
            ${steps
              .map((label, idx) => {
                const cls = idx < found.statusStep ? 'done' : idx === found.statusStep ? 'active' : '';
                return `<li class="${cls}">${label}</li>`;
              })
              .join('')}
          </ol>
          <p style="font-size:.86rem"><b>اقلام سفارش:</b> ${found.items.map((x) => `${x.name} (×${fa(x.qty)})`).join('، ')}</p>
        </div>`;
    }

    if (initialOrder) lookupOrder(initialOrder);
    $('#trackForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      lookupOrder($('#trackCodeInp').value);
    });
  }

  /* ================================================================
     10. CONTACT / FAQ / LEGAL
     ================================================================ */
  if (page === 'contact') {
    $('#contactForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      e.target.reset();
      $('#contactSuccess').hidden = false;
      toast('پیام شما با موفقیت ثبت شد؛ کارشناسان رزالری به‌زودی پاسخ می‌دهند');
    });
  }

  if (page === 'faq') {
    $('#faqRoot').innerHTML = DATA.faqs
      .map(
        (cat) => `
      <section class="faq-section" style="margin-bottom:28px">
        <h2 class="fd" style="font-size:1.7rem;margin-bottom:12px">${cat.category}</h2>
        ${cat.items
          .map(
            (item) => `
          <details name="faq-group">
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>`
          )
          .join('')}
      </section>`
      )
      .join('');
  }

  if (page === 'legal') {
    initTabs($('#legalTabs'));
  }
});
