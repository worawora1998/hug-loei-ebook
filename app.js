(() => {
  'use strict';

  const CFG = window.HUG_LOEI_CONFIG || {};
  const TOTAL_PAGES = Number(CFG.totalPages || 212);
  const BACK_COVER_PAGE = Number(CFG.backCoverPage || TOTAL_PAGES);
  const PAGE_ASPECT = 1252 / 1669;
  const CONTENT_VERSION = encodeURIComponent(String(CFG.contentVersion || CFG.updatedAt || 'v3'));
  const MOBILE_BP = 900;
  const REDUCED_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const frontMatter = [
    { name: 'หน้าแรก', short: 'หน้าแรก', page: 1, kind: 'front', color: '#f32f87' },
    { name: 'คำนำ', short: 'คำนำ', page: 2, kind: 'front', color: '#19a870' },
    { name: 'สารบัญ', short: 'สารบัญ', page: 3, kind: 'front', color: '#1677d2' }
  ];

  const sections = [
    { name: 'อำเภอเชียงคาน', short: 'เชียงคาน', page: 4 },
    { name: 'อำเภอด่านซ้าย', short: 'ด่านซ้าย', page: 16 },
    { name: 'อำเภอท่าลี่', short: 'ท่าลี่', page: 48 },
    { name: 'อำเภอนาด้วง', short: 'นาด้วง', page: 59 },
    { name: 'อำเภอนาแห้ว', short: 'นาแห้ว', page: 80 },
    { name: 'อำเภอปากชม', short: 'ปากชม', page: 91 },
    { name: 'อำเภอผาขาว', short: 'ผาขาว', page: 104 },
    { name: 'อำเภอภูกระดึง', short: 'ภูกระดึง', page: 116 },
    { name: 'อำเภอภูเรือ', short: 'ภูเรือ', page: 121 },
    { name: 'อำเภอภูหลวง', short: 'ภูหลวง', page: 134 },
    { name: 'อำเภอเมืองเลย', short: 'เมืองเลย', page: 157 },
    { name: 'อำเภอวังสะพุง', short: 'วังสะพุง', page: 171 },
    { name: 'อำเภอหนองหิน', short: 'หนองหิน', page: 176 },
    { name: 'อำเภอเอราวัณ', short: 'เอราวัณ', page: 182 }
  ].map((item, i) => ({
    ...item,
    kind: 'district',
    color: ['#13945f', '#ef3d88', '#1777ca', '#f17925'][i % 4]
  }));

  const backMatter = [{ name: 'หน้าปิด', short: 'หน้าปิด', page: BACK_COVER_PAGE, kind: 'back', color: '#8d5bb6' }];
  const navItems = [...frontMatter, ...sections, ...backMatter];

  const el = {
    intro: document.getElementById('intro'),
    stage: document.getElementById('readerStage'),
    scroll: document.getElementById('bookScroll'),
    sizer: document.getElementById('bookSizer'),
    scale: document.getElementById('bookScale'),
    book: document.getElementById('book'),
    leftSlot: document.getElementById('leftSlot'),
    rightSlot: document.getElementById('rightSlot'),
    leftImg: document.getElementById('leftImg'),
    rightImg: document.getElementById('rightImg'),
    leftHotspots: document.getElementById('leftHotspots'),
    rightHotspots: document.getElementById('rightHotspots'),
    flip: document.getElementById('flipSheet'),
    flipFront: document.getElementById('flipFrontImg'),
    flipBack: document.getElementById('flipBackImg'),
    curlShadow: document.getElementById('curlShadow'),
    curlLight: document.getElementById('curlLight'),
    curlEdge: document.getElementById('curlEdge'),
    curlRibs: document.getElementById('curlRibs'),
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn'),
    edgePrev: document.getElementById('edgePrev'),
    edgeNext: document.getElementById('edgeNext'),
    pageInput: document.getElementById('pageInput'),
    pageTotal: document.getElementById('pageTotalLabel'),
    zoomOut: document.getElementById('zoomOutBtn'),
    zoomIn: document.getElementById('zoomInBtn'),
    fit: document.getElementById('fitBtn'),
    fullscreen: document.getElementById('fullscreenBtn'),
    share: document.getElementById('shareBtn'),
    overviewBtn: document.getElementById('overviewBtn'),
    favorite: document.getElementById('favoriteBtn'),
    mobileFavorite: document.getElementById('mobileFavoriteBtn'),
    quality: document.getElementById('qualityBtn'),
    mobileQuality: document.getElementById('mobileQualityBtn'),
    sound: document.getElementById('soundBtn'),
    mobileSound: document.getElementById('mobileSoundBtn'),
    tabs: document.getElementById('bookmarkTabs'),
    mobileTabs: document.getElementById('mobileTabRail'),
    tocBtn: document.getElementById('tocBtn'),
    drawer: document.getElementById('tocDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    closeDrawer: document.getElementById('closeDrawerBtn'),
    drawerList: document.getElementById('drawerList'),
    openTocPage: document.getElementById('openTocPageBtn'),
    sectionPill: document.getElementById('mobileSectionPill'),
    sectionTitle: document.getElementById('sectionTitle'),
    progressFill: document.getElementById('progressFill'),
    loading: document.getElementById('loadingBadge'),
    networkBadge: document.getElementById('networkBadge'),
    toast: document.getElementById('toast'),
    organizerCorner: document.getElementById('organizerCorner'),
    contactFab: document.getElementById('contactFab'),
    mobileContact: document.getElementById('mobileContactBtn'),
    panelBackdrop: document.getElementById('panelBackdrop'),
    contactPanel: document.getElementById('contactPanel'),
    closeContact: document.getElementById('closeContactBtn'),
    overview: document.getElementById('overview'),
    closeOverview: document.getElementById('closeOverviewBtn'),
    thumbGrid: document.getElementById('thumbGrid'),
    overviewSections: document.getElementById('overviewSections'),
    favoriteFilter: document.getElementById('favoriteFilterBtn')
  };

  let currentPage = 1;
  let zoom = 1;
  let mobile = window.innerWidth <= MOBILE_BP;
  let animating = false;
  let swipeStart = null;
  let toastTimer = null;
  let tabPeekTimer = null;
  let qualityMode = localStorageSafeGet('hug-loei-quality') || 'auto'; // auto | lite | hd
  let soundOn = localStorageSafeGet('hug-loei-sound') === '1';
  let favoriteOnly = false;
  let favorites = new Set(parseJSON(localStorageSafeGet('hug-loei-favorites'), []));
  let networkSlow = detectSlowNetwork();
  let audioCtx = null;
  const fullCache = new Map();
  const previewCache = new Map();
  const imageUpgradeTokens = new WeakMap();
  let thumbObserver = null;
  let overviewBuilt = false;

  function localStorageSafeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function localStorageSafeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }
  function parseJSON(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }

  function detectSlowNetwork() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    return Boolean(c.saveData || ['slow-2g', '2g'].includes(c.effectiveType) || (Number(c.downlink) > 0 && Number(c.downlink) < .55));
  }

  function pad(page) { return String(page).padStart(3, '0'); }
  function pageUrl(page) { return `pages/page-${pad(page)}.jpg?v=${CONTENT_VERSION}`; }
  function previewUrl(page) { return `previews/page-${pad(page)}.jpg?v=${CONTENT_VERSION}`; }
  function thumbUrl(page) { return `thumbs/page-${pad(page)}.jpg?v=${CONTENT_VERSION}`; }

  function clampPage(page) {
    const n = Number.parseInt(page, 10);
    if (!Number.isFinite(n)) return currentPage;
    return Math.min(TOTAL_PAGES, Math.max(1, n));
  }

  function desktopSpreadStart(page) {
    if (page <= 1) return 1;
    if (page >= BACK_COVER_PAGE) return BACK_COVER_PAGE;
    return page % 2 === 0 ? page : page - 1;
  }

  function viewFor(page = currentPage) {
    if (mobile) return { cover: false, backCover: false, single: true, left: page, right: -1, key: `m-${page}` };
    if (page === 1) return { cover: true, backCover: false, single: true, left: 1, right: -1, key: 'cover' };
    if (page === BACK_COVER_PAGE) return { cover: false, backCover: true, single: true, left: BACK_COVER_PAGE, right: -1, key: 'back-cover' };
    const left = desktopSpreadStart(page);
    const right = Math.min(left + 1, BACK_COVER_PAGE - 1);
    return { cover: false, backCover: false, single: false, left, right: right > left ? right : -1, key: `d-${left}-${right}` };
  }

  function setLoading(show, message = 'กำลังเตรียมหน้า…') {
    el.loading.textContent = message;
    el.loading.classList.toggle('show', Boolean(show));
  }

  function toast(message, duration = 1700) {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add('show');
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), duration);
  }

  function shouldAutoHD() {
    if (qualityMode === 'hd') return true;
    if (qualityMode === 'lite') return false;
    return !networkSlow;
  }

  function preloadImage(url, cache) {
    if (cache.has(url)) return cache.get(url);
    const promise = new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = async () => { try { await img.decode?.(); } catch (_) {} resolve(img); };
      img.onerror = () => resolve(null);
      img.src = url;
    });
    cache.set(url, promise);
    return promise;
  }

  function preloadPreview(page) {
    if (page < 1 || page > TOTAL_PAGES) return Promise.resolve(null);
    return preloadImage(previewUrl(page), previewCache);
  }
  function preloadFull(page) {
    if (page < 1 || page > TOTAL_PAGES) return Promise.resolve(null);
    return preloadImage(pageUrl(page), fullCache);
  }

  async function ensurePages(pages, full = false) {
    const unique = [...new Set(pages.filter(p => p >= 1 && p <= TOTAL_PAGES))];
    if (!unique.length) return;
    setLoading(true, networkSlow && !full ? 'กำลังเตรียมหน้าประหยัดเน็ต…' : 'กำลังเตรียมหน้า…');
    await Promise.all(unique.map(p => full ? preloadFull(p) : preloadPreview(p)));
    setLoading(false);
  }

  function loadIntoImage(img, page, { immediateHD = false } = {}) {
    const token = `${page}-${performance.now()}`;
    imageUpgradeTokens.set(img, token);
    img.dataset.page = String(page);
    img.dataset.quality = 'preview';
    img.src = previewUrl(page);

    const requestHD = immediateHD || shouldAutoHD() || zoom > 1.12;
    if (!requestHD) return;
    const delay = immediateHD ? 0 : (networkSlow ? 900 : 120);
    setTimeout(async () => {
      const full = await preloadFull(page);
      if (!full || imageUpgradeTokens.get(img) !== token || Number(img.dataset.page) !== page) return;
      img.src = pageUrl(page);
      img.dataset.quality = 'hd';
      img.classList.remove('hd-arrive');
      void img.offsetWidth;
      img.classList.add('hd-arrive');
    }, delay);
  }

  function upgradeVisibleToHD() {
    const view = viewFor();
    [view.left, view.right].filter(p => p > 0).forEach(async page => {
      const full = await preloadFull(page);
      if (!full) return;
      [el.leftImg, el.rightImg].forEach(img => {
        if (Number(img.dataset.page) === page && img.dataset.quality !== 'hd') {
          img.src = pageUrl(page); img.dataset.quality = 'hd';
          img.classList.remove('hd-arrive'); void img.offsetWidth; img.classList.add('hd-arrive');
        }
      });
    });
  }

  function setSlot(slot, img, hotspots, page) {
    hotspots.innerHTML = '';
    if (page < 1 || page > TOTAL_PAGES) {
      slot.classList.add('blank'); img.removeAttribute('src'); img.alt = ''; img.dataset.page = ''; return;
    }
    slot.classList.remove('blank');
    loadIntoImage(img, page, { immediateHD: qualityMode === 'hd' || zoom > 1.2 });
    img.alt = `หน้า ${page} จาก ${TOTAL_PAGES}`;
    if (page === 3) addTocHotspots(hotspots);
  }

  function addTocHotspots(layer) {
    const firstTop = 15.9, rowGap = 5.12, rowHeight = 4.45;
    sections.forEach((section, i) => {
      const btn = document.createElement('button');
      btn.className = 'toc-hotspot'; btn.type = 'button';
      btn.style.left = '17%'; btn.style.width = '66%'; btn.style.top = `${firstTop + i * rowGap}%`; btn.style.height = `${rowHeight}%`;
      btn.setAttribute('aria-label', `ไป${section.name} หน้า ${section.page}`); btn.title = `${section.name} · หน้า ${section.page}`;
      btn.addEventListener('click', ev => { ev.stopPropagation(); navigateTo(section.page, true); });
      layer.appendChild(btn);
    });
  }

  function activeNavItem(page = currentPage) {
    if (page === BACK_COVER_PAGE) return backMatter[0];
    if (page <= 3) return frontMatter.find(item => item.page === page) || frontMatter[0];
    const view = viewFor(page);
    const visiblePage = mobile ? page : (view.right > 0 ? view.right : view.left);
    let active = sections[0];
    for (const section of sections) { if (visiblePage >= section.page) active = section; else break; }
    return active;
  }

  function resetPageSlotPresentation() {
    [el.leftSlot, el.rightSlot].forEach(slot => {
      slot?.getAnimations?.().forEach(anim => anim.cancel());
      if (!slot) return;
      slot.style.opacity = '';
      slot.style.transform = '';
      slot.style.visibility = '';
    });
  }

  function renderVisiblePages(page = currentPage) {
    // WAAPI animations with fill:"forwards" can otherwise keep a finished page
    // transparent after returning to the cover/back cover. Always restore the
    // slots before applying the new book state.
    resetPageSlotPresentation();
    const view = viewFor(page);
    el.book.classList.toggle('cover-mode', view.cover && !mobile);
    el.book.classList.toggle('back-cover-mode', view.backCover && !mobile);
    setSlot(el.leftSlot, el.leftImg, el.leftHotspots, view.left);
    setSlot(el.rightSlot, el.rightImg, el.rightHotspots, view.right);
  }

  function renderPages() {
    renderVisiblePages(currentPage);
    el.pageInput.value = String(currentPage);
    try { history.replaceState(null, '', `#page=${currentPage}`); } catch (_) {}
    updateSectionUI(); renderControlState(); schedulePrefetch(); updateFavoriteUI();
    localStorageSafeSet('hug-loei-last-page', String(currentPage));
  }

  function schedulePrefetch() {
    const view = viewFor();
    const pages = mobile
      ? [currentPage - 1, currentPage + 1, currentPage + 2]
      : view.cover ? [2, 3, 4]
      : view.backCover ? [BACK_COVER_PAGE - 2, BACK_COVER_PAGE - 1]
      : [view.left - 2, view.right + 1, view.right + 2];
    const run = () => {
      pages.filter(p => p > 0 && p <= TOTAL_PAGES).forEach(preloadPreview);
      if (shouldAutoHD()) [view.left, view.right].filter(p => p > 0).forEach(preloadFull);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 900 }); else setTimeout(run, 220);
  }

  function updateSectionUI() {
    const active = activeNavItem();
    document.querySelectorAll('[data-nav-page]').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.navPage) === active.page));
    el.sectionPill.textContent = active.name;
    el.sectionTitle.textContent = `ของฝาก ของต้อน • ${active.name}`;
    el.progressFill.style.width = `${((currentPage - 1) / Math.max(1, TOTAL_PAGES - 1)) * 100}%`;
  }

  function buildNavigation() {
    el.tabs.innerHTML = ''; el.mobileTabs.innerHTML = ''; el.drawerList.innerHTML = '';
    navItems.forEach((item, index) => {
      const extra = item.kind === 'front' ? 'frontmatter' : item.kind === 'back' ? 'backmatter' : '';
      const tab = document.createElement('button');
      tab.type = 'button'; tab.className = `bookmark-tab ${extra}`; tab.dataset.navPage = item.page; tab.style.setProperty('--tab-color', item.color);
      tab.innerHTML = `${item.short}<small>หน้า ${item.page}</small>`; tab.addEventListener('click', () => navigateTo(item.page, true)); el.tabs.appendChild(tab);

      const drawerItem = document.createElement('button');
      drawerItem.type = 'button'; drawerItem.className = `drawer-item ${extra}`; drawerItem.dataset.navPage = item.page; drawerItem.style.setProperty('--tab-color', item.color);
      drawerItem.innerHTML = `<i aria-hidden="true"></i><span>${item.name}</span><span>หน้า ${item.page}</span>`;
      drawerItem.addEventListener('click', () => { closeDrawer(); navigateTo(item.page, true); }); el.drawerList.appendChild(drawerItem);

      const mobileTab = document.createElement('button');
      mobileTab.type = 'button'; mobileTab.className = `mobile-bookmark-tab ${extra}`; mobileTab.dataset.navPage = item.page;
      mobileTab.style.setProperty('--tab-color', item.color); mobileTab.style.setProperty('--tab-delay', `${Math.min(index * 12, 120)}ms`);
      mobileTab.setAttribute('aria-label', `${item.name} หน้า ${item.page}`); mobileTab.innerHTML = `<span>${item.short}</span>`;
      mobileTab.addEventListener('click', () => peekAndNavigateTab(mobileTab, item.page)); el.mobileTabs.appendChild(mobileTab);
    });
  }

  function peekAndNavigateTab(tab, page) {
    if (animating) return;
    clearTimeout(tabPeekTimer);
    document.querySelectorAll('.mobile-bookmark-tab.peek').forEach(btn => btn.classList.remove('peek'));
    tab.classList.add('peek');
    tabPeekTimer = setTimeout(() => { navigateTo(page, true); setTimeout(() => tab.classList.remove('peek'), 820); }, 210);
  }

  function computeFit() {
    const rect = el.stage.getBoundingClientRect();
    const padX = mobile ? 50 : 62, padY = mobile ? 90 : 56;
    const availW = Math.max(160, rect.width - padX), availH = Math.max(220, rect.height - padY);
    let pageW = mobile ? Math.min(availW, availH * PAGE_ASPECT) : Math.min(availW / 2, availH * PAGE_ASPECT);
    const pageH = pageW / PAGE_ASPECT;
    document.documentElement.style.setProperty('--page-w', `${Math.floor(pageW)}px`);
    document.documentElement.style.setProperty('--page-h', `${Math.floor(pageH)}px`);
    applyZoom();
  }

  function applyZoom() {
    const baseW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w')) || 420;
    const baseH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-h')) || 560;
    const bookW = baseW * (mobile ? 1 : 2), bookH = baseH;
    el.scale.style.width = `${bookW * zoom}px`; el.scale.style.height = `${bookH * zoom}px`;
    el.book.style.transformOrigin = 'top left'; el.book.style.transform = `scale(${zoom})`;
    el.fit.textContent = zoom === 1 ? 'พอดีจอ' : `${Math.round(zoom * 100)}%`;
    if (zoom > 1.1) upgradeVisibleToHD();
  }

  function setZoom(nextZoom, focusCenter = true) {
    const oldZoom = zoom; zoom = Math.min(3, Math.max(.7, Math.round(nextZoom * 100) / 100));
    if (Math.abs(oldZoom - zoom) < .001) return;
    const scroll = el.scroll; let cx = 0, cy = 0;
    if (focusCenter) { cx = scroll.scrollLeft + scroll.clientWidth / 2; cy = scroll.scrollTop + scroll.clientHeight / 2; }
    applyZoom();
    requestAnimationFrame(() => { if (focusCenter) { const ratio = zoom / oldZoom; scroll.scrollLeft = cx * ratio - scroll.clientWidth / 2; scroll.scrollTop = cy * ratio - scroll.clientHeight / 2; } });
  }

  function fitToScreen() { zoom = 1; applyZoom(); requestAnimationFrame(() => el.scroll.scrollTo({ left:0, top:0, behavior:REDUCED_MOTION()?'auto':'smooth' })); }

  function bestFlipUrl(page) {
    if (qualityMode === 'hd' || (qualityMode === 'auto' && !networkSlow && fullCache.has(pageUrl(page)))) return pageUrl(page);
    return previewUrl(page);
  }

  function setupFlip(frontPage, backPage, direction, extraClass = '') {
    el.flipFront.src = bestFlipUrl(frontPage); el.flipBack.src = bestFlipUrl(backPage);
    el.flip.className = `flip-sheet active ${direction} ${extraClass}`.trim(); el.flip.style.transform = ''; el.flip.style.left = ''; el.flip.style.opacity = '1';
  }

  function clearFlip() {
    [el.flip, el.curlShadow, el.curlLight, el.curlEdge, el.curlRibs, ...el.curlRibs.children].forEach(node => node?.getAnimations?.().forEach(anim => anim.cancel()));
    el.flip.className = 'flip-sheet'; el.flip.style.transform = ''; el.flip.style.left = ''; el.flip.style.opacity = '';
  }

  function animateRibs(sign, duration) {
    el.curlRibs.animate([{opacity:0},{opacity:.55,offset:.28},{opacity:.82,offset:.52},{opacity:.36,offset:.78},{opacity:0}],{duration,easing:'ease-in-out',fill:'forwards'});
    [...el.curlRibs.children].forEach((rib, i, arr) => {
      const x = i / Math.max(1, arr.length - 1);
      const strength = sign < 0 ? x : 1 - x;
      rib.animate([
        { transform:'translateX(0) scaleX(.22) skewY(0deg)', opacity:.05 },
        { transform:`translateX(${sign * (2 + strength * 7)}px) scaleX(${.45 + strength * .85}) skewY(${sign * (strength * 2.1)}deg)`, opacity:.55, offset:.43 },
        { transform:`translateX(${sign * (-2 + strength * 4)}px) scaleX(${.65 + strength * .55}) skewY(${sign * (-strength * 1.4)}deg)`, opacity:.36, offset:.72 },
        { transform:'translateX(0) scaleX(.22) skewY(0deg)', opacity:.02 }
      ], { duration, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards', delay:i*3 });
    });
  }

  function animateCurl(degrees, duration = mobile ? 820 : 920) {
    const sign = degrees < 0 ? -1 : 1;
    const outerRadius = sign < 0 ? '2px 46px 44px 2px' : '46px 2px 2px 44px';
    const innerRadius = sign < 0 ? '2px 68px 58px 2px' : '68px 2px 2px 58px';
    const main = el.flip.animate([
      { transform:'rotateY(0deg) rotateX(0deg) rotateZ(0deg) translateZ(0) skewY(0deg) scaleX(1)', borderRadius:'2px', offset:0 },
      { transform:`rotateY(${degrees*.12}deg) rotateX(${sign*1.1}deg) rotateZ(${sign*.25}deg) translateZ(10px) skewY(${sign*-.45}deg) scaleX(.994)`, borderRadius:outerRadius, offset:.14 },
      { transform:`rotateY(${degrees*.30}deg) rotateX(${sign*-2.1}deg) rotateZ(${sign*-.45}deg) translateZ(30px) skewY(${sign*1.25}deg) scaleX(.955)`, borderRadius:innerRadius, offset:.33 },
      { transform:`rotateY(${degrees*.50}deg) rotateX(${sign*2.8}deg) rotateZ(${sign*.65}deg) translateZ(58px) skewY(${sign*-1.8}deg) scaleX(.84)`, borderRadius:innerRadius, offset:.50 },
      { transform:`rotateY(${degrees*.69}deg) rotateX(${sign*-2.0}deg) rotateZ(${sign*-.42}deg) translateZ(35px) skewY(${sign*1.35}deg) scaleX(.93)`, borderRadius:outerRadius, offset:.69 },
      { transform:`rotateY(${degrees*.87}deg) rotateX(${sign*.95}deg) rotateZ(${sign*.18}deg) translateZ(11px) skewY(${sign*-.45}deg) scaleX(.988)`, borderRadius:outerRadius, offset:.87 },
      { transform:`rotateY(${degrees}deg) rotateX(0deg) rotateZ(0deg) translateZ(0) skewY(0deg) scaleX(1)`, borderRadius:'2px', offset:1 }
    ], { duration, easing:'cubic-bezier(.18,.73,.16,1)', fill:'forwards' });

    el.curlShadow.animate([
      {opacity:.03,transform:'translateX(0) scaleX(.35)'},
      {opacity:.25,transform:`translateX(${sign*-2}%) scaleX(.72)`,offset:.26},
      {opacity:.58,transform:`translateX(${sign*-8}%) scaleX(1.04)`,offset:.50},
      {opacity:.28,transform:`translateX(${sign*2}%) scaleX(.66)`,offset:.77},
      {opacity:0,transform:`translateX(${sign*8}%) scaleX(.25)`}
    ], {duration,easing:'ease-in-out',fill:'forwards'});
    el.curlLight.animate([
      {opacity:0,transform:`translateX(${sign*34}%) scaleX(.55)`},
      {opacity:.42,transform:`translateX(${sign*10}%) scaleX(.85)`,offset:.28},
      {opacity:.88,transform:`translateX(${sign*-9}%) scaleX(1.06)`,offset:.51},
      {opacity:.34,transform:`translateX(${sign*-27}%) scaleX(.74)`,offset:.77},
      {opacity:0,transform:`translateX(${sign*-44}%) scaleX(.45)`}
    ], {duration,easing:'ease-in-out',fill:'forwards'});
    el.curlEdge.animate([{opacity:.08,transform:'scaleX(.55)'},{opacity:.95,transform:'scaleX(1.55)',offset:.50},{opacity:.40,transform:'scaleX(.82)',offset:.80},{opacity:.05,transform:'scaleX(.4)'}],{duration,easing:'ease-in-out',fill:'forwards'});
    animateRibs(sign,duration);
    return new Promise(resolve => { main.onfinish=resolve; main.oncancel=resolve; });
  }

  async function animateCoverOpen(target) {
    const targetView = viewFor(target), pageW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w')) || 420;
    await ensurePages([1,targetView.left,targetView.right].filter(Boolean));
    setupFlip(1,targetView.left,'next','cover-transition'); el.flip.style.left=`${pageW/2}px`;
    el.leftSlot.style.opacity='0'; el.rightSlot.style.opacity='0'; setSlot(el.leftSlot,el.leftImg,el.leftHotspots,targetView.left); setSlot(el.rightSlot,el.rightImg,el.rightHotspots,targetView.right); el.book.classList.remove('cover-mode');
    const duration=980;
    const a=el.flip.animate([
      {left:`${pageW/2}px`,transform:'rotateY(0deg) rotateX(0) translateZ(0) scaleX(1)',borderRadius:'13px'},
      {left:`${pageW*.67}px`,transform:'rotateY(-26deg) rotateX(1.3deg) translateZ(18px) scaleX(.988)',borderRadius:'4px 38px 38px 4px',offset:.20},
      {left:`${pageW*.91}px`,transform:'rotateY(-91deg) rotateX(-2.5deg) translateZ(62px) scaleX(.84)',borderRadius:'3px 64px 58px 3px',offset:.51},
      {left:`${pageW}px`,transform:'rotateY(-151deg) rotateX(1.2deg) translateZ(18px) scaleX(.976)',borderRadius:'3px 28px 28px 3px',offset:.82},
      {left:`${pageW}px`,transform:'rotateY(-180deg) rotateX(0) translateZ(0) scaleX(1)',borderRadius:'2px'}
    ],{duration,easing:'cubic-bezier(.16,.74,.15,1)',fill:'forwards'});
    animateRibs(-1,duration); el.curlShadow.animate([{opacity:.04},{opacity:.56,offset:.53},{opacity:0}],{duration,fill:'forwards'}); el.curlLight.animate([{opacity:0},{opacity:.88,offset:.50},{opacity:0}],{duration,fill:'forwards'}); el.curlEdge.animate([{opacity:.08},{opacity:.92,offset:.50},{opacity:0}],{duration,fill:'forwards'});
    const l=el.leftSlot.animate([{opacity:0},{opacity:.14,offset:.25},{opacity:1}],{duration,fill:'forwards'}),r=el.rightSlot.animate([{opacity:0},{opacity:.28,offset:.20},{opacity:1}],{duration:duration*.8,fill:'forwards'});
    await Promise.all([a.finished.catch(()=>{}),l.finished.catch(()=>{}),r.finished.catch(()=>{})]); el.leftSlot.style.opacity='';el.rightSlot.style.opacity='';
  }

  async function animateCoverClose() {
    const oldView=viewFor(currentPage),pageW=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w'))||420;
    await ensurePages([1,oldView.left]); setupFlip(1,oldView.left,'prev','cover-transition closing'); el.flip.style.left=`${pageW}px`;el.flip.style.transform='rotateY(-180deg)';
    const duration=920;
    const a=el.flip.animate([
      {left:`${pageW}px`,transform:'rotateY(-180deg) rotateX(0) translateZ(0) scaleX(1)',borderRadius:'2px'},
      {left:`${pageW*.90}px`,transform:'rotateY(-139deg) rotateX(1.1deg) translateZ(24px) scaleX(.96)',borderRadius:'3px 32px 32px 3px',offset:.22},
      {left:`${pageW*.76}px`,transform:'rotateY(-88deg) rotateX(-2.4deg) translateZ(60px) scaleX(.84)',borderRadius:'3px 62px 56px 3px',offset:.52},
      {left:`${pageW*.61}px`,transform:'rotateY(-28deg) rotateX(.9deg) translateZ(14px) scaleX(.988)',borderRadius:'4px 32px 32px 4px',offset:.82},
      {left:`${pageW/2}px`,transform:'rotateY(0deg) rotateX(0) translateZ(0) scaleX(1)',borderRadius:'13px'}
    ],{duration,easing:'cubic-bezier(.16,.74,.15,1)',fill:'forwards'});
    animateRibs(1,duration); const l=el.leftSlot.animate([{opacity:1},{opacity:.78,offset:.50},{opacity:0}],{duration,fill:'forwards'}),r=el.rightSlot.animate([{opacity:1},{opacity:.70,offset:.44},{opacity:0}],{duration:duration*.92,fill:'forwards'});
    await Promise.all([a.finished.catch(()=>{}),l.finished.catch(()=>{}),r.finished.catch(()=>{})]); el.leftSlot.style.opacity='';el.rightSlot.style.opacity='';
  }

  async function animateBackCoverClose(target) {
    const oldView=viewFor(currentPage),pageW=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w'))||420;
    await ensurePages([oldView.right || oldView.left,target]);
    setupFlip(oldView.right || oldView.left,target,'next','back-close-transition'); el.flip.style.left='var(--page-w)';
    setSlot(el.leftSlot,el.leftImg,el.leftHotspots,target); el.leftSlot.style.opacity='0'; el.rightSlot.style.opacity='1';
    await animateCurl(-180,980);
    el.rightSlot.style.opacity='0'; el.book.classList.add('back-cover-mode');
    const center=el.leftSlot.animate([{opacity:0,transform:'translateX(-50%) scale(.94)'},{opacity:1,transform:'translateX(-50%) scale(1)'}],{duration:400,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    await center.finished.catch(()=>{}); el.leftSlot.style.opacity='';el.leftSlot.style.transform='';el.rightSlot.style.opacity='';
  }

  async function animateBackCoverOpen(target) {
    const targetView=viewFor(target),pageW=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w'))||420;
    await ensurePages([BACK_COVER_PAGE,targetView.left,targetView.right]);
    setupFlip(BACK_COVER_PAGE,targetView.right || targetView.left,'prev','back-open-transition');
    el.flip.style.left=`${pageW/2}px`; el.leftSlot.style.opacity='0';el.rightSlot.style.opacity='0'; el.book.classList.remove('back-cover-mode');
    setSlot(el.leftSlot,el.leftImg,el.leftHotspots,targetView.left); setSlot(el.rightSlot,el.rightImg,el.rightHotspots,targetView.right);
    const spread=[el.leftSlot,el.rightSlot].map((node,i)=>node.animate([{opacity:0,transform:`translateX(${i?'-10px':'10px'}) scale(.98)`},{opacity:1,transform:'none'}],{duration:520,delay:110+i*45,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}));
    el.flip.style.transform='rotateY(180deg)';
    const a=el.flip.animate([
      {left:`${pageW/2}px`,transform:'rotateY(180deg) translateZ(0) scaleX(1)',borderRadius:'13px'},
      {left:`${pageW*.72}px`,transform:'rotateY(118deg) rotateX(-2deg) translateZ(55px) scaleX(.86)',borderRadius:'3px 58px 54px 3px',offset:.45},
      {left:`${pageW*.92}px`,transform:'rotateY(36deg) rotateX(1.1deg) translateZ(16px) scaleX(.98)',borderRadius:'3px 30px 30px 3px',offset:.82},
      {left:`${pageW}px`,transform:'rotateY(0deg) translateZ(0) scaleX(1)',borderRadius:'2px'}
    ],{duration:920,easing:'cubic-bezier(.16,.74,.15,1)',fill:'forwards'}); animateRibs(1,920);
    await Promise.all([a.finished.catch(()=>{}),...spread.map(x=>x.finished.catch(()=>{}))]); el.leftSlot.style.opacity='';el.rightSlot.style.opacity='';
  }

  async function navigateTo(target, animate = true) {
    target=clampPage(target); if(animating||target===currentPage)return;
    const oldView=viewFor(currentPage),targetView=viewFor(target);
    if(!mobile&&oldView.key===targetView.key){currentPage=target;renderPages();return;}
    const direction=target>currentPage?'next':'prev';
    const needed=[oldView.left,oldView.right,targetView.left,targetView.right].filter(p=>p>0);
    await ensurePages(needed,false);
    if(!animate||REDUCED_MOTION()){currentPage=target;renderPages();return;}
    animating=true;el.stage.classList.add('turning');renderControlState();playPaperSound(direction);
    try{
      if(!mobile&&oldView.cover&&!targetView.cover){await animateCoverOpen(target);}
      else if(!mobile&&!oldView.cover&&targetView.cover){await animateCoverClose();}
      else if(!mobile&&!oldView.backCover&&targetView.backCover){await animateBackCoverClose(target);}
      else if(!mobile&&oldView.backCover&&!targetView.backCover){await animateBackCoverOpen(target);}
      else if(mobile){setSlot(el.leftSlot,el.leftImg,el.leftHotspots,target);setupFlip(currentPage,target,direction);el.flip.style.left='0px';await animateCurl(direction==='next'?-180:180,mobile?860:920);}
      else if(direction==='next'){setSlot(el.rightSlot,el.rightImg,el.rightHotspots,targetView.right);setupFlip(oldView.right,targetView.left,'next');el.flip.style.left='var(--page-w)';await animateCurl(-180);}
      else{setSlot(el.leftSlot,el.leftImg,el.leftHotspots,targetView.left);setupFlip(oldView.left,targetView.right,'prev');el.flip.style.left='0px';await animateCurl(180);}
      currentPage=target;clearFlip();renderPages();
    }finally{resetPageSlotPresentation();clearFlip();animating=false;el.stage.classList.remove('turning');renderControlState();}
  }

  function canGoNext(){if(mobile)return currentPage<TOTAL_PAGES;if(currentPage===1)return true;if(currentPage===BACK_COVER_PAGE)return false;const v=viewFor();return (v.right>0&&v.right<BACK_COVER_PAGE-1)||v.right===BACK_COVER_PAGE-1;}
  function canGoPrev(){return currentPage>1;}
  function renderControlState(){el.prev.disabled=!canGoPrev()||animating;el.next.disabled=!canGoNext()||animating;}
  function nextPage(){if(animating||!canGoNext())return;if(mobile)return navigateTo(currentPage+1,true);if(currentPage===1)return navigateTo(2,true);const v=viewFor();if(v.right===BACK_COVER_PAGE-1)return navigateTo(BACK_COVER_PAGE,true);const start=desktopSpreadStart(currentPage);navigateTo(Math.min(BACK_COVER_PAGE-1,start+2),true);}
  function prevPage(){if(animating||!canGoPrev())return;if(mobile)return navigateTo(currentPage-1,true);if(currentPage===BACK_COVER_PAGE)return navigateTo(BACK_COVER_PAGE-2,true);const start=desktopSpreadStart(currentPage);if(start<=2)return navigateTo(1,true);navigateTo(start-2,true);}

  function openDrawer(){el.drawer.classList.add('open');el.drawerBackdrop.classList.add('open');el.drawer.setAttribute('aria-hidden','false');}
  function closeDrawer(){el.drawer.classList.remove('open');el.drawerBackdrop.classList.remove('open');el.drawer.setAttribute('aria-hidden','true');}
  function openContact(){closeDrawer();el.contactPanel.classList.add('open');el.panelBackdrop.classList.add('open');el.contactPanel.setAttribute('aria-hidden','false');}
  function closeContact(){el.contactPanel.classList.remove('open');el.panelBackdrop.classList.remove('open');el.contactPanel.setAttribute('aria-hidden','true');}

  function handleResize(){const nextMobile=window.innerWidth<=MOBILE_BP;if(nextMobile!==mobile){mobile=nextMobile;zoom=1;renderPages();}computeFit();}
  function toggleFullscreen(){if(!document.fullscreenElement){document.documentElement.requestFullscreen?.().catch(()=>toast('เบราว์เซอร์ไม่อนุญาตโหมดเต็มจอ'));}else document.exitFullscreen?.();}

  async function shareCurrentPage(){const url=new URL(location.href);url.hash=`page=${currentPage}`;const shareData={title:'HUG LOEI E-Book',text:`เปิดดูหน้า ${currentPage}`,url:url.toString()};if(navigator.share){try{await navigator.share(shareData);return;}catch(_){}}try{await navigator.clipboard.writeText(url.toString());toast(`คัดลอกลิงก์หน้า ${currentPage} แล้ว`);}catch(_){toast('เปิดหน้านี้จากลิงก์ในแถบที่อยู่ได้ทันที');}}

  function updateFavoriteUI(){const on=favorites.has(currentPage);if(el.favorite){el.favorite.textContent=on?'★':'☆';el.favorite.classList.toggle('active',on);el.favorite.title=on?'ยกเลิกบันทึกหน้านี้':'บันทึกหน้านี้';}if(el.mobileFavorite)el.mobileFavorite.textContent=`${on?'★':'☆'} ${on?'บันทึกแล้ว':'บันทึกหน้านี้'}`;document.querySelectorAll(`.thumb-card[data-page="${currentPage}"]`).forEach(n=>n.classList.toggle('favorited',on));}
  function toggleFavorite(page=currentPage){page=clampPage(page);if(favorites.has(page))favorites.delete(page);else favorites.add(page);localStorageSafeSet('hug-loei-favorites',JSON.stringify([...favorites].sort((a,b)=>a-b)));updateFavoriteUI();if(overviewBuilt)refreshFavoriteStates();toast(favorites.has(page)?`บันทึกหน้า ${page} แล้ว`:`นำหน้า ${page} ออกจากที่บันทึกแล้ว`);if(favoriteOnly)renderOverviewFilter();}
  function refreshFavoriteStates(){document.querySelectorAll('.thumb-card').forEach(card=>card.classList.toggle('favorited',favorites.has(Number(card.dataset.page))));}

  function cycleQuality(){qualityMode=qualityMode==='auto'?'lite':qualityMode==='lite'?'hd':'auto';localStorageSafeSet('hug-loei-quality',qualityMode);updateQualityUI();renderVisiblePages();if(qualityMode==='hd')upgradeVisibleToHD();toast(qualityMode==='lite'?'โหมดประหยัดเน็ต: ใช้ภาพเบาเป็นหลัก':qualityMode==='hd'?'โหมด HD: โหลดภาพต้นฉบับเต็มความละเอียด':'โหมด AUTO: ปรับตามความเร็วอินเทอร์เน็ต');}
  function updateQualityUI(){const label=qualityMode==='lite'?'เบา':qualityMode==='hd'?'HD':'AUTO';if(el.quality)el.quality.textContent=label;if(el.mobileQuality)el.mobileQuality.textContent=`คุณภาพ: ${label}`;el.networkBadge.hidden=!(qualityMode==='lite'||(qualityMode==='auto'&&networkSlow));}

  function toggleSound(){soundOn=!soundOn;localStorageSafeSet('hug-loei-sound',soundOn?'1':'0');updateSoundUI();if(soundOn){playPaperSound('next',true);toast('เปิดเสียงกระดาษแล้ว');}else toast('ปิดเสียงกระดาษแล้ว');}
  function updateSoundUI(){if(el.sound){el.sound.classList.toggle('active',soundOn);el.sound.textContent=soundOn?'♫':'♪';}if(el.mobileSound)el.mobileSound.textContent=`♪ เสียงกระดาษ: ${soundOn?'เปิด':'ปิด'}`;}
  function playPaperSound(direction='next',force=false){if(!soundOn&&!force)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();const dur=.24,rate=audioCtx.sampleRate,buf=audioCtx.createBuffer(1,Math.floor(rate*dur),rate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/data.length;const env=Math.sin(Math.PI*t)*Math.pow(1-t,.35);data[i]=(Math.random()*2-1)*env*.26;}const src=audioCtx.createBufferSource();src.buffer=buf;const filter=audioCtx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=direction==='next'?1500:1250;filter.Q.value=.7;const gain=audioCtx.createGain();gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.22,audioCtx.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);src.connect(filter).connect(gain).connect(audioCtx.destination);src.start();}catch(_){} }

  function sectionForPage(page){if(page<=3)return frontMatter.find(i=>i.page===page)?.short||'หน้าแรก';if(page===BACK_COVER_PAGE)return'หน้าปิด';let found=sections[0];for(const s of sections){if(page>=s.page)found=s;else break;}return found.short;}

  function buildOverview(){if(overviewBuilt)return;overviewBuilt=true;const allChip=document.createElement('button');allChip.className='section-chip';allChip.textContent='ทุกหน้า';allChip.addEventListener('click',()=>scrollThumbTo(1));el.overviewSections.appendChild(allChip);navItems.forEach(item=>{const chip=document.createElement('button');chip.className='section-chip';chip.textContent=item.short;chip.addEventListener('click',()=>scrollThumbTo(item.page));el.overviewSections.appendChild(chip);});
    const frag=document.createDocumentFragment();for(let p=1;p<=TOTAL_PAGES;p++){const card=document.createElement('button');card.type='button';card.className='thumb-card';card.dataset.page=p;card.setAttribute('aria-label',`เปิดหน้า ${p}`);card.innerHTML=`<span class="thumb-star" aria-hidden="true">☆</span><div class="thumb-wrap"><img alt="ภาพย่อหน้า ${p}" loading="lazy" decoding="async" data-src="${thumbUrl(p)}"></div><footer><strong>หน้า ${p}</strong><span>${sectionForPage(p)}</span></footer>`;card.addEventListener('click',ev=>{if(ev.target.closest('.thumb-star')){ev.stopPropagation();toggleFavorite(p);return;}closeOverview();navigateTo(p,true);});frag.appendChild(card);}el.thumbGrid.appendChild(frag);refreshFavoriteStates();
    thumbObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const img=entry.target.querySelector('img[data-src]');if(img){img.src=img.dataset.src;img.removeAttribute('data-src');}thumbObserver.unobserve(entry.target);}});},{root:el.thumbGrid,rootMargin:'320px'});document.querySelectorAll('.thumb-card').forEach(c=>thumbObserver.observe(c));}

  function openOverview(){buildOverview();closeDrawer();closeContact();el.overview.classList.add('open');el.overview.setAttribute('aria-hidden','false');renderOverviewFilter();requestAnimationFrame(()=>scrollThumbTo(currentPage,false));}
  function closeOverview(){el.overview.classList.remove('open');el.overview.setAttribute('aria-hidden','true');}
  function scrollThumbTo(page,smooth=true){const card=el.thumbGrid.querySelector(`.thumb-card[data-page="${page}"]`);if(!card)return;card.scrollIntoView({block:'center',inline:'nearest',behavior:smooth&&!REDUCED_MOTION()?'smooth':'auto'});document.querySelectorAll('.thumb-card.current').forEach(n=>n.classList.remove('current'));card.classList.add('current');}
  function renderOverviewFilter(){if(!overviewBuilt)return;el.favoriteFilter.classList.toggle('active',favoriteOnly);document.querySelectorAll('.thumb-card').forEach(card=>{const p=Number(card.dataset.page);card.hidden=favoriteOnly&&!favorites.has(p);});}

  function setupNetworkListener(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(!c)return;const update=()=>{networkSlow=detectSlowNetwork();updateQualityUI();if(!networkSlow&&qualityMode==='auto')upgradeVisibleToHD();};c.addEventListener?.('change',update);update();}
  function setupParallax(){if(mobile||REDUCED_MOTION())return;el.stage.addEventListener('pointermove',ev=>{const r=el.stage.getBoundingClientRect();const x=((ev.clientX-r.left)/r.width-.5)*2,y=((ev.clientY-r.top)/r.height-.5)*2;document.documentElement.style.setProperty('--px',x.toFixed(3));document.documentElement.style.setProperty('--py',y.toFixed(3));},{passive:true});el.stage.addEventListener('pointerleave',()=>{document.documentElement.style.setProperty('--px','0');document.documentElement.style.setProperty('--py','0');},{passive:true});}

  function bindEvents(){
    el.prev.addEventListener('click',prevPage);el.next.addEventListener('click',nextPage);el.edgePrev.addEventListener('click',prevPage);el.edgeNext.addEventListener('click',nextPage);
    el.pageInput.addEventListener('change',()=>navigateTo(el.pageInput.value,true));el.pageInput.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();el.pageInput.blur();navigateTo(el.pageInput.value,true);}});
    el.zoomIn.addEventListener('click',()=>setZoom(zoom+.25));el.zoomOut.addEventListener('click',()=>setZoom(zoom-.25));el.fit.addEventListener('click',fitToScreen);el.fullscreen?.addEventListener('click',toggleFullscreen);el.share?.addEventListener('click',shareCurrentPage);
    el.overviewBtn.addEventListener('click',openOverview);el.closeOverview.addEventListener('click',closeOverview);el.overview.addEventListener('click',ev=>{if(ev.target===el.overview)closeOverview();});el.favoriteFilter.addEventListener('click',()=>{favoriteOnly=!favoriteOnly;renderOverviewFilter();});
    el.favorite?.addEventListener('click',()=>toggleFavorite());el.mobileFavorite?.addEventListener('click',()=>toggleFavorite());el.quality?.addEventListener('click',cycleQuality);el.mobileQuality?.addEventListener('click',cycleQuality);el.sound?.addEventListener('click',toggleSound);el.mobileSound?.addEventListener('click',toggleSound);
    el.tocBtn.addEventListener('click',openDrawer);el.closeDrawer.addEventListener('click',closeDrawer);el.drawerBackdrop.addEventListener('click',closeDrawer);el.openTocPage.addEventListener('click',()=>{closeDrawer();navigateTo(3,true);});
    [el.organizerCorner,el.contactFab,el.mobileContact].filter(Boolean).forEach(btn=>btn.addEventListener('click',openContact));el.closeContact.addEventListener('click',closeContact);el.panelBackdrop.addEventListener('click',closeContact);

    document.addEventListener('keydown',ev=>{if(ev.target instanceof HTMLInputElement)return;if(ev.key==='ArrowRight'||ev.key==='PageDown')nextPage();if(ev.key==='ArrowLeft'||ev.key==='PageUp')prevPage();if(ev.key==='Home')navigateTo(1,true);if(ev.key==='End')navigateTo(TOTAL_PAGES,true);if(ev.key==='Escape'){closeDrawer();closeContact();closeOverview();}if((ev.ctrlKey||ev.metaKey)&&(ev.key==='+'||ev.key==='=')){ev.preventDefault();setZoom(zoom+.25);}if((ev.ctrlKey||ev.metaKey)&&ev.key==='-'){ev.preventDefault();setZoom(zoom-.25);}if((ev.ctrlKey||ev.metaKey)&&ev.key==='0'){ev.preventDefault();fitToScreen();}});
    el.stage.addEventListener('dblclick',ev=>{if(ev.target.closest('button'))return;setZoom(zoom===1?1.8:1);});
    el.stage.addEventListener('touchstart',ev=>{if(ev.touches.length!==1||zoom>1.05){swipeStart=null;return;}const t=ev.touches[0];swipeStart={x:t.clientX,y:t.clientY,time:performance.now()};},{passive:true});
    el.stage.addEventListener('touchend',ev=>{if(!swipeStart||!ev.changedTouches.length)return;const t=ev.changedTouches[0],dx=t.clientX-swipeStart.x,dy=t.clientY-swipeStart.y,dt=performance.now()-swipeStart.time;swipeStart=null;if(dt<760&&Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)*1.14){if(dx<0)nextPage();else prevPage();}},{passive:true});
    let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(handleResize,80);});window.addEventListener('hashchange',()=>{const m=location.hash.match(/page=(\d+)/);if(m)navigateTo(m[1],false);});
  }

  function registerServiceWorker(){if(!('serviceWorker'in navigator)||location.protocol==='file:')return;window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  function showFirstUseHint(){try{const key='hug-loei-v3-hint';if(localStorage.getItem(key))return;localStorage.setItem(key,'1');setTimeout(()=>toast(mobile?'ปัดซ้าย–ขวาเพื่อเปิดหน้า • แตะที่คั่นสีด้านขวาเพื่อข้ามอำเภอ':'ใช้ลูกศร ← → เพื่อเปิดหน้า • ที่คั่นอยู่ด้านขวา • ปุ่ม ▦ เปิดภาพรวมทุกหน้า',4700),1250);}catch(_){}}

  async function init(){
    el.pageInput.max=String(TOTAL_PAGES);el.pageTotal.textContent=`/ ${TOTAL_PAGES}`;
    buildNavigation();bindEvents();registerServiceWorker();setupNetworkListener();setupParallax();updateQualityUI();updateSoundUI();
    const hash=location.hash.match(/page=(\d+)/);if(hash)currentPage=clampPage(hash[1]);
    computeFit();const first=viewFor();await ensurePages([first.left,first.right,2,3].filter(p=>p>0));renderPages();showFirstUseHint();
  }
  init();
})();
