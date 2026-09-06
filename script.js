/**
 * GHADI — Editorial Portfolio
 * GSAP + ScrollTrigger + Lenis. One scrolling system, transform/opacity only,
 * one-shot reveals wherever possible, everything cleaned up on teardown.
 */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const hasST = typeof ScrollTrigger !== 'undefined';
  const animationsOn = hasGsap && hasST && !reduceMotion;

  /* ------------------------------------------------------------------
     SMOOTH SCROLL — single Lenis instance, driven by gsap.ticker
  ------------------------------------------------------------------ */
  if (hasGsap && hasST) gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined' && hasGsap) {
    lenis = new Lenis({
      duration: 1.05,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Intercept anchor clicks for smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        scrollToTarget(id);
      }
    });
  });

  initCurtain();
  initMagnetic();
  initHeader();
  initMobileMenu();

  // All scroll-driven animation lives inside one gsap.context for clean teardown
  let ctx = null;
  if (animationsOn) {
    ctx = gsap.context(() => initScrollAnimations());
  } else {
    revealAllInstant();
  }

  initModal();
  initYear();

  // Teardown: release every ScrollTrigger/tween when the page goes away
  window.addEventListener('pagehide', () => { ctx?.revert(); }, { once: true });

  /* ------------------------------------------------------------------
     LOAD CURTAIN + HERO INTRO
  ------------------------------------------------------------------ */
  function initCurtain() {
    const curtain = document.getElementById('curtain');
    if (!curtain) return;

    if (!animationsOn) { curtain.remove(); return; }

    const lines = document.querySelectorAll('.hero-title .line, .hero-grid .line');
    const fades = document.querySelectorAll('.hero .reveal-fade');
    const plate = document.querySelector('.hero-plate');

    gsap.set(lines, { yPercent: 110 });
    gsap.set(fades, { opacity: 0, y: 16 });
    if (plate) gsap.set(plate, { opacity: 0, y: 26 });

    window.addEventListener('load', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to(curtain, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' })
        .add(() => { curtain.style.display = 'none'; })
        .to('.hero-title .line', { yPercent: 0, duration: 1.3 }, '-=0.35')
        .to('.hero-grid .line', { yPercent: 0, duration: 1.1, stagger: 0.08 }, '-=1.05')
        .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, '-=0.7')
        .to(plate, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.85');
    });

    // Failsafe: never trap the user behind the curtain
    setTimeout(() => {
      if (curtain.style.display !== 'none') {
        curtain.style.display = 'none';
        gsap.set([lines, fades, plate], { clearProps: 'all' });
      }
    }, 3500);
  }

  /* ------------------------------------------------------------------
     MAGNETIC — restricted to the nav CTA only (one mousemove listener)
  ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer || !animationsOn) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      let rect = null;
      el.addEventListener('mouseenter', () => {
        rect = el.getBoundingClientRect();
      });
      el.addEventListener('mousemove', (e) => {
        if (!rect) return;
        xTo((e.clientX - rect.left - rect.width / 2) * 0.28);
        yTo((e.clientY - rect.top - rect.height / 2) * 0.28);
      });
      el.addEventListener('mouseleave', () => {
        rect = null;
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ------------------------------------------------------------------
     HEADER — passive scroll listener
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

      let lastY = 0, ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          header.classList.toggle('scrolled', y > 40);
          if (y > window.innerHeight * 0.9 && y > lastY + 6) header.classList.add('hidden-nav');
          else if (y < lastY - 6 || y <= window.innerHeight * 0.9) header.classList.remove('hidden-nav');
          lastY = y;
          ticking = false;
        });
      }, { passive: true });

    // Active nav indicator
    const navLinks = [...document.querySelectorAll('[data-nav]')];
    const sections = ['work', 'about', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }

  /* ------------------------------------------------------------------
     MOBILE MENU
  ------------------------------------------------------------------ */
  function initMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('menu-close');
    if (!menu) return;

    const open = () => {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      lenis?.stop(); document.body.style.overflow = 'hidden';
      if (animationsOn) gsap.fromTo(menu.querySelectorAll('.mobile-nav a'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.25, ease: 'power3.out', clearProps: 'all' });
    };
    const close = () => {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      lenis?.start(); document.body.style.overflow = '';
    };
    toggle?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    menu.querySelectorAll('[data-mobile-link]').forEach(l => l.addEventListener('click', close));

    // Single shared Escape handler for menu + modal
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!menu.classList.contains('open')) return;
      const modal = document.getElementById('project-modal');
      if (modal && !modal.hidden) return; // modal handler deals with it
      close();
    });
  }

  /* ------------------------------------------------------------------
     WORD SPLITTER — wraps words in overflow-hidden masks for reveals
  ------------------------------------------------------------------ */
  function splitWords(el, masked) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const frag = document.createDocumentFragment();
    words.forEach((w, i) => {
      if (masked) {
        const mask = document.createElement('span');
        mask.className = 'w-mask';
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = w;
        mask.appendChild(word);
        frag.appendChild(mask);
      } else {
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = w;
        frag.appendChild(word);
      }
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
    return el.querySelectorAll('.word');
  }

  /* ------------------------------------------------------------------
     SCROLL ANIMATIONS — one-shot reveals first, scrub effects desktop-only
  ------------------------------------------------------------------ */
  function initScrollAnimations() {
    const mm = gsap.matchMedia();

    // ---- Masked line reveals for big section headings ----
    document.querySelectorAll('.work-heading, .about-heading, .contact-title').forEach(h => {
      const lines = h.querySelectorAll('.reveal-line');
      gsap.from(lines, {
        yPercent: 110, duration: 1.05, stagger: 0.09, ease: 'power4.out',
        scrollTrigger: { trigger: h, start: 'top 82%', once: true }
      });
    });

    // ---- Generic soft reveals ----
    document.querySelectorAll('.reveal-fade').forEach(el => {
      if (el.closest('.hero')) return; // hero handled by intro timeline
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // ---- Project scenes: clip reveal, image settle, word-by-word titles ----
    document.querySelectorAll('.project').forEach(project => {
      const frame = project.querySelector('.media-frame');
      const img = project.querySelector('.media-frame img');
      const info = project.querySelector('.project-info');
      const title = project.querySelector('[data-split]');

      if (frame) {
        gsap.fromTo(frame,
          { clipPath: 'inset(10% 5% 10% 5%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: project, start: 'top 78%', once: true },
            onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }) }
        );
      }
      // Landscape imagery is oversized in CSS (116% height) — scroll parallax
      // is applied desktop-only further down. No per-image tween here.

      if (title) {
        const words = splitWords(title, true);
        gsap.from(words, {
          yPercent: 115, duration: 0.9, stagger: 0.07, ease: 'power4.out',
          scrollTrigger: { trigger: title, start: 'top 86%', once: true },
          onComplete: () => gsap.set(words, { clearProps: 'transform' })
        });
      }

      if (info) {
        // Title & ghost numeral run their own animations — exclude them here
        const cascade = [...info.children].filter(el =>
          !el.matches('[data-split], .project-num'));
        gsap.from(cascade, {
          y: 28, opacity: 0, duration: 0.75, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: info, start: 'top 84%', once: true },
          onComplete: () => gsap.set(cascade, { clearProps: 'transform,opacity' })
        });
      }
    });

    // ---- About quote: progressive word reveal tied to scroll ----
    const quote = document.querySelector('.about-quote[data-scrub]');
    if (quote) {
      const words = splitWords(quote, false);
      gsap.fromTo(words,
        { opacity: 0.12 },
        { opacity: 1, stagger: 0.05, ease: 'none',
          scrollTrigger: { trigger: quote, start: 'top 82%', end: 'bottom 55%', scrub: true } }
      );
    }

    // ---- Desktop only: lightweight scrub effects (transform/opacity only) ----
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      const tweens = [];

      tweens.push(gsap.to('.hero-frame', {
        yPercent: -8, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      }));

      tweens.push(gsap.to('.hero-parallax-strip', {
        xPercent: -12, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      }));

      return () => {
        tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      };
    });

    // Recalculate after lazy images finish loading (prevents mis-timed triggers)
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  function revealAllInstant() {
    document.querySelectorAll('.line-mask .line, .reveal-line').forEach(el => el.style.transform = 'none');
    document.querySelectorAll('.reveal-fade').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ------------------------------------------------------------------
     PROJECT MODAL (case studies preserved)
  ------------------------------------------------------------------ */
  const projectData = {
    "noura-style": {
      title: "Noura Style Salon",
      category: "Beauty / Hospitality — Website Concept",
      tagline: "A refined digital home for a beauty salon brand.",
      client: "Independent Project", year: "2025", role: "Designer & Developer",
      description: "A complete website concept for Noura Style Salon — an editorial layout presenting services with elegance, a booking-oriented structure and motion that matches the calm, premium tone of the brand.",
      highlights: ["Editorial service presentation with strong typographic hierarchy.", "Booking-oriented UX flow designed around real customer journeys.", "Responsive build tested from mobile to large desktop.", "Subtle motion system that reinforces the premium feel."],
      tags: ["Art Direction", "UX / Layout", "Front-End Build", "Motion"],
      link: "https://norastyle.vercel.app"
    },
    "llumar-kuwait": {
      title: "LLUMAR Kuwait",
      category: "Automotive / Window Film — Website Concept",
      tagline: "Dark, technical storytelling for automotive window film.",
      client: "Independent Project", year: "2025", role: "Designer & Developer",
      description: "A commercial-grade website concept for LLUMAR Kuwait — product storytelling across film categories, technical specification layouts and a conversion-focused structure built to feel like the industry leader it represents.",
      highlights: ["Product category architecture with clear spec presentation.", "Dark technical aesthetic aligned with the automotive market.", "Conversion-focused section flow from story to contact.", "Fully responsive front-end build."],
      tags: ["Visual Design", "Product Storytelling", "Front-End Build"],
      link: "https://llumarkuwait.vercel.app"
    },
    "cogent-ai": {
      title: "Cogent — AI Agency Website",
      category: "Enterprise AI Automation — Live Website",
      tagline: "Full design and build for an enterprise AI automation partner.",
      client: "Cogent Systems", year: "2025", role: "Web Designer & Front-End Developer",
      description: "Complete website design and development for an enterprise AI automation company. Dark, technical aesthetic with structured sections for capabilities, process, results and client engagement.",
      highlights: ["Full responsive website design from concept to code.", "Technical brand identity matching enterprise AI positioning.", "Structured content sections for complex service offerings.", "Performance-optimized front-end build."],
      tags: ["Web Design", "Front-End Dev", "Technical Branding"],
      link: "https://cogent-ai-agency-site.netlify.app/"
    },
    drizzle: {
      title: "Drizzle — Digital QR Menu",
      category: "Hospitality — QR Menu System",
      tagline: "Bridging physical hospitality with fluid digital menus.",
      client: "Local Hospitality Concept", year: "2024", role: "UX & Visual Designer",
      description: "A mobile-first digital QR menu with instant category filtering and promotional highlights, paired with physical QR table stands — designed for real hospitality use.",
      highlights: ["Custom QR stand identity engineered for physical placement.", "Ultra-responsive mobile layout for zero-latency browsing.", "Clear visual hierarchy guiding ordering decisions.", "Brand kit with custom type scale and color scheme."],
      tags: ["Layout Systems", "Mobile UX", "Visual Hierarchy"],
      link: null
    },
    "northern-lights": {
      title: "Northern Lights FC — Jersey Design",
      category: "Football Kit Design & Identity",
      tagline: "Complete jersey system for Northern Lights FC.",
      client: "Northern Lights FC", year: "2024", role: "Apparel Designer & Brand Artist",
      description: "Full football jersey design package including home kit, crest design, custom typography and color system — built for real kit production with print-ready assets.",
      highlights: ["Custom team crest and badge design.", "Complete home kit layout: sleeve, chest and back placements.", "Typography system for player names and numbers.", "Color palette and guidelines for consistent identity."],
      tags: ["Apparel Design", "Team Branding", "Vector Crest"],
      link: null
    },
    "dawnlight-diary": {
      title: "Dawnlight Diary",
      category: "Interactive D&D World-Building Tool",
      tagline: "Character bookshelves, backstories and campaign notes in one place.",
      client: "Personal Project", year: "2024", role: "Designer & Full-Stack Developer",
      description: "D&D-inspired interactive website where campaigns discover character bookshelves, backstories and notes. Built with data persistence for private campaigns.",
      highlights: ["Interactive character bookshelf system.", "Persistent data storage for campaign notes and sketches.", "Backstory and lore management per character.", "Private campaign support with saved data."],
      tags: ["Interactive Design", "Data Persistence", "Full-Stack"],
      link: "https://eddieit01.github.io/dawnlight-diary/"
    },
    "spoiler-free-sanctuary": {
      title: "Spoiler-Free Sanctuary",
      category: "Gaming UX — University Project",
      tagline: "Guides that respect the story.",
      client: "University UX Research Project", year: "2024", role: "UX Designer & Researcher",
      description: "University project helping gamers through story-driven games like The Last of Us without spoilers — a progressive reveal system unlocking content only after story milestones.",
      highlights: ["Progressive content reveal tied to story milestones.", "User research with story-game players.", "Spoiler-safe guide architecture.", "University-grade UX documentation and testing."],
      tags: ["UX Design", "Progressive Disclosure", "Research"],
      link: "https://spoiler-free-sanctuary.netlify.app"
    },
    "gaming-tech-store": {
      title: "Gaming Tech Store",
      category: "E-Commerce Front-End Concept",
      tagline: "Cyberpunk-themed store with custom builder tool.",
      client: "Personal Project", year: "2024", role: "Web Designer & Front-End Developer",
      description: "Cyberpunk gaming tech store featuring ready-made rigs, a custom PC builder and community hub — a full e-commerce front-end experience.",
      highlights: ["Custom PC builder interface with part selection.", "Product catalog with specs and pricing.", "Community hub for sharing setups.", "Neon-lit cyberpunk visual identity."],
      tags: ["E-Commerce", "Product Design", "Interactive UI"],
      link: "https://gamingtechstore.netlify.app"
    },
    moodcook: {
      title: "MoodCook",
      category: "Food Platform — University Project",
      tagline: "Recipes matched to how you feel.",
      client: "University Project", year: "2024", role: "Web Designer & Content Designer",
      description: "Food discovery platform matching recipes to emotional states — recipe cards, blog system and mood-based navigation built as a complete university concept.",
      highlights: ["Mood-based recipe categorization system.", "Full recipe card design with ingredients and steps.", "Blog system with food articles.", "Complete UX documentation."],
      tags: ["Web Design", "Content System", "University"],
      link: "https://moodcookghadi.netlify.app"
    },
    "rock-shield-kuwait": {
      title: "Rock Shield Kuwait",
      category: "Automotive / Protection — Digital Experience",
      tagline: "Digital experience for an automotive protection brand.",
      client: "Independent Project", year: "2025", role: "Designer & Developer",
      description: "A digital experience for Rock Shield Kuwait — automotive protection product presentation, technical credibility and a conversion-focused structure built to match the market it represents.",
      highlights: ["Product-focused presentation with strong visual hierarchy.", "Technical credibility through structured content sections.", "Conversion-oriented layout guiding toward contact.", "Fully responsive front-end build."],
      tags: ["Visual Design", "Product Storytelling", "Front-End Build", "Interaction"],
      link: "https://rockshieldkw.vercel.app"
    }
  };

  function initModal() {
    const modal = document.getElementById('project-modal');
    const panel = modal?.querySelector('.modal-panel');
    const area = document.getElementById('modal-content-area');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) return;

    let lastFocus = null;

    const open = (key) => {
      const d = projectData[key];
      if (!d) return;
      lastFocus = document.activeElement;
      area.innerHTML = `
        <span class="mc-cat">${d.category}</span>
        <h2 class="mc-title" id="modal-title">${d.title}</h2>
        <p class="mc-tagline">${d.tagline}</p>
        <div class="mc-grid">
          <div><span>Role</span>${d.role}</div>
          <div><span>Client / Scope</span>${d.client}</div>
          <div><span>Year</span>${d.year}</div>
          <div><span>Status</span>${d.link ? 'Live' : 'Case Study'}</div>
        </div>
        <h3 class="mc-h">Overview</h3>
        <p class="mc-desc">${d.description}</p>
        <h3 class="mc-h">Execution</h3>
        <ul class="mc-list">${d.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
        <div class="mc-tags">${d.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="mc-cta-row">
          ${d.link ? `<a class="mc-cta" href="${d.link}" target="_blank" rel="noopener">Visit live site<i class="ri-arrow-right-up-line"></i></a>` : ''}
          <a class="mc-cta ghost" href="#contact" data-modal-contact>Start a similar project<i class="ri-arrow-right-line"></i></a>
        </div>`;
      modal.hidden = false;
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
        if (animationsOn) gsap.fromTo(panel, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'all' });
      });
      lenis?.stop(); document.body.style.overflow = 'hidden';
      closeBtn.focus();
      area.querySelector('[data-modal-contact]')?.addEventListener('click', () => close());
    };

    const close = () => {
      modal.style.opacity = '0';
      setTimeout(() => { modal.hidden = true; }, 250);
      lenis?.start(); document.body.style.overflow = '';
      lastFocus?.focus();
    };

    document.querySelectorAll('[data-modal-open]').forEach(el => {
      el.addEventListener('click', () => open(el.getAttribute('data-modal-open')));
      el.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && el.matches('li, [tabindex]')) { e.preventDefault(); open(el.getAttribute('data-modal-open')); }
      });
    });
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }
});