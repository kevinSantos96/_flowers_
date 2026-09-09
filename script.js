/**
 * Ramo de Tulipanes Amarillos - Animaciones y Efectos Interactivos
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarsCanvas();
  initShootingStars();
  initBouquetInteractions();
  initSparkleOnClick();
});

/* ==========================================================================
   1. CAMPO DE ESTRELLAS DINÁMICO (CANVAS 60 FPS)
   ========================================================================== */
function initStarsCanvas() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const starCount = Math.floor((width * height) / 4500); // Proporcional a la pantalla
  const stars = [];

  const starColors = [
    '#ffffff',
    '#ffffff',
    '#f8f9fa',
    '#fff9db',
    '#e7f5ff',
    '#ffec99'
  ];

  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.4; // 0.4px a 2.2px
      this.color = starColors[Math.floor(Math.random() * starColors.length)];
      this.baseAlpha = Math.random() * 0.7 + 0.3;
      this.alpha = this.baseAlpha;
      this.twinkleSpeed = Math.random() * 0.03 + 0.008;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.twinklePhase += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.35;
      if (this.alpha < 0.1) this.alpha = 0.1;
      if (this.alpha > 1) this.alpha = 1;
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = this.size > 1.2 ? 6 : 2;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.length = 0;
    const newCount = Math.floor((width * height) / 4500);
    for (let i = 0; i < newCount; i++) {
      stars.push(new Star());
    }
  }

  window.addEventListener('resize', resize);

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. SISTEMA DE ESTRELLAS FUGACES (METEOROS CON ESTELA)
   ========================================================================== */
function initShootingStars() {
  const container = document.getElementById('shootingStarsContainer');
  if (!container) return;

  function createShootingStar(customPos = null) {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Longitud y velocidad de la estela
    const length = Math.random() * 120 + 80;
    const duration = Math.random() * 1.6 + 1.8; // 1.8s a 3.4s
    const angle = -(Math.random() * 15 + 25); // -25deg a -40deg como en la imagen

    let startX, startY;

    if (customPos) {
      startX = customPos.x;
      startY = customPos.y;
    } else {
      // Posición aleatoria en cuadrantes del cielo
      const side = Math.random() > 0.4 ? 'right' : 'top';
      if (side === 'top') {
        startX = Math.random() * (window.innerWidth * 0.7);
        startY = Math.random() * (window.innerHeight * 0.35);
      } else {
        startX = window.innerWidth * 0.5 + Math.random() * (window.innerWidth * 0.45);
        startY = Math.random() * (window.innerHeight * 0.6);
      }
    }

    star.style.width = `${length}px`;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.transform = `rotate(${angle}deg)`;
    star.style.animation = `shoot ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`;

    container.appendChild(star);

    // Remover al finalizar la animación
    setTimeout(() => {
      if (star.parentNode) {
        star.remove();
      }
    }, duration * 1000);
  }

  // Generar las 3 estrellas fugaces iniciales vistas en la imagen de referencia
  setTimeout(() => {
    // 1. Superior izquierda
    createShootingStar({ x: window.innerWidth * 0.15, y: window.innerHeight * 0.18 });
  }, 400);

  setTimeout(() => {
    // 2. Lateral derecha superior
    createShootingStar({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.32 });
  }, 1200);

  setTimeout(() => {
    // 3. Lateral derecha inferior
    createShootingStar({ x: window.innerWidth * 0.80, y: window.innerHeight * 0.45 });
  }, 2200);

  // Intervalo continuo para que el cielo permanezca vivo
  function scheduleNextShootingStar() {
    const delay = Math.random() * 3500 + 2000; // Cada 2 a 5.5 segundos
    setTimeout(() => {
      createShootingStar();
      scheduleNextShootingStar();
    }, delay);
  }

  scheduleNextShootingStar();
}

/* ==========================================================================
   3. PARALLAX Y TILT 3D SUAVE AL MOVER EL CURSOR
   ========================================================================== */
function initBouquetInteractions() {
  const wrapper = document.getElementById('bouquetWrapper');
  if (!wrapper) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  window.addEventListener('mousemove', (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    // Rango de inclinación sutil (-7deg a +7deg)
    targetRotateY = ((e.clientX - centerX) / centerX) * 8;
    targetRotateX = -((e.clientY - centerY) / centerY) * 8;
  });

  // Animación de lerp (interpolación suave)
  function renderTilt() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.06;
    currentRotateY += (targetRotateY - currentRotateY) * 0.06;

    wrapper.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
    requestAnimationFrame(renderTilt);
  }

  renderTilt();
}

/* ==========================================================================
   4. POLVO DORADO Y PARTÍCULAS LUMINOSAS AL HACER CLICK / TOCAR
   ========================================================================== */
function initSparkleOnClick() {
  const container = document.body;

  function spawnSparkles(x, y, count = 14) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';

      const size = Math.random() * 8 + 4; // 4px a 12px
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 30;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40; // Elevarse levemente

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x - size / 2}px`;
      particle.style.top = `${y - size / 2}px`;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.animationDuration = `${Math.random() * 0.8 + 1.2}s`;

      container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 2000);
    }
  }

  window.addEventListener('click', (e) => {
    spawnSparkles(e.clientX, e.clientY, 16);
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      spawnSparkles(e.touches[0].clientX, e.touches[0].clientY, 12);
    }
  }, { passive: true });
}
