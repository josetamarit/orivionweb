/* ============================================
   ORIVION — Scripts
   Solo lo que aporta algo: navegación, revelado
   discreto, contadores, carrusel, formulario.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // NAVBAR AL HACER SCROLL
  // ============================================
  const navbar = document.getElementById('navbar');

  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============================================
  // MENÚ MÓVIL
  // ============================================
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    const closeMenu = () => {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    // Escape cierra el menú
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });
  }

  // ============================================
  // REVELADO AL SCROLL
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ============================================
  // CONTADORES
  // ============================================
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    if (Number.isNaN(target)) return;

    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';

    if (prefersReducedMotion) {
      element.textContent = prefix + target + suffix;
      return;
    }

    const duration = 1600;
    const startTime = performance.now();
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      element.textContent = prefix + Math.floor(target * easeOutQuart(progress)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ============================================
  // CARRUSEL DE TESTIMONIOS
  // ============================================
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dots = Array.from(document.querySelectorAll('.testimonial-dot'));

  if (track && prevBtn && nextBtn) {
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    let currentSlide = 0;
    let autoSlide = null;

    const cardsPerView = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const maxSlide = () => Math.max(0, cards.length - cardsPerView());

    function render() {
      if (!cards.length) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      track.style.transform = `translateX(-${currentSlide * (cards[0].offsetWidth + gap)}px)`;

      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide >= maxSlide();
      prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
      nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
    }

    function goTo(index) {
      currentSlide = Math.max(0, Math.min(index, maxSlide()));
      render();
    }

    prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
    nextBtn.addEventListener('click', () => goTo(currentSlide + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    window.addEventListener('resize', () => goTo(currentSlide));

    // Avance automático, pausado al pasar por encima o con el teclado dentro
    function startAuto() {
      if (prefersReducedMotion || autoSlide) return;
      autoSlide = setInterval(() => {
        goTo(currentSlide >= maxSlide() ? 0 : currentSlide + 1);
      }, 6000);
    }

    function stopAuto() {
      clearInterval(autoSlide);
      autoSlide = null;
    }

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    track.addEventListener('focusin', stopAuto);

    render();
    startAuto();
  }

  // ============================================
  // ENLACES INTERNOS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ============================================
  // ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
  // ============================================
  const navAnchors = Array.from(document.querySelectorAll('.navbar-links > a[href^="#"]'))
    .filter(a => a.getAttribute('href').length > 1 && !a.classList.contains('navbar-cta'));

  if (navAnchors.length) {
    const sections = navAnchors
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    // Puede haber dos secciones cruzando la franja a la vez, así que
    // guardamos las visibles y subrayamos solo la primera del documento.
    const visible = new Set();

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      const activeId = sections.map(s => s.id).find(id => visible.has(id));
      navAnchors.forEach(a => {
        a.classList.toggle('current', a.getAttribute('href') === `#${activeId}`);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // ============================================
  // FORMULARIO DE CONTACTO
  // ============================================
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    function showStatus(message, type) {
      status.textContent = message;
      status.className = `form-status visible ${type}`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Aviso claro mientras el endpoint siga siendo el de ejemplo
      if (form.action.includes('TU_ID_DE_FORMSPREE')) {
        showStatus('El formulario todavía no está conectado. Escríbenos a hola@orivion.com mientras lo arreglamos.', 'error');
        console.warn('[Orivion] Falta configurar el endpoint del formulario en index.html.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.reset();
        showStatus('Recibido. Te contestamos en menos de 24 h laborables.', 'success');
      } catch (error) {
        console.error('[Orivion] Error al enviar el formulario:', error);
        showStatus('No hemos podido enviarlo. Prueba otra vez o escríbenos a hola@orivion.com.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  // ============================================
  // CONSENTIMIENTO DE COOKIES
  // ============================================
  const banner = document.getElementById('cookie-banner');

  if (banner) {
    const STORAGE_KEY = 'orivion_cookie_consent';

    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Navegación privada o almacenamiento bloqueado: no insistimos.
    }

    if (!stored) banner.classList.add('visible');

    function saveConsent(value) {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch (e) {
        // Si no se puede guardar, al menos ocultamos el banner en esta visita.
      }
      banner.classList.remove('visible');
    }

    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) acceptBtn.addEventListener('click', () => saveConsent('all'));
    if (rejectBtn) rejectBtn.addEventListener('click', () => saveConsent('necessary'));
  }

});
