document.addEventListener('DOMContentLoaded', () => {
  // --- Background Video (looped trailer) ---
  // Autoplay requires muted; retry play() once on the first user
  // interaction in case the browser blocked the initial start.
  const bgVideo = document.getElementById('bg-trailer');
  if (bgVideo) {
    const startBgVideo = () => {
      const promise = bgVideo.play();
      if (promise !== undefined && typeof promise.catch === 'function') {
        promise.catch(() => {
          // Autoplay still blocked - retry on first interaction.
          const retry = () => {
            bgVideo.play().catch(() => {});
            document.removeEventListener('pointerdown', retry);
            document.removeEventListener('keydown', retry);
            document.removeEventListener('scroll', retry);
          };
          document.addEventListener('pointerdown', retry);
          document.addEventListener('keydown', retry);
          document.addEventListener('scroll', retry);
        });
      }
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startBgVideo();
    } else {
      window.addEventListener('load', startBgVideo);
    }
  }

  // --- Language Switcher Logic ---
  const switcher = document.querySelector('.lang-switcher button');
  const menu = document.querySelector('.lang-menu');
  
  if (switcher && menu) {
    switcher.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // Save preference when a language is clicked
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        const lang = link.getAttribute('href').replace(/\//g, '') || 'en';
        localStorage.setItem('pref_lang', lang);
      });
    });
  }

  // --- Auto-Language Detection ---
  const supportedLangs = ['en', 'ru', 'ua', 'fr', 'de', 'jp', 'zh'];
  const currentPath = window.location.pathname;
  const baseurl = ""; // Root domain usage

  
  // Normalize path by removing baseurl and trailing slash
  let normalizedPath = currentPath.replace(baseurl, '');
  if (normalizedPath === '' || normalizedPath === '/') {
    const savedLang = localStorage.getItem('pref_lang');
    const browserLang = navigator.language.split('-')[0]; // e.g., 'ru-RU' -> 'ru'
    
    const targetLang = savedLang || (supportedLangs.includes(browserLang) ? browserLang : 'en');
    
    // Redirect only if target is not English (root)
    if (targetLang !== 'en' && supportedLangs.includes(targetLang)) {
      window.location.href = baseurl + (baseurl.endsWith('/') ? '' : '/') + targetLang + '/';
    }
  }

  // --- UI Interactions ---
  // Navbar background change on scroll
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      if (nav) nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    } else {
      if (nav) nav.style.boxShadow = 'none';
    }
  });

  // Reveal animations
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // --- Ordered spawn animations for all visual blocks ---
  // Every .spawnable block plays a one-shot spawn (fade + slide in
  // from the left or the right side, see style.css) as soon as at
  // least 10% of it comes into the field of view:
  //   * the entry side alternates per block (even -> left, odd ->
  //     right, in document order);
  //   * blocks that are physically taller than the viewport (small
  //     phones) can never be fully visible, so the 10% rule guarantees
  //     they still spawn;
  //   * blocks are started strictly in document order: blocks that
  //     become ready at the same time (e.g. on page load) are
  //     staggered by SPAWN_STAGGER_MS so the order stays visible.
  if (document.documentElement.classList.contains('spawn-js')) {
    const SPAWN_STAGGER_MS = 110;
    const SPAWN_DONE_MS = 700; // CSS spawn-in duration (0.65s) + margin
    const SPAWN_MIN_VISIBLE = 0.1; // ready when >= 10% of the block is visible

    // querySelectorAll returns document order - that is the spawn order.
    const items = Array.from(document.querySelectorAll('.spawnable')).map(
      (el, index) => {
        // Alternate the entry side per block.
        el.classList.add(index % 2 === 0 ? 'spawn-from-left' : 'spawn-from-right');
        return { el, ready: false, started: false };
      }
    );

    let busyUntil = 0;
    let pumpTimer = null;

    const startItem = (item) => {
      item.started = true;
      item.el.classList.add('spawned');
      // Drop the animation class after the animation so the block's
      // normal hover styles (transform/transition) apply again.
      setTimeout(() => {
        item.el.classList.remove('spawned');
        item.el.classList.add('spawned-done');
      }, SPAWN_DONE_MS);
    };

    const pump = () => {
      pumpTimer = null;
      const next = items.find((i) => i.ready && !i.started);
      if (!next) return;
      const now = performance.now();
      if (now < busyUntil) {
        // Keep the document order: wait for the stagger slot.
        pumpTimer = setTimeout(pump, Math.ceil(busyUntil - now));
        return;
      }
      startItem(next);
      busyUntil = now + SPAWN_STAGGER_MS;
      pumpTimer = setTimeout(pump, SPAWN_STAGGER_MS);
    };

    const schedulePump = () => {
      if (pumpTimer === null) pumpTimer = setTimeout(pump, 0);
    };

    const spawnObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = items.find((i) => i.el === entry.target);
          // 0.005 tolerance: floating point may report 0.0999999
          // instead of exactly 0.1.
          if (item && !item.ready && entry.isIntersecting &&
              entry.intersectionRatio >= SPAWN_MIN_VISIBLE - 0.005) {
            item.ready = true;
            spawnObserver.unobserve(entry.target);
            schedulePump();
          }
        });
      },
      // One threshold is enough: a block becomes ready the moment
      // at least 10% of it is visible (EndrII review 2026-11-13).
      { threshold: SPAWN_MIN_VISIBLE }
    );

    items.forEach((item) => spawnObserver.observe(item.el));
  }

  // --- Lightbox Logic ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.screenshot-gallery img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }
});

// --- Lore Easter Egg for curious explorers ---
console.log(
  '%c [ SYSTEM DEPLOYMENT STATUS: STABLE ] \n %c Primary Mission: Establish self-sustaining colony on hostile surface. \n %c Operational Efficiency: 98.7% \n %c Protocol: %c SEARCHING FOR LOGICAL MINDS... \n %c JOIN THE MISSION: %c https://discord.gg/FRpw2565Sy ',
  'color: #ffb703; font-weight: bold; background-color: #081c15; padding: 5px; font-family: monospace;',
  'color: #2d6a4f; font-family: monospace;',
  'color: #2d6a4f; font-family: monospace;',
  'color: #2d6a4f; font-family: monospace;',
  'color: #fb8500; font-weight: bold; background-color: #081c15; padding: 2px; font-family: monospace;',
  'color: #2d6a4f; font-family: monospace;',
  'color: #ffb703; font-weight: bold; text-decoration: underline; font-family: monospace;'
);

