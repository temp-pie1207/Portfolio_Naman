/**
 * DarkSoulsHoloCard — ThreeUI Runtime Component
 * Variant: The Ashen One ("ashen-one")
 * Canonical Source: /landing-pages/dark-souls-holo-card.html
 */

export const DARK_SOULS_HOLO_CARD_VARIANTS = ['ashen-one', 'cindermane'];

export const DARK_SOULS_DOCUMENTS = {
  'ashen-one': 'landing-pages/dark-souls-holo-card.html',
  cindermane: 'landing-pages/dark-souls-holo-card-cindermane.html',
};

export const DARK_SOULS_TITLES = {
  'ashen-one': 'Dark Souls Holo Card — The Ashen One',
  cindermane: 'Dark Souls Holo Card — Cindermane',
};

export function initDarkSoulsHoloCard(container, options = {}) {
  if (!container) return null;

  const variant = DARK_SOULS_HOLO_CARD_VARIANTS.includes(options.variant)
    ? options.variant
    : 'ashen-one';

  const docUrl = DARK_SOULS_DOCUMENTS[variant];
  const title = DARK_SOULS_TITLES[variant];

  // Set host attributes and styles
  container.className = `threeui-background dark-souls-holo-card ${options.className || ''}`.trim();
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'Interactive Dark Souls holographic card');
  container.setAttribute('data-state', 'loading');

  Object.assign(container.style, {
    position: 'relative',
    overflow: 'hidden',
    background: '#050404',
    pointerEvents: 'auto',
    width: '100%',
    height: '100%',
    ...(options.style || {})
  });

  // Create iframe element
  const iframe = document.createElement('iframe');
  iframe.title = title;
  iframe.src = docUrl;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('loading', 'eager');

  Object.assign(iframe.style, {
    position: 'absolute',
    inset: '0',
    display: 'block',
    width: '100%',
    height: '100%',
    border: '0',
    background: '#050404',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 300ms ease-out',
  });

  iframe.addEventListener('load', () => {
    container.setAttribute('data-state', 'ready');
    iframe.style.opacity = '1';
    iframe.style.pointerEvents = 'auto';
    if (typeof options.onReady === 'function') {
      options.onReady();
    }
  });

  container.appendChild(iframe);

  // IntersectionObserver to pause/resume
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        container.setAttribute('data-state', 'paused');
      } else if (iframe.style.opacity === '1') {
        container.setAttribute('data-state', 'ready');
      }
    }, { rootMargin: '80px' });
    observer.observe(container);
  }

  return {
    container,
    iframe,
    destroy() {
      container.innerHTML = '';
    }
  };
}

/**
 * Orchestrates the full-screen opening stage with the DarkSoulsHoloCard
 * and scroll-driven exit transition into the main portfolio.
 * 
 * Behavior:
 * 1. Scrolling is locked until the 3D card intro animation completes.
 * 2. Once the card has fully kindled and settled, scrolling is unlocked
 *    and the "SCROLL TO ENTER PORTFOLIO" prompt appears.
 * 3. Scrolling down then triggers the portfolio opening animation.
 */
export function setupHoloOpeningStage({
  stageId = 'opening-stage',
  viewportId = 'holo-sticky-viewport',
  mountId = 'holo-card-mount',
  promptId = 'holo-enter-prompt',
  variant = 'ashen-one'
} = {}) {
  const stage = document.getElementById(stageId);
  const viewport = document.getElementById(viewportId);
  const mount = document.getElementById(mountId);
  const prompt = document.getElementById(promptId);

  if (!stage || !mount) return null;

  let introCompleted = false;
  let isOpening = false;
  let touchStartY = 0;

  // 1. Lock scrolling on page load so intro animation MUST complete first
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  if (prompt) {
    prompt.style.opacity = '0';
    prompt.style.pointerEvents = 'none';
    prompt.style.transform = 'translate(-50%, 15px)';
  }

  function preventEarlyScroll(e) {
    if (!introCompleted) {
      if (e.type === 'keydown') {
        const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', ' ', 'Home', 'End'];
        if (keys.includes(e.key)) e.preventDefault();
      } else {
        e.preventDefault();
      }
    }
  }

  window.addEventListener('wheel', preventEarlyScroll, { passive: false });
  window.addEventListener('touchmove', preventEarlyScroll, { passive: false });
  window.addEventListener('keydown', preventEarlyScroll, { passive: false });

  // 2. Unlock scrolling once the 3D card intro animation is complete
  function completeIntroAnimation() {
    if (introCompleted) return;
    introCompleted = true;
    console.log('[HOLO CARD] Intro animation completed. Unlocking scroll.');

    // Remove early scroll locks
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.removeEventListener('wheel', preventEarlyScroll);
    window.removeEventListener('touchmove', preventEarlyScroll);
    window.removeEventListener('keydown', preventEarlyScroll);

    // Reveal the "SCROLL TO ENTER PORTFOLIO" prompt with elegant entrance
    if (prompt) {
      prompt.style.transition = 'opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      prompt.style.opacity = '1';
      prompt.style.pointerEvents = 'auto';
      prompt.style.transform = 'translate(-50%, 0)';
    }
  }

  // 3. Open portfolio with cinematic exit & entrance animation
  function openPortfolioWithAnimation() {
    if (!introCompleted || isOpening) return;
    isOpening = true;

    // Animate holographic stage exit
    mount.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease, filter 0.75s ease';
    mount.style.transform = 'translate3d(0, -95px, 0) scale(0.85)';
    mount.style.opacity = '0';
    mount.style.filter = 'blur(10px)';

    if (prompt) {
      prompt.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      prompt.style.opacity = '0';
      prompt.style.pointerEvents = 'none';
      prompt.style.transform = 'translate(-50%, 10px)';
    }

    // Animate hero section entrance
    const heroSection = document.getElementById('home');
    if (heroSection) {
      heroSection.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
      heroSection.style.opacity = '1';
      heroSection.style.transform = 'translate3d(0, 0, 0)';
      heroSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: stage.offsetTop + stage.offsetHeight,
        behavior: 'smooth'
      });
    }

    setTimeout(() => {
      stage.style.pointerEvents = 'none';
      if (viewport) viewport.style.pointerEvents = 'none';
      isOpening = false;
    }, 900);
  }

  // Global enterPortfolio function (also called by clicking the prompt)
  window.enterPortfolio = function() {
    if (introCompleted) {
      openPortfolioWithAnimation();
    }
  };

  // 4. Initialize ThreeUI holographic card
  const cardInstance = initDarkSoulsHoloCard(mount, {
    variant,
    onReady: () => {
      // Safe fallback: if postMessage takes longer than 2.8s after iframe ready, complete intro
      setTimeout(completeIntroAnimation, 2800);
    }
  });

  // 5. Listen for intro completion message & forwarded wheel events from iframe
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'holo-intro-complete') {
      completeIntroAnimation();
    }

    if (event.data.type === 'holo-scroll') {
      if (introCompleted && event.data.deltaY > 0) {
        openPortfolioWithAnimation();
      }
    }
  });

  // 6. User scroll / wheel detection on the window
  window.addEventListener('wheel', (e) => {
    if (introCompleted && window.scrollY <= 60 && e.deltaY > 0) {
      openPortfolioWithAnimation();
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (introCompleted && window.scrollY <= 60 && e.changedTouches && e.changedTouches[0]) {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchStartY - touchEndY > 40) {
        // Swiped up -> scroll down to open portfolio
        openPortfolioWithAnimation();
      }
    }
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (introCompleted && window.scrollY <= 60) {
      const downKeys = ['ArrowDown', 'PageDown', 'Space', ' '];
      if (downKeys.includes(e.key)) {
        e.preventDefault();
        openPortfolioWithAnimation();
      }
    }
  });

  // 7. Scroll listener to restore card if user scrolls back to top
  window.addEventListener('scroll', () => {
    if (introCompleted && window.scrollY <= 15) {
      mount.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out, filter 0.5s ease-out';
      mount.style.transform = 'translate3d(0, 0, 0) scale(1)';
      mount.style.opacity = '1';
      mount.style.filter = 'none';

      stage.style.pointerEvents = 'auto';
      if (viewport) viewport.style.pointerEvents = 'auto';

      if (prompt) {
        prompt.style.transition = 'opacity 0.4s ease-out';
        prompt.style.opacity = '1';
        prompt.style.pointerEvents = 'auto';
        prompt.style.transform = 'translate(-50%, 0)';
      }
    }
  }, { passive: true });

  return {
    stage,
    viewport,
    mount,
    cardInstance,
    completeIntroAnimation,
    openPortfolioWithAnimation,
    destroy() {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      if (cardInstance) cardInstance.destroy();
    }
  };
}
