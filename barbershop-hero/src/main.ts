import './style.css';

/* ============================================================
   TYPES
   ============================================================ */
interface Testimonial {
  initials: string;
  avatarGradient: [string, string];
  quote: string;
  author: string;
  role: string;
  rating: number;
  avatarUrl: string;
}

/* ============================================================
   DATA — 4 testimonials cycle through the deck
   ============================================================ */
const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'TA',
    avatarGradient: ['#667eea', '#764ba2'],
    quote:
      'The haircut was pure art. My style has never looked this good since I visited. Absolutely beyond anything I expected.',
    author: 'Tariq Ali',
    role: 'Lifestyle Blogger',
    rating: 5,
    avatarUrl: '/avatar_tariq.png',
  },
  {
    initials: 'UK',
    avatarGradient: ['#f093fb', '#f5576c'],
    quote:
      "Walked in with a vague idea, walked out with the sharpest fade I've ever had. The attention to detail here is simply unmatched.",
    author: 'Usman Khan',
    role: 'Creative Director',
    rating: 5,
    avatarUrl: '/avatar_usman.png',
  },
  {
    initials: 'FA',
    avatarGradient: ['#4facfe', '#00f2fe'],
    quote:
      'Best hot-towel shave in the city. Old-school atmosphere with modern precision — worth every cent. I keep coming back.',
    author: 'Faisal Ahmed',
    role: 'Entrepreneur',
    rating: 5,
    avatarUrl: '/avatar_faisal.png',
  },
  {
    initials: 'BS',
    avatarGradient: ['#43e97b', '#38f9d7'],
    quote:
      'I drive 40 minutes for every appointment. The barbers here understand the craft on a completely different level.',
    author: 'Bilal Safdar',
    role: 'UX Designer',
    rating: 5,
    avatarUrl: '/avatar_bilal.png',
  },
];

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbar(): void {
  const navbar = document.getElementById('navbar') as HTMLElement;
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    lastY = y;
  }, { passive: true });

  // suppress unused-variable lint
  void lastY;
}

/* ============================================================
   STAR RENDERER
   ============================================================ */
function renderStars(container: HTMLElement, count: number, delayOffset = 0): void {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'star-icon';
    star.textContent = '★';
    star.style.animationDelay = `${delayOffset + i * 0.1}s`;
    container.appendChild(star);
  }
}

/* ============================================================
   CARD BUILDER — matches new HTML structure
   ============================================================ */
function buildCard(t: Testimonial, stackIndex: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 't-card';
  card.style.setProperty('--stack-index', String(stackIndex));

  // ── Avatar — centered at top ──
  const avatarWrap = document.createElement('div');
  avatarWrap.className = 't-card__avatar-wrap';

  const avatar = document.createElement('div');
  avatar.className = 't-card__avatar';
  avatar.style.backgroundImage = `url('${t.avatarUrl}')`;
  avatar.style.backgroundSize = 'cover';
  avatar.style.backgroundPosition = 'center';
  avatarWrap.appendChild(avatar);

  // ── Big centered quote ──
  const quote = document.createElement('p');
  quote.className = 't-card__quote';
  quote.textContent = t.quote;

  // ── Author block at bottom ──
  const authorBlock = document.createElement('div');
  authorBlock.className = 't-card__author-block';

  const authorEl = document.createElement('p');
  authorEl.className = 't-card__author';
  authorEl.textContent = t.author;

  const roleEl = document.createElement('p');
  roleEl.className = 't-card__role';
  roleEl.textContent = t.role;

  authorBlock.appendChild(authorEl);
  authorBlock.appendChild(roleEl);

  card.appendChild(avatarWrap);
  card.appendChild(quote);
  card.appendChild(authorBlock);

  return card;
}

/* ============================================================
   CARD DECK CLASS — drag / touch / auto-shuffle
   ============================================================ */
class CardDeck {
  private deckEl: HTMLElement;
  private order: number[]; // order[0] = front
  private cards: HTMLElement[] = [];

  // Drag state
  private dragging = false;
  private startX = 0;
  private currentX = 0;
  private activeDragCard: HTMLElement | null = null;

  constructor(el: HTMLElement) {
    this.deckEl = el;
    this.order = TESTIMONIALS.map((_, i) => i);
    this.render();
    this.bindEvents();
  }

  /* ── Render whole deck from current order ── */
  private render(): void {
    this.deckEl.innerHTML = '';
    this.cards = [];

    // Render back→front so the front card sits on top in DOM
    const reversed = [...this.order].reverse();
    reversed.forEach((dataIdx, domPos) => {
      const stackIdx = this.order.length - 1 - domPos;
      const card = buildCard(TESTIMONIALS[dataIdx], stackIdx);
      this.deckEl.appendChild(card);
      this.cards.unshift(card);   // cards[0] always = front
    });
  }

  private get frontCard(): HTMLElement { return this.cards[0]; }

  /* ── Update visual stack positions without full re-render ── */
  private restackVisuals(): void {
    this.cards.forEach((card, idx) => {
      card.classList.add('restack');
      card.style.setProperty('--stack-index', String(idx));
      card.style.zIndex = String(10 - idx);
    });
  }

  /* ── Cycle front card to back of deck ── */
  private cycleFrontToBack(): void {
    const front = this.order.shift()!;
    this.order.push(front);
    this.render();
  }

  /* ── Fly out in a direction then cycle ── */
  public flyOut(direction: 'left' | 'right' = 'left'): void {
    const card = this.frontCard;
    card.classList.remove('is-dragging');
    card.classList.add(direction === 'left' ? 'fly-left' : 'fly-right');

    setTimeout(() => this.cycleFrontToBack(), 430);
  }

  /* ── Snap card back to start position ── */
  private snapBack(): void {
    if (!this.activeDragCard) return;
    this.activeDragCard.classList.remove('is-dragging');
    this.activeDragCard.style.transform = '';
    this.activeDragCard.style.opacity = '';
    this.activeDragCard = null;
  }

  /* ── Mouse events ── */
  private onMouseDown = (e: MouseEvent): void => {
    const target = (e.target as HTMLElement).closest('.t-card') as HTMLElement | null;
    if (!target || target !== this.frontCard) return;
    this.dragging = true;
    this.startX = e.clientX;
    this.currentX = e.clientX;
    this.activeDragCard = target;
    target.classList.add('is-dragging');
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.dragging || !this.activeDragCard) return;
    this.currentX = e.clientX;
    const dx = this.currentX - this.startX;
    const rotate = dx * 0.055;
    const lift = Math.abs(dx) * 0.04;
    const fade = 1 - Math.min(Math.abs(dx) / 250, 0.35);
    this.activeDragCard.style.transform = `translateX(${dx}px) rotate(${rotate}deg) translateY(-${lift}px)`;
    this.activeDragCard.style.opacity = String(fade);
  };

  private onMouseUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    const dx = this.currentX - this.startX;
    if (Math.abs(dx) > 90) {
      this.flyOut(dx < 0 ? 'left' : 'right');
    } else {
      this.snapBack();
    }
    this.activeDragCard = null;
  };

  /* ── Touch events ── */
  private onTouchStart = (e: TouchEvent): void => {
    const target = (e.target as HTMLElement).closest('.t-card') as HTMLElement | null;
    if (!target || target !== this.frontCard) return;
    this.dragging = true;
    this.startX = e.touches[0].clientX;
    this.currentX = e.touches[0].clientX;
    this.activeDragCard = target;
    target.classList.add('is-dragging');
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (!this.dragging || !this.activeDragCard) return;
    e.preventDefault();
    this.currentX = e.touches[0].clientX;
    const dx = this.currentX - this.startX;
    const rotate = dx * 0.055;
    this.activeDragCard.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    this.activeDragCard.style.opacity = String(1 - Math.min(Math.abs(dx) / 250, 0.35));
  };

  private onTouchEnd = (): void => { this.onMouseUp(); };

  /* ── Click on a back card → bring to front ── */
  private onDeckClick = (e: MouseEvent): void => {
    if (this.dragging || Math.abs(this.currentX - this.startX) > 5) return;
    const target = (e.target as HTMLElement).closest('.t-card') as HTMLElement | null;
    if (!target || target === this.frontCard) return;
    this.flyOut('left');
  };

  /* ── Bind all listeners ── */
  private bindEvents(): void {
    this.deckEl.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.deckEl.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);

    this.deckEl.addEventListener('click', this.onDeckClick);
  }

  /* ── Public shuffle (used by auto timer) ── */
  public shuffle(): void { this.flyOut('left'); }
}

/* ============================================================
   AUTO-SHUFFLE
   ============================================================ */
function startAutoShuffle(deck: CardDeck, deckEl: HTMLElement): void {
  let timer = setInterval(() => deck.shuffle(), 5500);
  deckEl.addEventListener('mouseenter', () => clearInterval(timer));
  deckEl.addEventListener('mouseleave', () => {
    clearInterval(timer);
    timer = setInterval(() => deck.shuffle(), 5500);
  });
}

/* ============================================================
   BUTTON RIPPLE
   ============================================================ */
function initRipple(): void {
  const style = document.createElement('style');
  style.textContent = `@keyframes rippleAnim { to { transform:scale(3.5); opacity:0; } }`;
  document.head.appendChild(style);

  document.querySelectorAll<HTMLButtonElement>('.btn').forEach((btn) => {
    btn.addEventListener('click', (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = 100;
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        background:rgba(255,255,255,0.15);
        transform:scale(0);
        animation:rippleAnim 0.55s ease forwards;
        pointer-events:none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ============================================================
   MAIN INIT
   ============================================================ */
function init(): void {
  initNavbar();

  // Rating stars
  const starsEl = document.getElementById('stars-container');
  if (starsEl) renderStars(starsEl, 5, 0.6);

  // Card deck
  const deckEl = document.getElementById('card-deck') as HTMLElement;
  if (deckEl) {
    const deck = new CardDeck(deckEl);
    startAutoShuffle(deck, deckEl);
  }

  initRipple();

  // Chair animation
  const chairCanvas = document.getElementById('chair-canvas') as HTMLCanvasElement;
  const chairTrack = document.getElementById('chair-animation') as HTMLElement;
  if (chairCanvas && chairTrack) {
    new ChairScrollSequence(chairCanvas, chairTrack);
  }

  // Luxury Ambient Showcase
  createDustParticles();

  // Trigger entrance animations after first paint (avoids fill-mode:both hiding content)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector('.hero__left')?.classList.add('is-animated');
      document.querySelector('.hero__right')?.classList.add('is-animated');
    });
  });
}

/* ============================================================
   CHAIR SCROLL SEQUENCE
   ============================================================ */
class ChairScrollSequence {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private track: HTMLElement;
  private cards: HTMLElement[] = [];
  private frames: HTMLImageElement[] = [];
  private totalFrames = 41;
  private loadedCount = 0;
  private currentFrameIndex = 0;
  private isRendering = false; // Guard for rAF
  
  // Optimization caches
  private dpr = window.devicePixelRatio || 1;
  private vw = window.innerWidth;
  private vh = window.innerHeight;
  private drawData: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 };

  constructor(canvas: HTMLCanvasElement, track: HTMLElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!; 
    
    // Improve rendering quality to prevent "pixels phatna" (pixelation)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    this.track = track;
    this.cards = Array.from(document.querySelectorAll('.glass-card'));

    this.preload();
    this.updateDimensions();
    this.initEvents();
  }

  private preload() {
    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/chair/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount === 1) this.scheduleRender();
      };
      this.frames.push(img);
    }
  }

  private initEvents() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    window.addEventListener('resize', () => {
      this.updateDimensions();
      this.scheduleRender();
    }, { passive: true });
    
    // Initial paint
    setTimeout(() => this.scheduleRender(), 200);
  }

  private updateDimensions() {
    this.dpr = window.devicePixelRatio || 1;
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    
    this.canvas.width = this.vw * this.dpr;
    this.canvas.height = this.vh * this.dpr;

    // Reset smoothing after canvas resize (some browsers reset the context)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Pre-calculate draw math (equivalent to object-fit: cover)
    const imgAspect = 1920 / 1080; 
    const canvasAspect = this.vw / this.vh;

    if (imgAspect > canvasAspect) {
      this.drawData.h = this.vh * this.dpr;
      this.drawData.w = this.drawData.h * imgAspect;
      this.drawData.x = (this.vw * this.dpr - this.drawData.w) / 2;
      this.drawData.y = 0;
    } else {
      this.drawData.w = this.vw * this.dpr;
      this.drawData.h = this.drawData.w / imgAspect;
      this.drawData.x = 0;
      this.drawData.y = (this.vh * this.dpr - this.drawData.h) / 2;
    }
  }

  private update() {
    const rect = this.track.getBoundingClientRect();
    const trackHeight = this.track.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Progress 0.0 to 1.0
    const progress = Math.max(0, Math.min(1, -rect.top / (trackHeight - viewportHeight)));
    
    // 1. Update Frames
    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.floor(progress * this.totalFrames)
    );

    if (frameIndex !== this.currentFrameIndex) {
      this.currentFrameIndex = frameIndex;
      this.scheduleRender();
    }

    // 2. Update Cards (One by One)
    const thresholds = [0.15, 0.40, 0.65, 0.85];
    this.cards.forEach((card, i) => {
      if (progress > thresholds[i]) {
        card.classList.add('is-visible');
      } else {
        card.classList.remove('is-visible');
      }
    });
  }

  private scheduleRender() {
    if (this.isRendering) return;
    this.isRendering = true;
    requestAnimationFrame(() => {
      this.render();
      this.isRendering = false;
    });
  }

  private render() {
    const img = this.frames[this.currentFrameIndex];
    if (!img || !img.complete) return;

    // Clear context explicitly if needed, though with no-alpha/cover it's mostly overpainted
    this.ctx.drawImage(
      img, 
      this.drawData.x, this.drawData.y, 
      this.drawData.w, this.drawData.h
    );
  }
}

/* ============================================================
   AMBIENT LUXURY PARTICLES
   ============================================================ */
function createDustParticles() {
  const container = document.getElementById('dust-container');
  if (!container) return;

  const particleCount = 40;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random drift vectors for CSS variables
    const dx = (Math.random() - 0.5) * 300;
    const dy = (Math.random() - 0.5) * 300;
    
    // Random size (tiny specs)
    const size = Math.random() * 3 + 1;
    
    // Random timing for unique feel
    const duration = 15 + Math.random() * 15;
    const delay = Math.random() * -30;

    p.style.left = `${x}%`;
    p.style.top = `${y}%`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    p.style.animation = `dust-float ${duration}s linear ${delay}s infinite`;
    
    container.appendChild(p);
  }
}

document.addEventListener('DOMContentLoaded', init);
