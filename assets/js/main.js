document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll reveal animations
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Navbar background change on scroll
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });
});
