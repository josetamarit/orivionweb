/* ============================================
   ORIVION — Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // FUTURISTIC SOUND ENGINE (Web Audio API)
  // ============================================
  let audioCtx = null;
  let soundEnabled = false;

  // Lazy init — browsers block AudioContext until user gesture
  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      soundEnabled = true;
    } catch (e) {
      soundEnabled = false;
    }
  }

  // Initialize on first click/touch
  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });

  // --- Click pop: Dark Elegance ---
  function playClickSound() {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    // Deep sub-bass drop
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    subGain.gain.setValueAtTime(0.15, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.4);

    // Subtle metallic high shimmer
    const highOsc = audioCtx.createOscillator();
    const highGain = audioCtx.createGain();
    highOsc.type = 'sine';
    highOsc.frequency.setValueAtTime(1200, now);
    highOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    highGain.gain.setValueAtTime(0.03, now);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    highOsc.connect(highGain);
    highGain.connect(audioCtx.destination);
    highOsc.start(now);
    highOsc.stop(now + 0.1);
  }

  // ============================================
  // CUSTOM FUTURISTIC CURSOR
  // ============================================
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (!isTouchDevice) {
    const cursorOrb = document.getElementById('cursor-orb');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = 0, mouseY = 0;
    let orbX = 0, orbY = 0;
    let ringX = 0, ringY = 0;
    let trailTimer = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor following with lerp
    function animateCursor() {
      // Orb follows faster
      orbX += (mouseX - orbX) * 0.15;
      orbY += (mouseY - orbY) * 0.15;
      cursorOrb.style.left = orbX + 'px';
      cursorOrb.style.top = orbY + 'px';

      // Ring follows slower for trailing effect
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';

      // Spawn trail particles periodically
      trailTimer++;
      if (trailTimer % 3 === 0) {
        const dx = mouseX - orbX;
        const dy = mouseY - orbY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 2) {
          spawnTrail(orbX, orbY, speed);
        }
      }

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- Trail particles ---
    function spawnTrail(x, y, speed) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      const size = Math.min(3 + speed * 0.15, 8);
      trail.style.width = size + 'px';
      trail.style.height = size + 'px';
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 500);
    }

    // --- Hover detection ---
    const hoverTargets = 'a, button, .service-card, .stat-card, .process-step, .testimonial-card, .footer-social, input, textarea, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorOrb.classList.add('hovering');
        cursorRing.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorOrb.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      }
    });

    // --- Click burst effect ---
    document.addEventListener('mousedown', (e) => {
      cursorOrb.classList.add('clicking');
      cursorRing.classList.add('clicking');
      createBurst(e.clientX, e.clientY);
      createRipple(e.clientX, e.clientY);
      playClickSound();
    });

    document.addEventListener('mouseup', () => {
      cursorOrb.classList.remove('clicking');
      cursorRing.classList.remove('clicking');
    });

    function createBurst(x, y) {
      const burst = document.createElement('div');
      burst.className = 'cursor-burst';
      burst.style.left = x + 'px';
      burst.style.top = y + 'px';

      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'cursor-burst-particle';
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 25 + Math.random() * 35;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        // Randomize size
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        burst.appendChild(particle);
      }

      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    }

    function createRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }

    // --- Hide cursor when leaving window ---
    document.addEventListener('mouseleave', () => {
      cursorOrb.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorOrb.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  // ============================================
  // MAGNETIC HOVER EFFECT
  // ============================================
  const magneticElements = document.querySelectorAll('.magnetic-hover');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });

  // ============================================
  // TILT CARD EFFECT ON SERVICE CARDS
  // ============================================
  const tiltCards = document.querySelectorAll('.service-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * 8;  // degrees
      const tiltY = (x - 0.5) * -8;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById('navbar');
  const scrollThreshold = 50;

  function handleNavbarScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .stagger-children';
  const revealElements = document.querySelectorAll(revealSelectors);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // COUNTER ANIMATION FOR STATS
  // ============================================
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(target * easedProgress);
      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // TESTIMONIALS CAROUSEL
  // ============================================
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dots = document.querySelectorAll('.testimonial-dot');

  if (track && prevBtn && nextBtn) {
    let currentSlide = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    let cardsPerView = getCardsPerView();

    function getCardsPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxSlide() {
      return Math.max(0, cards.length - cardsPerView);
    }

    function updateCarousel() {
      const cardWidth = cards[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 24;
      const offset = currentSlide * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });

      prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentSlide >= getMaxSlide() ? '0.4' : '1';
    }

    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentSlide < getMaxSlide()) {
        currentSlide++;
        updateCarousel();
      }
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        currentSlide = Math.min(i, getMaxSlide());
        updateCarousel();
      });
    });

    window.addEventListener('resize', () => {
      cardsPerView = getCardsPerView();
      currentSlide = Math.min(currentSlide, getMaxSlide());
      updateCarousel();
    });

    let autoSlide = setInterval(() => {
      if (currentSlide < getMaxSlide()) {
        currentSlide++;
      } else {
        currentSlide = 0;
      }
      updateCarousel();
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoSlide));
    track.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        if (currentSlide < getMaxSlide()) {
          currentSlide++;
        } else {
          currentSlide = 0;
        }
        updateCarousel();
      }, 5000);
    });

    updateCarousel();
  }

  // ============================================
  // SMOOTH SCROLL FOR NAV LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // ACTIVE NAV LINK ON SCROLL
  // ============================================
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.navbar-links a[href="#${id}"]`);

      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.style.color = 'var(--text-primary)';
        } else {
          link.style.color = '';
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ============================================
  // PARALLAX SCROLL FOR HERO ORBS
  // ============================================
  const heroOrbs = document.querySelectorAll('.hero-orb');

  if (heroOrbs.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroOrbs.forEach((orb, i) => {
        const speed = 0.1 + i * 0.05;
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

});

