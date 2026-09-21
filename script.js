/**
 * ==========================================================================
 * RAMO DE GIRASOLES FLORECIENTE PARA THALIA DELINA JULCA HUAMAN
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de componentes
  initPetals();
  initAmbientCanvas();
  initButterflies();
  initFlowerBloomSequence();
  initLetterModal();
  initAudioSystem();
  initInteractions();
});

/* ==========================================================================
   1. GENERACIÓN PROCEDURAL DE PÉTALOS DE GIRASOL (3 CAPAS DENSIFICADAS)
   ========================================================================== */

function initPetals() {
  const sunflowers = document.querySelectorAll('.sunflower');

  sunflowers.forEach((flower, fIndex) => {
    const outerContainer = flower.querySelector('.petals-outer');
    const innerContainer = flower.querySelector('.petals-inner');

    if (!outerContainer || !innerContainer) return;
    outerContainer.innerHTML = '';
    innerContainer.innerHTML = '';

    // Capa exterior de pétalos (32 pétalos largos y dorados)
    const outerCount = 32;
    for (let i = 0; i < outerCount; i++) {
      const angle = (360 / outerCount) * i + (Math.random() * 2 - 1);
      const petal = document.createElement('div');
      petal.className = 'petal';
      const scaleY = 0.98 + Math.random() * 0.12;
      petal.style.transform = `rotate(${angle}deg) scaleY(${scaleY})`;
      outerContainer.appendChild(petal);
    }

    // Capa interior de pétalos (26 pétalos con desfase angular para volumen)
    const innerCount = 26;
    const offset = 360 / (innerCount * 2);
    for (let i = 0; i < innerCount; i++) {
      const angle = (360 / innerCount) * i + offset + (Math.random() * 2 - 1);
      const petal = document.createElement('div');
      petal.className = 'petal';
      const scaleY = 0.88 + Math.random() * 0.12;
      petal.style.transform = `rotate(${angle}deg) scaleY(${scaleY})`;
      innerContainer.appendChild(petal);
    }
  });
}

/* ==========================================================================
   2. SECUENCIA DE CRECIMIENTO Y FLORACIÓN DESDE ABAJO
   ========================================================================== */

let bloomTimeoutIds = [];

function initFlowerBloomSequence() {
  const bouquet = document.getElementById('bouquet-wrapper');
  const sunflowers = document.querySelectorAll('.sunflower');

  // Limpiar temporizadores anteriores si se presiona replay
  bloomTimeoutIds.forEach(id => clearTimeout(id));
  bloomTimeoutIds = [];

  // Reset inicial
  bouquet.classList.remove('bloomed', 'swaying');
  sunflowers.forEach(f => f.classList.remove('bloomed'));

  // Paso 1: El ramo asciende desde abajo
  const t1 = setTimeout(() => {
    bouquet.classList.add('bloomed');
  }, 250);
  bloomTimeoutIds.push(t1);

  // Paso 2: Las flores se abren en cascada armónica (staggered bloom)
  // Orden: Flor inferior (5), laterales (2, 3), superior (1), centro principal (4)
  const bloomOrder = [
    { selector: '.flower-bottom', delay: 1100 },
    { selector: '.flower-left', delay: 1350 },
    { selector: '.flower-right', delay: 1450 },
    { selector: '.flower-top', delay: 1650 },
    { selector: '.flower-center-main', delay: 1850 }
  ];

  bloomOrder.forEach(item => {
    const t = setTimeout(() => {
      const el = document.querySelector(item.selector);
      if (el) {
        el.classList.add('bloomed');
        spawnFlowerBloomSparkles(el);
        playBloomChime();
      }
    }, item.delay);
    bloomTimeoutIds.push(t);
  });

  // Paso 3: Activación del vaivén orgánico continuo (Breeze)
  const tFinal = setTimeout(() => {
    bouquet.classList.add('swaying');
  }, 3200);
  bloomTimeoutIds.push(tFinal);
}

// Botón para volver a ver florecer
document.getElementById('replay-btn')?.addEventListener('click', () => {
  initFlowerBloomSequence();
  createMagicBurst(window.innerWidth / 2, window.innerHeight * 0.65, 30);
});

/* ==========================================================================
   3. MARIPOSAS DORADAS FLOTANTES 3D (POR TODA LA PANTALLA)
   ========================================================================== */

const butterflies = [];

function initButterflies() {
  const container = document.getElementById('butterflies-container');
  if (!container) return;
  container.innerHTML = '';
  butterflies.length = 0;

  // 9 Mariposas distribuidas estratégicamente como en el video de TikTok:
  // (Superior cerca al texto, laterales izq/der, y alrededor del ramo)
  const count = 9;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  const initialSpots = [
    { x: screenW * 0.52, y: 75 }, // Cerca del texto "flores amarillas"
    { x: screenW * 0.12, y: screenH * 0.28 }, // Lateral izquierdo superior
    { x: screenW * 0.88, y: screenH * 0.28 }, // Lateral derecho superior
    { x: screenW * 0.18, y: screenH * 0.50 }, // Flanco izquierdo del ramo
    { x: screenW * 0.82, y: screenH * 0.52 }, // Flanco derecho del ramo
    { x: screenW * 0.38, y: screenH * 0.42 }, // Sobre girasoles izquierdos
    { x: screenW * 0.62, y: screenH * 0.42 }, // Sobre girasoles derechos
    { x: screenW * 0.15, y: screenH * 0.72 }, // Lateral izquierdo inferior
    { x: screenW * 0.85, y: screenH * 0.70 }  // Lateral derecho inferior
  ];

  for (let i = 0; i < count; i++) {
    const bf = document.createElement('div');
    bf.className = 'butterfly-wrapper';

    bf.innerHTML = `
      <div class="butterfly-body">
        <div class="bf-wing left"></div>
        <div class="bf-torso"></div>
        <div class="bf-wing right"></div>
      </div>
    `;

    container.appendChild(bf);

    const spot = initialSpots[i % initialSpots.length];

    butterflies.push({
      el: bf,
      x: spot.x,
      y: spot.y,
      targetX: spot.x,
      targetY: spot.y,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0.8 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      scale: 0.7 + Math.random() * 0.35,
      homeArea: i
    });
  }

  animateButterflies();
}

function animateButterflies() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  butterflies.forEach((b) => {
    b.phase += 0.035 * b.speed;

    // Movimiento suave alrededor de sus zonas preferentes
    if (Math.random() < 0.018) {
      const centerX = width * 0.5;
      const centerY = height * 0.55;

      switch(b.homeArea) {
        case 0: // Cerca al título
          b.targetX = centerX + (Math.random() * 260 - 130);
          b.targetY = 60 + Math.random() * 70;
          break;
        case 1:
        case 3:
        case 7: // Banda izquierda
          b.targetX = width * 0.12 + (Math.random() * 140 - 70);
          b.targetY = (height * 0.2) + Math.random() * (height * 0.6);
          break;
        case 2:
        case 4:
        case 8: // Banda derecha
          b.targetX = width * 0.88 + (Math.random() * 140 - 70);
          b.targetY = (height * 0.2) + Math.random() * (height * 0.6);
          break;
        default: // Alrededor del ramo central
          b.targetX = centerX + (Math.random() * 220 - 110);
          b.targetY = centerY + (Math.random() * 180 - 90);
          break;
      }
    }

    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;

    b.vx += dx * 0.0016;
    b.vy += dy * 0.0016;

    // Fricción
    b.vx *= 0.93;
    b.vy *= 0.93;

    // Oscilación de vuelo orgánico
    b.x += b.vx + Math.cos(b.phase) * 1.1;
    b.y += b.vy + Math.sin(b.phase * 1.3) * 1.1;

    // Rotación según vector de velocidad
    const targetAngle = Math.atan2(b.vy, b.vx) * (180 / Math.PI) + 90;
    b.angle += (targetAngle - b.angle) * 0.07;

    b.el.style.left = `${b.x}px`;
    b.el.style.top = `${b.y}px`;
    b.el.style.transform = `rotate(${b.angle}deg) scale(${b.scale})`;
  });

  requestAnimationFrame(animateButterflies);
}


/* ==========================================================================
   4. CANVAS AMBIENTAL: ESTRELLAS TITILANTES Y POLEN DORADO
   ========================================================================== */

let canvas, ctx;
let particles = [];
let stars = [];

function initAmbientCanvas() {
  canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Crear estrellas titilantes
  stars = [];
  const starCount = Math.floor((window.innerWidth * window.innerHeight) / 9000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.4,
      alpha: Math.random(),
      twinkleSpeed: 0.015 + Math.random() * 0.03
    });
  }

  // Crear partículas de polen dorado ascendente
  particles = [];
  const pollenCount = 55;
  for (let i = 0; i < pollenCount; i++) {
    particles.push(createPollenParticle(true));
  }

  renderCanvas();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createPollenParticle(randomY = false) {
  return {
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : canvas.height + 15,
    radius: 1.2 + Math.random() * 2.2,
    vx: Math.random() * 0.6 - 0.3,
    vy: -(0.5 + Math.random() * 1.1),
    alpha: 0.2 + Math.random() * 0.7,
    glow: Math.random() > 0.4,
    color: Math.random() > 0.3 ? '#ffd700' : '#ffe875'
  };
}

function renderCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Renderizar estrellas
  stars.forEach(s => {
    s.alpha += s.twinkleSpeed;
    if (s.alpha > 1 || s.alpha < 0.1) s.twinkleSpeed = -s.twinkleSpeed;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
    ctx.fill();
  });

  // Renderizar y mover polen
  particles.forEach((p, idx) => {
    p.y += p.vy;
    p.x += p.vx + Math.sin(p.y * 0.015) * 0.4;

    if (p.glow) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffd700';
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Reiniciar si sale de la pantalla superior
    if (p.y < -20) {
      particles[idx] = createPollenParticle();
    }
  });

  requestAnimationFrame(renderCanvas);
}

/* ==========================================================================
   5. EFECTOS INTERACTIVOS (BURSTS, DESTELLOS Y CLICKS EN GIRASOLES)
   ========================================================================== */

function spawnFlowerBloomSparkles(flowerEl) {
  const rect = flowerEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  createMagicBurst(cx, cy, 14);
}

function createMagicBurst(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'interactive-spark';
    document.body.appendChild(spark);

    const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5);
    const distance = 30 + Math.random() * 65;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    const size = 4 + Math.random() * 6;

    spark.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #fff, #ffd700, #ff8c00);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      box-shadow: 0 0 10px #ffd700;
      transition: transform 0.85s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.85s ease-out;
    `;

    requestAnimationFrame(() => {
      spark.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      spark.style.opacity = '0';
    });

    setTimeout(() => spark.remove(), 900);
  }
}

function initInteractions() {
  // Clic en cualquier girasol para hacerlo vibrar con destellos y sonido
  const sunflowers = document.querySelectorAll('.sunflower');
  sunflowers.forEach(flower => {
    flower.addEventListener('click', (e) => {
      e.stopPropagation();
      spawnFlowerBloomSparkles(flower);
      playSunflowerChime();

      // Efecto suave de pulso
      const bloom = flower.querySelector('.sunflower-bloom');
      if (bloom) {
        bloom.style.transform = 'scale(1.18) rotate(3deg)';
        setTimeout(() => {
          bloom.style.transform = 'scale(1) rotate(0deg)';
        }, 400);
      }
    });
  });

  // Toques en la pantalla generan destellos mágicos
  window.addEventListener('click', (e) => {
    // Si no es un botón ni modal
    if (!e.target.closest('button') && !e.target.closest('.letter-card')) {
      createMagicBurst(e.clientX, e.clientY, 10);
      playSoftTapNote();
    }
  });
}

/* ==========================================================================
   6. MODAL DE CARTA DEDICATORIA PARA THALIA
   ========================================================================== */

function initLetterModal() {
  const modal = document.getElementById('letter-modal');
  const openBtn = document.getElementById('open-letter-btn');
  const closeBtn = document.getElementById('close-letter-btn');
  const closeActionBtn = document.getElementById('modal-close-action');

  if (!modal || !openBtn) return;

  const openModal = () => {
    modal.classList.add('active');
    playHarmonicChord();
    createMagicBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  closeActionBtn?.addEventListener('click', closeModal);

  // Cerrar al pulsar fuera de la carta
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* ==========================================================================
   7. SISTEMA DE AUDIO Y SINTETIZADOR WEB AUDIO API
   ========================================================================== */

let audioCtx = null;
let isMusicPlaying = false;
let melodyInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sonido mágico al florecer
function playBloomChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.45, 'sine', 0.08);
    }, idx * 120);
  });
}

// Sonido al tocar un girasol
function playSunflowerChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const scale = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
  scale.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.5, 'triangle', 0.1);
    }, idx * 90);
  });
}

function playSoftTapNote() {
  const notes = [659.25, 783.99, 880.00, 1046.50];
  const note = notes[Math.floor(Math.random() * notes.length)];
  playTone(note, 0.25, 'sine', 0.04);
}

function playHarmonicChord() {
  const ctx = getAudioContext();
  if (!ctx) return;
  [440, 554.37, 659.25, 880].forEach(f => playTone(f, 0.8, 'sine', 0.07));
}

function playTone(frequency, duration, type = 'sine', volume = 0.1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Silencio ante restricciones de navegador
  }
}

// Melodía romántica: reproduce rosas.mpeg con fallback al sintetizador Web Audio API
function initAudioSystem() {
  const musicBtn = document.getElementById('music-toggle-btn');
  const audioEl = document.getElementById('bouquet-audio');
  if (!musicBtn) return;

  musicBtn.addEventListener('click', () => {
    if (!isMusicPlaying) {
      isMusicPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.querySelector('.btn-text').textContent = 'Pausar';
      musicBtn.querySelector('.btn-icon').textContent = '⏸️';

      if (audioEl) {
        audioEl.play().catch(() => {
          // Fallback a sintetizador si el archivo no reproduce
          getAudioContext();
          startAmbientMusic();
        });
      } else {
        getAudioContext();
        startAmbientMusic();
      }
    } else {
      isMusicPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('.btn-text').textContent = 'Música';
      musicBtn.querySelector('.btn-icon').textContent = '🎵';

      if (audioEl) {
        audioEl.pause();
      }
      stopAmbientMusic();
    }
  });
}

// Progresión de acordes romántica y dulce (Estilo Floricienta / Flores Amarillas)
const chordProgression = [
  // Acorde 1: Re Mayor (D - F# - A - D')
  [293.66, 369.99, 440.00, 587.33],
  // Acorde 2: La Mayor (A - C# - E - A')
  [220.00, 277.18, 329.63, 440.00],
  // Acorde 3: Si menor (B - D - F# - B')
  [246.94, 293.66, 369.99, 493.88],
  // Acorde 4: Sol Mayor (G - B - D - G')
  [196.00, 246.94, 293.66, 392.00]
];

let chordStep = 0;

function startAmbientMusic() {
  if (melodyInterval) clearInterval(melodyInterval);

  playChord(chordProgression[chordStep]);

  melodyInterval = setInterval(() => {
    chordStep = (chordStep + 1) % chordProgression.length;
    playChord(chordProgression[chordStep]);
  }, 3200);
}

function stopAmbientMusic() {
  if (melodyInterval) {
    clearInterval(melodyInterval);
    melodyInterval = null;
  }
}

function playChord(chordNotes) {
  const ctx = getAudioContext();
  if (!ctx || !isMusicPlaying) return;

  // Arpegio delicado
  chordNotes.forEach((freq, idx) => {
    setTimeout(() => {
      if (!isMusicPlaying) return;
      playTone(freq, 2.2, 'triangle', 0.05);
      // Brillo en octava superior
      if (idx === chordNotes.length - 1) {
        playTone(freq * 1.5, 1.6, 'sine', 0.03);
      }
    }, idx * 280);
  });
}
