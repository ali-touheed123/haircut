
/* ============================================================
   HAIR SCROLL SEQUENCE
   ============================================================ */
class HairScrollSequence {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private track: HTMLElement;
  private frames: HTMLImageElement[] = [];
  private totalFrames = 50; 
  private loadedCount = 0;
  private currentFrameIndex = 0;
  private isRendering = false;
  
  // Cache for dimensions
  private dpr = window.devicePixelRatio || 1;
  private vw = window.innerWidth;
  private vh = window.innerHeight;
  private drawData = { x: 0, y: 0, w: 0, h: 0 };

  constructor(canvas: HTMLCanvasElement, track: HTMLElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.track = track;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.preload();
    this.updateDimensions();
    this.initEvents();
  }

  private preload() {
    const loaderProgress = document.getElementById('loader-progress');
    const loaderText = document.getElementById('loader-text');
    const loadingScreen = document.getElementById('loading-screen');

    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/hair/ezgif-frame-${frameNum}.jpg`;

      img.onload = () => {
        this.loadedCount++;
        const percent = Math.floor((this.loadedCount / this.totalFrames) * 100);
        
        if (loaderProgress) loaderProgress.style.width = `${percent}%`;
        if (loaderText) loaderText.textContent = `LOADING EXPERIENCE... ${percent}%`;

        if (this.loadedCount === 1) {
          this.scheduleRender();
        }

        if (this.loadedCount === this.totalFrames) {
          setTimeout(() => {
            if (loadingScreen) {
              loadingScreen.style.opacity = '0';
              setTimeout(() => loadingScreen.style.display = 'none', 500);
            }
          }, 500);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load frame ${frameNum}`);
        this.loadedCount++;
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

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

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
    const scrollableHeight = trackHeight - window.innerHeight;
    
    const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
    
    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.floor(progress * this.totalFrames)
    );

    if (frameIndex !== this.currentFrameIndex) {
      this.currentFrameIndex = frameIndex;
      this.scheduleRender();
    }
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

    this.ctx.drawImage(
      img, 
      this.drawData.x, this.drawData.y, 
      this.drawData.w, this.drawData.h
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hair-canvas') as HTMLCanvasElement;
    const track = document.getElementById('hair-animation-track') as HTMLElement;
    if (canvas && track) {
        new HairScrollSequence(canvas, track);
    }
});
