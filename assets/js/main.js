document.addEventListener('DOMContentLoaded', () => {
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

