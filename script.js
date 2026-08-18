/**
 * GHADI PORTFOLIO - SENIOR CREATIVE TECHNOLOGIST & ART DIRECTION ENGINE
 * Powered by GSAP 3, ScrollTrigger, Lenis Smooth Scroll, and Canvas Graphics
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  initSmoothScroll();

  // 2. Custom Magnetic Cursor & Interactive States
  initCustomCursor();

  // 3. Dynamic Hero Canvas Graphics
  initHeroCanvas();

  // 4. GSAP Staggered Hero Text & ScrollTrigger Reveals
  initGSAPAnimations();

  // 5. Featured Work Showcase Filtering & Modal System
  initProjectShowcase();

  // 6. Interactive Contact Copy Email & Utility Helpers
  initContactAndUtilities();

  // 7. Mobile Menu Toggle
  initMobileMenu();
});

/* ==========================================================================
   1. LENIS SMOOTH SCROLLING INTEGRATION
   ========================================================================== */
let lenis;
function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}

/* ==========================================================================
    2. CUSTOM MAGNETIC CURSOR & TRAIL LOGIC
    ========================================================================== */
function initCustomCursor() {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorFollower = document.getElementById('cursor-follower');
  const cursorText = document.getElementById('cursor-text');

  if (!cursorDot || !cursorFollower) return;

  // Hide custom cursor on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursorDot.style.display = 'none';
    cursorFollower.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate dot positioning
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Smooth lerp loop for follower
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;

    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover states on interactive cards & buttons
  const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-pill');
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      if (el.classList.contains('project-card')) {
        cursorText.textContent = 'VIEW';
      } else if (el.hasAttribute('data-magnetic')) {
        cursorText.textContent = 'EXPLORE';
      } else {
        cursorText.textContent = '';
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      cursorText.textContent = '';
    });
  });

  // Magnetic Buttons Effect
  const magneticEls = document.querySelectorAll('[data-magnetic]');
  const quickToMap = new Map();
  magneticEls.forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power2.out' });
    const xReset = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    const yReset = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    quickToMap.set(el, { xTo, yTo, xReset, yReset });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      const q = quickToMap.get(el);
      q.xTo(relX * 0.3);
      q.yTo(relY * 0.3);
    });

    el.addEventListener('mouseleave', () => {
      const q = quickToMap.get(el);
      q.xReset(0);
      q.yReset(0);
    });
  });
}

/* ==========================================================================
   3. DYNAMIC HERO CANVAS GRAPHICS
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Interactive Particle Grid
  const particles = [];
  const particleCount = Math.min(Math.floor(width / 20), 55);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, width, height);

    if (canvasVisible) {
      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;

          if (dist < 140 * 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 94, 54, ${0.15 * (1 - Math.sqrt(dist) / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });
    }

    requestAnimationFrame(drawCanvas);
  }

  let canvasVisible = true;
  const canvasObserver = new IntersectionObserver((entries) => {
    canvasVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  canvasObserver.observe(canvas);

  drawCanvas();
}

/* ==========================================================================
   4. GSAP TEXT REVEALS & SCROLLTRIGGER REVEALS
   ========================================================================== */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero Section Intro Animation Timeline
  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

  heroTl
    .from('.hero-badge', { y: -20, opacity: 0, delay: 0.2 })
    .from('.hero-text-line', { y: '100%', opacity: 0, stagger: 0.15 }, '-=0.8')
    .from('.hero-tagline', { y: 30, opacity: 0 }, '-=0.8')
    .from('.hero-actions', { y: 30, opacity: 0 }, '-=0.8');

  // ScrollTrigger Animations for Sections
  if (typeof ScrollTrigger !== 'undefined') {
    // Project Cards Entrance
    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '#work',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Skill Category Cards Entrance
    gsap.from('.skill-category-card', {
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      stagger: 0.18,
      ease: 'power3.out'
    });

    // Skill Pills Floating Pulse
    gsap.from('.skill-pill', {
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 75%'
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'back.out(1.7)'
    });

    // About Section Entrance
    gsap.from('#about h2, #about p, #about .p-8', {
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%'
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }
}

/* ==========================================================================
   5. FEATURED WORK SHOWCASE FILTER & MODAL SYSTEM
   ========================================================================== */
const projectData = {
  "northern-lights": {
    title: "Northern Lights — Jersey Design & Team Branding",
    category: "Football Kit Design & Identity",
    tagline: "Complete jersey system for Northern Lights FC.",
    client: "Northern Lights FC",
    year: "2024",
    role: "Apparel Designer & Brand Artist",
    description: "Full football jersey design package including home kit, crest design, custom typography, and color system. Built for real kit production with print-ready assets.",
    highlights: [
      "Custom team crest and badge design.",
      "Complete home kit layout with sleeve, chest, and back placements.",
      "Typography system for player names and numbers.",
      "Color palette and brand guidelines for consistent identity."
    ],
    tags: ["Apparel Design", "Team Branding", "Vector Crest", "Kit Layout"],
    link: null
  },
  drizzle: {
    title: "Drizzle — Digital QR Menu System",
    category: "QR Menu & Local Business Design",
    tagline: "Bridging physical hospitality with fluid digital menu navigation.",
    client: "Local Business & Hospitality Partners",
    year: "2024",
    role: "Visual Designer & Creative Technologist",
    description: "Drizzle is a comprehensive digital QR menu and visual hierarchy system built to bridge physical storefront touchpoints with fluid digital menu navigation. Mobile-first design with instant category filtering and dynamic promotional highlights.",
    highlights: [
      "Custom QR identity stands engineered for physical placement.",
      "Ultra-responsive mobile layout optimized for zero-latency browsing.",
      "Clear visual hierarchy increasing engagement by 35%.",
      "Brand kit guidelines with custom typography scale and color schemes."
    ],
    tags: ["Layout Systems", "Visual Hierarchy", "Digital-Physical Bridge", "Mobile UX"],
    link: null
  },
  "cogent-ai": {
    title: "Cogent — AI Agency Website",
    category: "Enterprise AI Automation Website",
    tagline: "Full website design and build for an enterprise AI automation partner.",
    client: "Cogent Systems",
    year: "2025",
    role: "Web Designer & Front-End Developer",
    description: "Complete website design and development for an enterprise AI automation company. Dark, technical aesthetic with structured sections for capabilities, process, results, and client engagement.",
    highlights: [
      "Full responsive website design from concept to code.",
      "Technical brand identity matching enterprise AI positioning.",
      "Structured content sections for complex service offerings.",
      "Performance-optimized front-end build."
    ],
    tags: ["Web Design", "Front-End Dev", "Technical Branding", "Enterprise"],
    link: "https://cogent-ai-agency-site.netlify.app/"
  },
  "dawnlight-diary": {
    title: "Dawnlight Diary — D&D Interactive Tool",
    category: "Interactive D&D World Building Platform",
    tagline: "Character bookshelves, backstories, and campaign notes in one place.",
    client: "D&D Campaign Community",
    year: "2024",
    role: "Designer & Full-Stack Developer",
    description: "D&D-inspired interactive website where campaigns discover character bookshelves, backstories, and notes. Built with data persistence for private campaigns. Each book is named after a character and stores their history and secrets.",
    highlights: [
      "Interactive character bookshelf system.",
      "Persistent data storage for campaign notes and sketches.",
      "Backstory and lore management per character.",
      "Private campaign support with saved data."
    ],
    tags: ["Interactive Design", "Data Persistence", "World Building", "Full-Stack"],
    link: "https://eddieit01.github.io/dawnlight-diary/"
  },
  "spoiler-free-sanctuary": {
    title: "Spoiler-Free Sanctuary — Gaming UX",
    category: "University Project — Spoiler-Free Gaming Guides",
    tagline: "Help gamers through story games without spoiling the experience.",
    client: "University UX Research Project",
    year: "2024",
    role: "UX Designer & Researcher",
    description: "University project helping gamers through story-driven games like The Last of Us without spoilers. Progressive reveal system that only unlocks content after story milestones, preserving the narrative experience.",
    highlights: [
      "Progressive content reveal system tied to story milestones.",
      "User research with story-game players.",
      "Spoiler-safe guide architecture.",
      "University-grade UX documentation and testing."
    ],
    tags: ["UX Design", "Progressive Disclosure", "Gaming", "University Project"],
    link: "https://spoiler-free-sanctuary.netlify.app"
  },
  "gaming-tech-store": {
    title: "Gaming Tech Store — Cyberpunk E-Commerce",
    category: "E-Commerce Front-End Experience",
    tagline: "Cyberpunk-themed gaming store with custom builder and community hub.",
    client: "Personal Project",
    year: "2024",
    role: "Web Designer & Front-End Developer",
    description: "Cyberpunk gaming tech store featuring ready-made rigs, custom build tools, and community hub. Full e-commerce front-end with product showcases, builder interface, and neon-lit visual identity.",
    highlights: [
      "Custom PC builder interface with part selection.",
      "Product catalog with specs and pricing.",
      "Community hub for sharing setups.",
      "Cyberpunk visual identity and micro-interactions."
    ],
    tags: ["E-Commerce", "Product Design", "Interactive UI", "Cyberpunk"],
    link: "https://gamingtechstore.netlify.app"
  },
  moodcook: {
    title: "MoodCook — Recipes Based on Mood",
    category: "University Project — Mood-Based Food Platform",
    tagline: "Food discovery platform matching recipes to how you feel.",
    client: "University Project",
    year: "2024",
    role: "Web Designer & Content Designer",
    description: "Food discovery platform that matches recipes to emotional states. Complete recipe cards, blog system, and mood-based navigation built as a university concept. Happy, sad, or adventurous — there is a recipe for every mood.",
    highlights: [
      "Mood-based recipe categorization system.",
      "Full recipe card design with ingredients and steps.",
      "Blog system with food and seasoning articles.",
      "University project with complete UX documentation."
    ],
    tags: ["Web Design", "Content System", "University Project", "Food Tech"],
    link: "https://moodcookghadi.netlify.app"
  }
};

function initProjectShowcase() {
  // Category Filtering Logic
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active', 'bg-neonOrange', 'text-obsidian'));
      btn.classList.add('active', 'bg-neonOrange', 'text-obsidian');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category');
        if (filter === 'all' || categories.includes(filter)) {
          gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, display: 'block', ease: 'power2.out' });
        } else {
          gsap.to(card, { opacity: 0, scale: 0.9, duration: 0.3, display: 'none', ease: 'power2.in' });
        }
      });
    });
  });

  // Modal Setup
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentArea = document.getElementById('modal-content-area');
  const modalBackdrop = document.querySelector('.modal-backdrop');

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const projectKey = card.getAttribute('data-project');
      const data = projectData[projectKey];

      if (data && modal && modalContentArea) {
        modalContentArea.innerHTML = `
          <div class="space-y-6">
            <div class="flex items-center gap-3 font-mono text-xs text-neonOrange">
              <span class="px-3 py-1 rounded-full bg-neonOrange/10 border border-neonOrange/20">${data.category}</span>
              <span>• ${data.year}</span>
            </div>

            <h2 class="font-display font-extrabold text-2xl sm:text-4xl text-paper leading-tight">${data.title}</h2>
            <p class="text-neonOrange font-mono text-sm font-semibold">${data.tagline}</p>

            <div class="grid grid-cols-2 gap-4 py-4 border-y border-white/10 font-mono text-xs text-slate-300">
              <div><span class="text-slate-500 block mb-1">ROLE</span>${data.role}</div>
              <div><span class="text-slate-500 block mb-1">CLIENT / SCOPE</span>${data.client}</div>
            </div>

            <div class="space-y-3">
              <h4 class="font-display font-bold text-lg text-white">Project Overview</h4>
              <p class="text-slate-300 text-sm leading-relaxed">${data.description}</p>
            </div>

            <div class="space-y-3">
              <h4 class="font-display font-bold text-lg text-white">Key Deliverables & Execution</h4>
              <ul class="space-y-2 text-sm text-slate-300 font-sans">
                ${data.highlights.map(h => `<li class="flex items-start gap-2.5"><i class="ri-checkbox-circle-fill text-neonOrange shrink-0 mt-0.5"></i><span>${h}</span></li>`).join('')}
              </ul>
            </div>

            <div class="pt-4 flex flex-wrap gap-2">
              ${data.tags.map(t => `<span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">${t}</span>`).join('')}
            </div>

            <div class="pt-6 border-t border-white/10 flex items-center justify-between">
              ${data.link ? `<a href="${data.link}" target="_blank" rel="noopener" class="modal-cta-btn px-6 py-3 rounded-full bg-white text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neonOrange transition-colors"><span>Visit Live Site</span><i class="ri-external-link-line"></i></a>` : ''}
              <a href="#contact" class="modal-cta-btn px-6 py-3 rounded-full bg-neonOrange text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-colors">
                <span>Inquire About Similar Work</span>
                <i class="ri-arrow-right-line"></i>
              </a>
            </div>
          </div>
        `;

        // Attach modal CTA scroll listener
        const modalCta = modalContentArea.querySelector('.modal-cta-btn');
        if (modalCta) {
          modalCta.addEventListener('click', () => {
            closeModal();
          });
        }

        modal.classList.add('active');
        if (lenis) lenis.stop();
      }
    });
  });

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      if (lenis) lenis.start();
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. CONTACT EMAIL COPY & UTILITIES
   ========================================================================== */
function initContactAndUtilities() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const emailAddr = document.getElementById('email-address');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (copyBtn && emailAddr) {
    copyBtn.addEventListener('click', () => {
      const email = emailAddr.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        showToast('Email address copied to clipboard!');

        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy';
        }, 3000);
      }).catch(() => {
        showToast('Failed to copy. Please select manually.');
      });
    });
  }

  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  const copyPhoneText = document.getElementById('copy-phone-text');
  const phoneAddr = document.getElementById('phone-number');

  if (copyPhoneBtn && phoneAddr) {
    copyPhoneBtn.addEventListener('click', () => {
      const phone = phoneAddr.textContent.trim();
      navigator.clipboard.writeText(phone).then(() => {
        if (copyPhoneText) copyPhoneText.textContent = 'Copied!';
        showToast('Phone number copied to clipboard!');

        setTimeout(() => {
          if (copyPhoneText) copyPhoneText.textContent = 'Copy';
        }, 3000);
      }).catch(() => {
        showToast('Failed to copy. Please select manually.');
      });
    });
  }

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
  }

  // Header Background Blur on Scroll
  const header = document.getElementById('main-header');
  let headerTicking = false;
  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          header?.classList.add('scrolled');
        } else {
          header?.classList.remove('scrolled');
        }
        headerTicking = false;
      });
      headerTicking = true;
    }
  }, { passive: true });

  // Current Year in Footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
    7. MOBILE MENU TOGGLE
    ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu?.querySelectorAll('.mobile-nav-link');

  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.add('active');
    mobileMenu.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };

  const closeMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    mobileMenu.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };

  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  mobileLinks?.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
      closeMenu();
    }
  });
}
