/**
 * GHADI — Editorial Portfolio
 * GSAP + ScrollTrigger + Lenis. Choreographed, restrained, performant.
 */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, smoothTouch: false });
    if (typeof ScrollTrigger !== 'undefined') lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
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

  initCurtain(reduceMotion);
  if (isDesktop) initCursor();
  initMagnetic(isDesktop);
  initHeader();
  initMobileMenu(lenis);
  if (typeof gsap !== 'undefined' && !reduceMotion) initScrollAnimations();
  else revealAllInstant();
  initModal(lenis);
  initYear();

  /* ------------------------------------------------------------------
     LOAD CURTAIN + HERO INTRO
  ------------------------------------------------------------------ */
  function initCurtain(reduceMotion) {
    const curtain = document.getElementById('curtain');
    const lines = document.querySelectorAll('.hero-title .line, .hero-statement .hs-line');
    const fades = document.querySelectorAll('.hero .reveal-fade');

    if (reduceMotion || typeof gsap === 'undefined') {
      curtain?.remove();
      return;
    }

    gsap.set(lines, { yPercent: 110 });
    gsap.set(fades, { opacity: 0, y: 16 });

    window.addEventListener('load', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to(curtain, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' })
        .add(() => curtain.style.display = 'none')
        .to('.hero-title .line', { yPercent: 0, duration: 1.3, stagger: 0.09 }, '-=0.35')
        .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, '-=0.8');
    });

    // Failsafe: never trap the user behind the curtain
    setTimeout(() => { if (curtain && curtain.style.display !== 'none') { curtain.style.display = 'none'; gsap.set([lines, fades], { clearProps: 'all' }); } }, 3500);
  }

  /* ------------------------------------------------------------------
     CUSTOM CURSOR
  ------------------------------------------------------------------ */
  function initCursor() {
    if (typeof gsap === 'undefined') return;
    document.body.classList.add('has-cursor');

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const label = document.getElementById('cursor-label');

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
      document.body.classList.remove('cursor-hidden');
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));

    // Intelligent hover states
    document.querySelectorAll('[data-cursor], [data-cursor-label]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const mode = el.getAttribute('data-cursor');
        const text = el.getAttribute('data-cursor-label');
        document.body.classList.remove('cursor-view', 'cursor-link');
        if (text) {
          label.textContent = text;
          document.body.classList.add('cursor-view');
          ring.classList.add('cursor-label-on');
        } else if (mode) {
          document.body.classList.add(`cursor-${mode}`);
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-view', 'cursor-link');
        ring.classList.remove('cursor-label-on');
        label.textContent = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     MAGNETIC ELEMENTS
  ------------------------------------------------------------------ */
  function initMagnetic(isDesktop) {
    if (!isDesktop || typeof gsap === 'undefined') return;
    document.querySelectorAll('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.28);
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ------------------------------------------------------------------
     HEADER SCROLL BEHAVIOR
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.getElementById('site-header');
    let lastY = 0, ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 40);
        // hide on scroll down past hero, show on scroll up
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
  function initMobileMenu(lenis) {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('menu-close');
    if (!menu) return;

    const open = () => {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      lenis?.stop(); document.body.style.overflow = 'hidden';
      if (typeof gsap !== 'undefined') gsap.fromTo(menu.querySelectorAll('.mobile-nav a'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.25, ease: 'power3.out' });
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ------------------------------------------------------------------
     SCROLL ANIMATIONS
  ------------------------------------------------------------------ */
  function initScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // ---- All sizes: one-shot reveals (play once, then stop doing work) ----
    // Masked line reveals for big headings
    document.querySelectorAll('.work-heading, .about-statement, .contact-title').forEach(h => {
      const lines = h.querySelectorAll('.reveal-line');
      gsap.from(lines, {
        yPercent: 110, duration: 1.05, stagger: 0.09, ease: 'power4.out',
        scrollTrigger: { trigger: h, start: 'top 82%', once: true }
      });
    });

    // Generic soft reveals
    document.querySelectorAll('.reveal-fade').forEach(el => {
      if (el.closest('.hero')) return; // hero handled by intro timeline
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Project media: clip reveal (one-shot) + info cascade
    document.querySelectorAll('.project').forEach(project => {
      const media = project.querySelector('.media-frame');
      const info = project.querySelector('.project-info');

      if (media) {
        gsap.fromTo(media,
          { clipPath: 'inset(6% 3% 6% 3%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: project, start: 'top 80%', once: true } }
        );
      }
      if (info) {
        gsap.from(info.children, {
          y: 30, opacity: 0, duration: 0.75, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: info, start: 'top 84%', once: true }
        });
      }
    });

    gsap.from('.project', {
      opacity: 0, y: 20, duration: 0.6, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: '.projects', start: 'top 82%', once: true }
    });

    // ---- Desktop only: continuous scrub effects (transform-only) ----
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      // Hero parallax on scroll out
      const heroTl = gsap.to('.hero-frame', {
        yPercent: -12, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      const stripTl = gsap.to('.hero-parallax-strip', {
        xPercent: -18, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      // Inner image parallax — transform only, desktop only
      const imgTriggers = [];
      document.querySelectorAll('.project .media-frame img').forEach(img => {
        const t = gsap.fromTo(img, { yPercent: -7 }, {
          yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: img.closest('.project'), start: 'top bottom', end: 'bottom top', scrub: true }
        });
        imgTriggers.push(t);
      });

      // Cleanup when leaving the breakpoint
      return () => {
        heroTl.scrollTrigger?.kill(); heroTl.kill();
        stripTl.scrollTrigger?.kill(); stripTl.kill();
        imgTriggers.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      };
    });

    // Recalculate after lazy images finish loading (prevents mis-timed triggers)
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  function reduceMotionCheck() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    }
  };

  function initModal(lenis) {
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
        if (typeof gsap !== 'undefined') gsap.fromTo(panel, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
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
