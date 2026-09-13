/* ============================================================
   MadhavPrem — animations.js
   Rich motion layer built on GSAP + ScrollTrigger.
   Degrades gracefully: if GSAP fails to load (e.g. offline),
   every element still ends up visible via the CSS fallback.
   ============================================================ */
(function () {
  const hasGSAP = typeof window.gsap !== 'undefined';

  if (!hasGSAP) {
    // No GSAP available — just make sure nothing stays hidden.
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('DOMContentLoaded', () => {
    /* ---- Hero entrance (dashboard panel) ---- */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const panel = document.querySelector('.hero-panel');
    const panelSideLeft = document.querySelector('.panel-side');
    const panelFeatured = document.querySelector('.panel-featured');
    const badge = document.querySelector('.hero-badge');
    const heading = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');
    const heroBtns = document.querySelector('.hero .buttons');
    const orbitWrap = document.querySelector('.orbit-wrap');
    const orbitRing = document.querySelector('.orbit-ring');
    const floatingProduct = document.querySelector('.floating-product');
    const panelBottom = document.querySelector('.panel-bottom');
    const splitMedia = document.querySelector('.hero-split-media img');
    const splitStats = document.querySelector('.hero-split-stats');
    const collageImgs = document.querySelectorAll('.collage-img');
    const wordmarkText = document.querySelector('.wordmark-text');
    const wordmarkPhoto = document.querySelector('.wordmark-photo');
    const wordmarkCaption = document.querySelector('.wordmark-caption');
    const wordmarkBadge = document.querySelector('.wordmark-badge');
    const heroOrbitDecors = document.querySelectorAll('.hero-orbit-decor');

    if (heading) {
      // Split the heading into words for a staggered reveal.
      const words = heading.textContent.trim().split(/\s+/);
      heading.innerHTML = words.map(w => `<span class="mp-word"><span>${w}</span></span>`).join(' ');
      gsap.set('.mp-word > span', { display: 'inline-block' });
    }

    if (panel) heroTl.from(panel, { opacity: 0, y: 30, duration: 0.8 }, 0);
    if (panelSideLeft) heroTl.from(panelSideLeft.children, { opacity: 0, x: -20, duration: 0.6, stagger: 0.12 }, 0.2);
    if (panelFeatured) heroTl.from(panelFeatured, { opacity: 0, x: 20, duration: 0.6 }, 0.2);
    if (orbitWrap) heroTl.from(orbitWrap, { opacity: 0, scale: 0.8, duration: 0.7 }, 0.15);
    if (badge) heroTl.from(badge, { opacity: 0, y: 12, duration: 0.5 }, 0.4);
    if (heading) heroTl.from('.mp-word > span', { yPercent: 120, opacity: 0, duration: 0.6, stagger: 0.05 }, 0.48);
    if (heroP) heroTl.from(heroP, { opacity: 0, y: 10, duration: 0.5 }, 0.7);
    if (heroBtns) heroTl.from(heroBtns.children, { opacity: 0, y: 10, duration: 0.45, stagger: 0.08 }, 0.8);
    if (panelBottom) heroTl.from(panelBottom.children, { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, 0.5);
    if (splitMedia) heroTl.from(splitMedia, { scale: 1.2, duration: 1.4, ease: 'power2.out' }, 0);
    if (splitStats) heroTl.from(splitStats.children, { opacity: 0, y: 12, duration: 0.5, stagger: 0.08 }, 0.9);
    if (collageImgs.length) heroTl.from(collageImgs, { opacity: 0, y: 30, scale: 0.94, duration: 0.7, stagger: 0.12 }, 0.5);
    if (wordmarkText) heroTl.from(wordmarkText, { opacity: 0, scale: 1.15, duration: 1, ease: 'power2.out' }, 0);
    if (wordmarkPhoto) heroTl.from(wordmarkPhoto, { opacity: 0, y: 40, scale: 0.9, duration: 0.8, ease: 'back.out(1.4)' }, 0.35);
    if (wordmarkCaption) heroTl.from(wordmarkCaption, { opacity: 0, x: -20, duration: 0.6 }, 0.7);
    if (wordmarkBadge) heroTl.from(wordmarkBadge, { opacity: 0, x: 20, duration: 0.6 }, 0.8);
    if (heroOrbitDecors.length) heroTl.from(heroOrbitDecors, { opacity: 0, scale: 0.8, duration: 1, stagger: 0.15 }, 0);
    heroOrbitDecors.forEach((decor, i) => {
      const ring = decor.querySelector('.orbit-ring');
      if (ring) gsap.to(ring, { rotate: i % 2 === 0 ? 360 : -360, duration: 26, ease: 'none', repeat: -1 });
    });

    /* ---- Continuous orbit rotation + gentle float on the product photo ---- */
    if (orbitRing) gsap.to(orbitRing, { rotate: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    if (floatingProduct) {
      gsap.to(floatingProduct, { y: -10, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }

    /* ---- Scroll-triggered reveals (replaces the plain IntersectionObserver version) ---- */
    const groups = {};
    document.querySelectorAll('.reveal').forEach(el => {
      const parent = el.parentElement;
      const key = parent ? parent.className + Array.from(parent.children).indexOf(el) / 100 : Math.random();
      (groups[parent] = groups[parent] || []).push(el);
    });
    Object.values(groups).forEach(els => {
      gsap.set(els, { opacity: 0, y: 26 });
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }),
        once: true,
      });
    });

    /* ---- Product / category card tilt on hover ---- */
    const tiltTargets = document.querySelectorAll('.product-card, .cat-card, .feature-card');
    tiltTargets.forEach(card => {
      let bounds;
      const strength = 8;

      function onEnter() { bounds = card.getBoundingClientRect(); }
      function onMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        const px = (e.clientX - bounds.left) / bounds.width - 0.5;
        const py = (e.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(card, {
          rotateX: py * -strength, rotateY: px * strength, translateY: -6,
          transformPerspective: 700, duration: 0.4, ease: 'power2.out',
        });
      }
      function onLeave() {
        gsap.to(card, { rotateX: 0, rotateY: 0, translateY: 0, duration: 0.5, ease: 'power2.out' });
      }
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });

    /* ---- Refresh ScrollTrigger once product grids finish rendering async ---- */
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });
})();
