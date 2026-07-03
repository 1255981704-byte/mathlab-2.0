/* =====================================================================
   IGNITE DECK ENGINE — navigation, modal, MathJax re-typeset
   Drop-in: requires the markup conventions from the templates
   (.progress-nav > .pn-item[data-go], .deck > .slide[data-slide],
    .controls, .modal with .vid-slot[data-vid] / .expand-hint).
   The progress nav items are auto-generated from the slides if absent.
   ===================================================================== */
(function () {
    'use strict';

    const slides = Array.from(document.querySelectorAll('.slide'));
    const total = slides.length;
    if (!total) return;
    let idx = 0;

    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const curEl = document.getElementById('cur');
    const totEl = document.getElementById('tot');
    const modal = document.getElementById('modal');
    if (totEl) totEl.textContent = total;

    const pnItems = Array.from(document.querySelectorAll('.pn-item'));

    function render() {
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        pnItems.forEach((p, i) => {
            p.classList.toggle('active', i === idx);
            p.classList.toggle('done', i < idx);
        });
        if (curEl) curEl.textContent = idx + 1;
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === total - 1;
    }
    function go(n) { idx = Math.max(0, Math.min(total - 1, n)); render(); }

    if (prevBtn) prevBtn.addEventListener('click', () => go(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(idx + 1));
    pnItems.forEach(p => p.addEventListener('click', () => {
        const n = parseInt(p.dataset.go, 10);
        if (!isNaN(n)) go(n);
    }));

    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('open')) return;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
        else if (e.key === 'Home') { go(0); }
        else if (e.key === 'End') { go(total - 1); }
    });

    const deck = document.querySelector('.deck');
    let wheelLock = false;
    if (deck) deck.addEventListener('wheel', (e) => {
        if (wheelLock) return;
        if (e.target.closest('.box-body') || e.target.closest('.vid-slot') || (modal && e.target.closest('.modal'))) return;
        if (Math.abs(e.deltaY) < 25) return;
        wheelLock = true;
        go(idx + (e.deltaY > 0 ? 1 : -1));
        setTimeout(() => wheelLock = false, 500);
    }, { passive: true });

    let touchY = null;
    document.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', (e) => {
        if (touchY === null) return;
        const dy = e.changedTouches[0].clientY - touchY;
        if (Math.abs(dy) > 50) go(idx + (dy < 0 ? 1 : -1));
        touchY = null;
    }, { passive: true });

    /* ===== Expand modal ===== */
    if (modal) {
        const modalSlot = document.getElementById('modalSlot');
        const modalLabel = document.getElementById('modalLabel');
        const modalCaption = document.getElementById('modalCaption');
        const modalClose = document.getElementById('modalClose');

        function openModal(label, sourceVideo) {
            if (modalLabel) modalLabel.textContent = label;
            if (modalCaption) modalCaption.textContent = label;
            if (modalSlot) {
                const existing = modalSlot.querySelector('video');
                if (existing) existing.remove();
                if (sourceVideo) { sourceVideo.pause(); modalSlot.appendChild(sourceVideo); }
            }
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }

        document.querySelectorAll('.slide .expand-hint').forEach(hint => {
            hint.addEventListener('click', (e) => {
                e.stopPropagation();
                const slot = hint.closest('.vid-slot');
                const label = slot.querySelector('.vid-label')?.textContent || 'VIDEO';
                openModal(label, slot.querySelector('video'));
            });
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        if (modalClose) modalClose.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
    }

    /* ===== Optional course drawer component ===== */
    (function initCourseDrawer() {
        const cfg = window.IGNITE_COURSE_NAV;
        if (!cfg || !Array.isArray(cfg.items) || document.getElementById('courseDrawer')) return;

        const currentFile = decodeURIComponent((window.location.pathname.split('/').pop() || '').toLowerCase());

        const toggle = document.createElement('button');
        toggle.className = 'course-toggle';
        toggle.type = 'button';
        toggle.id = 'courseToggle';
        toggle.setAttribute('aria-controls', 'courseDrawer');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg><span>COURSE MAP</span>';

        const scrim = document.createElement('div');
        scrim.className = 'course-scrim';
        scrim.id = 'courseScrim';

        const drawer = document.createElement('aside');
        drawer.className = 'course-drawer';
        drawer.id = 'courseDrawer';
        drawer.setAttribute('aria-label', cfg.label || 'Course navigation');

        const head = document.createElement('div');
        head.className = 'course-drawer-head';
        const titleWrap = document.createElement('div');
        titleWrap.innerHTML =
            '<div class="course-eyebrow"></div>' +
            '<div class="course-title"></div>' +
            '<div class="course-subtitle"></div>';
        titleWrap.querySelector('.course-eyebrow').textContent = cfg.course || 'IGNITE COURSE';
        titleWrap.querySelector('.course-title').textContent = cfg.module || 'Course Map';
        titleWrap.querySelector('.course-subtitle').textContent = cfg.subtitle || 'Jump between lesson pages.';

        const close = document.createElement('button');
        close.className = 'course-close';
        close.type = 'button';
        close.setAttribute('aria-label', 'Close course map');
        close.textContent = '×';
        head.append(titleWrap, close);

        const links = document.createElement('nav');
        links.className = 'course-links';
        cfg.items.forEach((item) => {
            const el = item.href ? document.createElement('a') : document.createElement('div');
            const isCurrent = item.href && item.href.toLowerCase() === currentFile;
            el.className = 'course-link' + (isCurrent ? ' active' : '') + (!item.href ? ' disabled' : '');
            if (item.href) el.href = item.href;
            if (isCurrent) el.setAttribute('aria-current', 'page');

            const badge = isCurrent ? 'NOW' : (item.badge || (item.href ? 'HTML' : 'SOON'));
            el.innerHTML =
                '<span class="course-no"></span>' +
                '<span class="course-name"></span>' +
                '<span class="course-badge"></span>';
            el.querySelector('.course-no').textContent = String(item.no).padStart(2, '0');
            el.querySelector('.course-name').textContent = item.title;
            el.querySelector('.course-badge').textContent = badge;
            links.appendChild(el);
        });

        const foot = document.createElement('div');
        foot.className = 'course-drawer-foot';
        foot.textContent = cfg.footer || 'ESC closes this map // Arrow keys still move slides';

        drawer.append(head, links, foot);
        document.body.prepend(toggle, scrim, drawer);

        function setOpen(open) {
            drawer.classList.toggle('open', open);
            scrim.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
        }

        toggle.addEventListener('click', () => setOpen(true));
        close.addEventListener('click', () => setOpen(false));
        scrim.addEventListener('click', () => setOpen(false));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
        });
    })();

    /* ===== MathJax: typeset only after its startup has fully completed ===== */
    function typesetMath() {
        if (window.MathJax && MathJax.startup) {
            MathJax.startup.promise.then(function () {
                if (typeof MathJax.typesetPromise === 'function') MathJax.typesetPromise().catch(function () {});
            }).catch(function () {});
            return true;
        }
        return false;
    }
    (function waitForMathJax() { if (!typesetMath()) setTimeout(waitForMathJax, 150); })();

    render();
})();
