/**
 * ==========================================================================
 * GALAXIA DORADA DE FLORES AMARILLAS - JAVASCRIPT
 * Dedicado con todo cariño para Thalia Delina Julca Huaman
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPortalPetals();
  initAudio();
  initGalaxySimulation();
  initRoseCardModal();
});

/* ==========================================================================
   1. GENERACIÓN DE PÉTALOS DEL GIRASOL INICIAL Y FLOR HERO
   ========================================================================== */

function initPortalPetals() {
  const portalContainer = document.querySelector('.portal-petals');
  const heroContainer = document.querySelector('.hero-petals');

  const createPetals = (container, count, length, width) => {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const petal = document.createElement('div');
      petal.style.cssText = `
        position: absolute;
        bottom: 50%;
        left: 50%;
        width: ${width}px;
        height: ${length}px;
        margin-left: -${width / 2}px;
        background: linear-gradient(to top, #ff8f00, #ffd700, #fff59d);
        border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
        transform-origin: center bottom;
        transform: rotate(${angle}deg);
        box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
      `;
      container.appendChild(petal);
    }
  };

  createPetals(portalContainer, 24, 62, 14);
  createPetals(heroContainer, 22, 40, 10);
}

/* ==========================================================================
   2. SISTEMA DE AUDIO (rosas.mpeg)
   ========================================================================== */

let audioEl = null;
let isAudioPlaying = false;

function initAudio() {
  audioEl = document.getElementById('galaxy-audio');
  const toggleBtn = document.getElementById('audio-toggle-btn');

  if (!toggleBtn || !audioEl) return;

  toggleBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });
}

function playAudio() {
  if (!audioEl) return;
  audioEl.play().then(() => {
    isAudioPlaying = true;
    const toggleBtn = document.getElementById('audio-toggle-btn');
    if (toggleBtn) {
      toggleBtn.classList.add('playing');
      toggleBtn.querySelector('.btn-text').textContent = 'Pausar';
      toggleBtn.querySelector('.btn-icon').textContent = '⏸️';
    }
  }).catch(() => {
    // Restricciones de autoplay del navegador
  });
}

function pauseAudio() {
  if (!audioEl) return;
  audioEl.pause();
  isAudioPlaying = false;
  const toggleBtn = document.getElementById('audio-toggle-btn');
  if (toggleBtn) {
    toggleBtn.classList.remove('playing');
    toggleBtn.querySelector('.btn-text').textContent = 'Música';
    toggleBtn.querySelector('.btn-icon').textContent = '🎵';
  }
}

/* ==========================================================================
   3. SIMULACIÓN CÓSMICA DE LA GALAXIA Y SECUENCIA DE ESTADOS
   ========================================================================== */

const STATES = {
  WAITING_TOUCH: 0,
  COLLAPSE_TO_RING: 1,
  EXPAND_GALAXY: 2,
  SHOOT_LIGHT_PILLAR: 3,
  FLOWER_CONSTELLATION: 4,
  FULL_ACTIVE: 5
};

let currentState = STATES.WAITING_TOUCH;
let stateTimer = 0;

let canvas, ctx;
let width = 0, height = 0;
let centerX = 0, centerY = 0;

// Colecciones de partículas
let bgStars = [];
let galaxyParticles = [];
let constellationParticles = [];
let pillarParticles = [];

// Elementos orbitantes
const ORBIT_PHRASES = [
  { text: 'Eres mi persona favorita', icon: '🌻', radiusX: 280, radiusY: 105, speed: 0.007, angle: 0 },
  { text: 'Thalia Delina Julca Huaman 💛', icon: '✨', radiusX: 380, radiusY: 140, speed: 0.005, angle: 1.1 },
  { text: 'Contigo todo es mejor', icon: '💐', radiusX: 240, radiusY: 90, speed: 0.008, angle: 2.2 },
  { text: 'Siempre brillas', icon: '⭐', radiusX: 320, radiusY: 120, speed: 0.006, angle: 3.3 },
  { text: 'Que tu vida esté llena de color', icon: '🌻', radiusX: 430, radiusY: 155, speed: 0.004, angle: 4.4 },
  { text: 'Gracias por tu luz', icon: '✨', radiusX: 200, radiusY: 75, speed: 0.009, angle: 5.2 },
  { text: 'Un detalle amarillo para ti', icon: '💛', radiusX: 350, radiusY: 130, speed: 0.0055, angle: 0.6 },
  { text: 'Mereces solo cosas buenas', icon: '🌻', radiusX: 470, radiusY: 170, speed: 0.0035, angle: 2.8 },
  { text: 'Hoy es tu día', icon: '🌻', radiusX: 290, radiusY: 110, speed: 0.0065, angle: 3.9 }
];

let orbitDomElements = [];

function initGalaxySimulation() {
  canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  initBackgroundStars();
  initGalaxyParticles();
  initConstellation();

  // Iniciar loop de renderizado
  requestAnimationFrame(renderLoop);

  // Escuchar toque inicial
  const startOverlay = document.getElementById('start-overlay');
  startOverlay?.addEventListener('click', startSequence);

  // Botón de reinicio
  const resetBtn = document.getElementById('reset-galaxy-btn');
  resetBtn?.addEventListener('click', resetSimulation);
}

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  const isMobile = width < 500;
  centerY = isMobile ? height * 0.62 : height * 0.58;

  initBackgroundStars();
  initGalaxyParticles();
  initConstellation();

  // Si la constelación ya estaba desplegada, fijar sus partículas a las coordenadas finales
  if (currentState >= STATES.FLOWER_CONSTELLATION) {
    constellationParticles.forEach(p => {
      p.curX = p.targetX;
      p.curY = p.targetY;
    });
  }
}

function startSequence() {
  if (currentState !== STATES.WAITING_TOUCH) return;

  playAudio();

  const startOverlay = document.getElementById('start-overlay');
  const portal = document.getElementById('sunflower-portal');

  // Animación de contracción del girasol
  if (portal) portal.style.transform = 'scale(0.05)';
  setTimeout(() => {
    startOverlay?.classList.add('hidden');
    currentState = STATES.COLLAPSE_TO_RING;
    stateTimer = 0;
  }, 600);
}

function resetSimulation() {
  currentState = STATES.WAITING_TOUCH;
  stateTimer = 0;

  const startOverlay = document.getElementById('start-overlay');
  const portal = document.getElementById('sunflower-portal');
  const orbitContainer = document.getElementById('orbit-elements-container');
  const bottomFlower = document.getElementById('bottom-hero-flower');

  if (startOverlay) startOverlay.classList.remove('hidden');
  if (portal) portal.style.transform = 'scale(1)';
  if (orbitContainer) {
    orbitContainer.classList.remove('active');
    orbitContainer.innerHTML = '';
  }
  if (bottomFlower) bottomFlower.classList.remove('active');
  orbitDomElements = [];

  initGalaxyParticles();
}

/* ==========================================================================
   PARTÍCULAS DE ESTRELLAS Y GALAXIA
   ========================================================================== */

function initBackgroundStars() {
  bgStars = [];
  const count = 350;
  for (let i = 0; i < count; i++) {
    bgStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: 0.01 + Math.random() * 0.02
    });
  }
}

function initGalaxyParticles() {
  galaxyParticles = [];
  const count = 2200;
  const arms = 3;

  for (let i = 0; i < count; i++) {
    const armIndex = i % arms;
    const distanceNorm = Math.pow(Math.random(), 1.6);
    const maxRadius = Math.min(width, height) * 0.52;
    const radius = 35 + distanceNorm * maxRadius;

    // Ángulo en espiral logarítmica
    const spiralOffset = (Math.PI * 2 / arms) * armIndex;
    const angle = spiralOffset + distanceNorm * 4.2 + (Math.random() * 0.4 - 0.2);

    // Color: núcleo blanco-dorado resplandeciente, brazos ámbar y oro
    let color;
    if (distanceNorm < 0.2) {
      color = Math.random() > 0.3 ? '#ffffff' : '#fff59d';
    } else if (distanceNorm < 0.6) {
      color = Math.random() > 0.3 ? '#ffd700' : '#ffb700';
    } else {
      color = Math.random() > 0.4 ? '#ffa000' : '#ffe082';
    }

    galaxyParticles.push({
      radius: radius,
      baseRadius: radius,
      angle: angle,
      speed: (0.003 + (1 / (radius + 20)) * 0.4) * (0.8 + Math.random() * 0.4),
      size: Math.random() * 2.2 + 0.6,
      color: color,
      alpha: 0.3 + Math.random() * 0.7,
      z: Math.random() * 30 - 15
    });
  }
}

/* ==========================================================================
   CONSTELACIÓN FLORAL DE ESTRELLAS (GIRASOL CELESTIAL DEFINIDO Y RADIANTE)
   Recrea con fidelidad la flor de estrellas de la captura de TikTok
   ========================================================================== */

function initConstellation() {
  constellationParticles = [];
  const isMobile = width < 500;

  // Centro y tamaño proporcional
  const constCenterX = centerX;
  const constCenterY = isMobile ? Math.max(120, height * 0.20) : height * 0.24;
  const baseSize = isMobile ? Math.min(width * 0.38, 145) : Math.min(width, height) * 0.175;

  const coreRadius = baseSize * 0.30;
  const petalLength = baseSize * 0.75;
  const maxPetalRadius = coreRadius + petalLength;

  // 1. DISCO CENTRAL DEL GIRASOL (Espiral de Fibonacci / Semillas estelares)
  const coreParticlesCount = isMobile ? 380 : 550;
  const phi = (1 + Math.sqrt(5)) / 2; // Razón áurea
  const goldenAngle = Math.PI * 2 * (1 - 1 / phi); // ~137.5 grados

  for (let i = 0; i < coreParticlesCount; i++) {
    const rNorm = Math.sqrt((i + 1) / coreParticlesCount);
    const r = rNorm * coreRadius;
    const theta = i * goldenAngle;

    const x = constCenterX + r * Math.cos(theta) + (Math.random() * 2 - 1);
    const y = constCenterY + r * Math.sin(theta) + (Math.random() * 2 - 1);

    // Color del núcleo: ámbar dorado profundo en el centro, destellos oro en el borde
    let color;
    if (rNorm < 0.35) {
      color = Math.random() > 0.4 ? '#ffa000' : '#ff8f00';
    } else if (rNorm < 0.75) {
      color = Math.random() > 0.3 ? '#ffd700' : '#ffb300';
    } else {
      color = Math.random() > 0.25 ? '#ffffff' : '#fff59d'; // Borde muy brillante
    }

    constellationParticles.push({
      x: x,
      y: y,
      targetX: x,
      targetY: y,
      curX: constCenterX,
      curY: centerY,
      r: rNorm > 0.85 ? (Math.random() * 1.8 + 0.9) : (Math.random() * 1.5 + 0.6),
      color: color,
      alpha: Math.random() * 0.8 + 0.2,
      twinkle: 0.02 + Math.random() * 0.04,
      isCore: true
    });
  }

  // 2. PÉTALOS RADIALES DE GIRASOL (12 pétalos primarios + 12 secundarios)
  // Cada pétalo tiene forma de lanza botánica: punta afilada, cuerpo ancho y base estrecha
  const primaryPetalCount = 12;
  const secondaryPetalCount = 12;

  // Función generadora de partículas para un pétalo
  const generatePetalParticles = (petalIndex, totalPetals, lengthFactor, widthAngleSpread, layer) => {
    const petalAngle = (Math.PI * 2 / totalPetals) * petalIndex + (layer === 2 ? Math.PI / totalPetals : 0);
    const pLength = petalLength * lengthFactor;
    const stepsAlong = isMobile ? 18 : 24;

    for (let step = 0; step <= stepsAlong; step++) {
      const u = step / stepsAlong; // 0 = base, 1 = punta
      if (u < 0.08) continue; // No tocar el centro exacto

      const currentDist = coreRadius + u * pLength;
      // Ancho máximo en el medio (u = 0.55), afilado hacia la punta (u = 1.0)
      const currentWidthAngle = widthAngleSpread * Math.sin(u * Math.PI) * (1 - u * 0.3);

      // Partículas en el contorno del pétalo (borde izquierdo y derecho nítido)
      [-1, 1].forEach(side => {
        const borderAngle = petalAngle + side * currentWidthAngle;
        const x = constCenterX + currentDist * Math.cos(borderAngle) + (Math.random() * 2 - 1);
        const y = constCenterY + currentDist * Math.sin(borderAngle) + (Math.random() * 2 - 1);

        constellationParticles.push({
          x: x,
          y: y,
          targetX: x,
          targetY: y,
          curX: constCenterX,
          curY: centerY,
          r: Math.random() * 1.7 + 0.8,
          color: u > 0.8 ? '#ffffff' : '#ffd700',
          alpha: 0.85 + Math.random() * 0.15,
          twinkle: 0.025 + Math.random() * 0.035,
          isEdge: true
        });
      });

      // Partículas interiores del pétalo (relleno dorado)
      const fillCount = Math.floor(currentWidthAngle * 35);
      for (let f = 0; f < fillCount; f++) {
        const offsetFraction = (Math.random() * 2 - 1) * 0.85;
        const fillAngle = petalAngle + offsetFraction * currentWidthAngle;
        const fillDist = currentDist + (Math.random() * 4 - 2);

        const x = constCenterX + fillDist * Math.cos(fillAngle);
        const y = constCenterY + fillDist * Math.sin(fillAngle);

        const isTip = u > 0.85;
        const color = isTip 
          ? (Math.random() > 0.4 ? '#fff9c4' : '#ffd700')
          : (Math.random() > 0.5 ? '#ffd700' : '#ffa000');

        constellationParticles.push({
          x: x,
          y: y,
          targetX: x,
          targetY: y,
          curX: constCenterX,
          curY: centerY,
          r: isTip ? (Math.random() * 1.8 + 0.7) : (Math.random() * 1.4 + 0.5),
          color: color,
          alpha: Math.random() * 0.75 + 0.25,
          twinkle: 0.02 + Math.random() * 0.035,
          isFill: true
        });
      }

      // Vena central del pétalo (hilo de estrellas luminosas)
      if (step % 2 === 0) {
        const x = constCenterX + currentDist * Math.cos(petalAngle);
        const y = constCenterY + currentDist * Math.sin(petalAngle);
        constellationParticles.push({
          x: x,
          y: y,
          targetX: x,
          targetY: y,
          curX: constCenterX,
          curY: centerY,
          r: Math.random() * 1.9 + 0.8,
          color: '#ffffff',
          alpha: 0.9,
          twinkle: 0.04,
          isVein: true
        });
      }
    }

    // Estrella extra luminosa en la punta del pétalo
    const tipX = constCenterX + (coreRadius + pLength) * Math.cos(petalAngle);
    const tipY = constCenterY + (coreRadius + pLength) * Math.sin(petalAngle);
    constellationParticles.push({
      x: tipX,
      y: tipY,
      targetX: tipX,
      targetY: tipY,
      curX: constCenterX,
      curY: centerY,
      r: Math.random() * 2.5 + 1.2,
      color: '#ffffff',
      alpha: 1.0,
      twinkle: 0.05,
      isTipStar: true
    });
  };

  // Generar capa exterior de pétalos (más anchos y largos)
  for (let i = 0; i < primaryPetalCount; i++) {
    generatePetalParticles(i, primaryPetalCount, 1.0, 0.15, 1);
  }

  // Generar capa interior de pétalos (intercalados para volumen y frondosidad)
  for (let j = 0; j < secondaryPetalCount; j++) {
    generatePetalParticles(j, secondaryPetalCount, 0.86, 0.12, 2);
  }
}

/* ==========================================================================
   CREACIÓN DE ELEMENTOS ORBITANTES EN EL DOM
   ========================================================================== */

function activateOrbitElements() {
  const container = document.getElementById('orbit-elements-container');
  const bottomFlower = document.getElementById('bottom-hero-flower');

  if (!container) return;
  container.innerHTML = '';
  container.classList.add('active');
  if (bottomFlower) bottomFlower.classList.add('active');

  orbitDomElements = [];

  ORBIT_PHRASES.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'orbit-item';
    el.innerHTML = `
      <span class="orbit-flower-icon">${item.icon}</span>
      <span class="orbit-phrase">${item.text}</span>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openRoseCard(item.text);
    });

    container.appendChild(el);
    orbitDomElements.push({
      dom: el,
      data: item
    });
  });

  // Evento en la flor hero inferior
  const heroBtn = document.getElementById('hero-sunflower-btn');
  heroBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openRoseCard('Eres mi persona favorita');
  });
}

/* ==========================================================================
   BUCLE PRINCIPAL DE RENDERIZADO
   ========================================================================== */

let lastTime = performance.now();

function renderLoop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  ctx.clearRect(0, 0, width, height);

  // 1. Estrellas de fondo
  renderBackgroundStars();

  // 2. Máquina de Estados de la Galaxia
  updateAndRenderState(dt);

  requestAnimationFrame(renderLoop);
}

function renderBackgroundStars() {
  bgStars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.15) s.speed = -s.speed;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
    ctx.fill();
  });
}

function updateAndRenderState(dt) {
  stateTimer += dt;

  switch (currentState) {
    case STATES.WAITING_TOUCH:
      // Solo fondo esperando interacción
      break;

    case STATES.COLLAPSE_TO_RING:
      // WhatsApp Image (5): Anillo dorado de agujero negro apareciendo
      renderBlackHoleRing(Math.min(1, stateTimer / 1.5));
      if (stateTimer >= 2.0) {
        currentState = STATES.EXPAND_GALAXY;
        stateTimer = 0;
      }
      break;

    case STATES.EXPAND_GALAXY:
      // WhatsApp Image (2): Expansión del disco galáctico
      const expansionProg = Math.min(1, stateTimer / 2.5);
      renderBlackHoleRing(1);
      renderGalaxyDisk(expansionProg);
      if (stateTimer >= 2.8) {
        currentState = STATES.SHOOT_LIGHT_PILLAR;
        stateTimer = 0;
      }
      break;

    case STATES.SHOOT_LIGHT_PILLAR:
      // WhatsApp Image 30.jpeg: Haz de luz disparado hacia arriba
      renderBlackHoleRing(1);
      renderGalaxyDisk(1);
      const pillarProg = Math.min(1, stateTimer / 1.8);
      renderLightPillar(pillarProg);
      if (stateTimer >= 2.0) {
        currentState = STATES.FLOWER_CONSTELLATION;
        stateTimer = 0;
      }
      break;

    case STATES.FLOWER_CONSTELLATION:
      // WhatsApp Image (1): Gran flor de estrellas en el cielo
      renderBlackHoleRing(1);
      renderGalaxyDisk(1);
      renderLightPillar(Math.max(0, 1 - stateTimer / 2.0));
      const constelProg = Math.min(1, stateTimer / 2.2);
      renderFlowerConstellation(constelProg);
      if (stateTimer >= 2.5) {
        currentState = STATES.FULL_ACTIVE;
        stateTimer = 0;
        activateOrbitElements();
      }
      break;

    case STATES.FULL_ACTIVE:
      // WhatsApp Image 29 (1) y 29 (2): Galaxia activa completa con flores orbitando
      renderBlackHoleRing(1);
      renderGalaxyDisk(1);
      renderFlowerConstellation(1);
      updateOrbitElementsPositions();
      break;
  }
}

/* ==========================================================================
   RENDERIZADORES CÓSMICOS (AGUJERO NEGRO, HAZ, CONSTELACIÓN Y DISCO)
   ========================================================================== */

// Anillo de Acreción Dorado y Agujero Negro Central (Interstellar Style)
function renderBlackHoleRing(progress) {
  const ringRadiusX = 48 * progress;
  const ringRadiusY = 16 * progress;

  if (ringRadiusX <= 0) return;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Halo resplandeciente exterior
  const glowGrad = ctx.createRadialGradient(0, 0, ringRadiusY * 0.6, 0, 0, ringRadiusX * 2.2);
  glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  glowGrad.addColorStop(0.35, 'rgba(255, 160, 0, 0.6)');
  glowGrad.addColorStop(0.7, 'rgba(255, 100, 0, 0.2)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.ellipse(0, 0, ringRadiusX * 2.2, ringRadiusY * 2.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Anillo de Acreción Brillante (Elipse dorada inclinada)
  ctx.beginPath();
  ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 5 * progress;
  ctx.shadowColor = '#fff59d';
  ctx.shadowBlur = 15;
  ctx.stroke();

  // Arco superior brillante (Lente gravitacional)
  ctx.beginPath();
  ctx.ellipse(0, -ringRadiusY * 0.35, ringRadiusX * 0.75, ringRadiusY * 1.1, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = '#fff9c4';
  ctx.lineWidth = 3.5 * progress;
  ctx.stroke();

  // Agujero Negro Central (Horizonte de Sucesos)
  ctx.beginPath();
  ctx.ellipse(0, 0, ringRadiusX * 0.65, ringRadiusY * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#020204';
  ctx.shadowBlur = 0;
  ctx.fill();

  ctx.restore();
}

// Disco de la Galaxia Espiral con perspectiva 3D
function renderGalaxyDisk(expansion) {
  const tilt = 0.35; // Compresión del eje Y para inclinación 3D

  galaxyParticles.forEach(p => {
    p.angle += p.speed;
    const curR = p.baseRadius * expansion;

    const x = centerX + Math.cos(p.angle) * curR;
    const y = centerY + Math.sin(p.angle) * curR * tilt + p.z;

    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha * expansion;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  });
}

// Haz / Columna de Luz Dorada que asciende verticalmente
function renderLightPillar(progress) {
  if (progress <= 0) return;

  const targetY = height * 0.26;
  const currentTop = centerY - (centerY - targetY) * progress;

  ctx.save();

  // Columna de energía con degradado
  const beamGrad = ctx.createLinearGradient(centerX, centerY, centerX, currentTop);
  beamGrad.addColorStop(0, 'rgba(255, 235, 120, 0.95)');
  beamGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.75)');
  beamGrad.addColorStop(1, 'rgba(255, 240, 180, 0.9)');

  ctx.beginPath();
  ctx.moveTo(centerX - 18 * progress, centerY);
  ctx.lineTo(centerX + 18 * progress, centerY);
  ctx.lineTo(centerX + 32 * progress, currentTop);
  ctx.lineTo(centerX - 32 * progress, currentTop);
  ctx.closePath();

  ctx.fillStyle = beamGrad;
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 25;
  ctx.fill();

  // Partículas ascendiendo rápidamente por el haz
  for (let i = 0; i < 6; i++) {
    const py = centerY - Math.random() * (centerY - currentTop);
    const px = centerX + (Math.random() * 24 - 12);
    ctx.beginPath();
    ctx.arc(px, py, Math.random() * 2.5 + 1, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  ctx.restore();
}

// Gran Constelación Celestial en forma de Girasol Realista y Definido
function renderFlowerConstellation(progress) {
  if (progress <= 0 || constellationParticles.length === 0) return;

  const isMobile = width < 500;
  const constCenterX = centerX;
  const constCenterY = isMobile ? Math.max(120, height * 0.20) : height * 0.24;
  const baseSize = isMobile ? Math.min(width * 0.38, 145) : Math.min(width, height) * 0.175;
  const coreRadius = baseSize * 0.30;
  const maxRadius = baseSize * 1.05;

  ctx.save();

  // 1. Aura cósmica de fondo del girasol (resplandor celestial cálido)
  const auraGrad = ctx.createRadialGradient(constCenterX, constCenterY, coreRadius * 0.3, constCenterX, constCenterY, maxRadius * 1.25);
  auraGrad.addColorStop(0, 'rgba(255, 215, 0, ' + (0.35 * progress) + ')');
  auraGrad.addColorStop(0.35, 'rgba(255, 170, 0, ' + (0.22 * progress) + ')');
  auraGrad.addColorStop(0.75, 'rgba(255, 120, 0, ' + (0.08 * progress) + ')');
  auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(constCenterX, constCenterY, maxRadius * 1.25, 0, Math.PI * 2);
  ctx.fillStyle = auraGrad;
  ctx.fill();

  // 2. Halo del ojo central del girasol (disco oscuro con borde dorado resplandeciente)
  const coreGrad = ctx.createRadialGradient(constCenterX, constCenterY, 0, constCenterX, constCenterY, coreRadius);
  coreGrad.addColorStop(0, 'rgba(45, 20, 5, ' + (0.85 * progress) + ')');
  coreGrad.addColorStop(0.75, 'rgba(30, 12, 2, ' + (0.75 * progress) + ')');
  coreGrad.addColorStop(1, 'rgba(255, 215, 0, ' + (0.6 * progress) + ')');

  ctx.beginPath();
  ctx.arc(constCenterX, constCenterY, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // 3. Renderizado de cada partícula estelar del girasol
  constellationParticles.forEach(p => {
    p.curX += (p.targetX - p.curX) * 0.08;
    p.curY += (p.targetY - p.curY) * 0.08;

    p.alpha += p.twinkle;
    if (p.alpha > 1 || p.alpha < 0.25) p.twinkle = -p.twinkle;

    ctx.beginPath();
    ctx.arc(p.curX, p.curY, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0.15, Math.min(1, p.alpha)) * progress;

    if (p.isEdge || p.isTipStar) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 6;
    }

    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  });

  ctx.restore();
}

// Actualización de posición de las frases y flores orbitando (100% Responsivo Móvil)
function updateOrbitElementsPositions() {
  const isMobile = width < 500;
  // Factor de compresión orbital según ancho disponible en el teléfono
  const scaleX = isMobile ? Math.min((width * 0.44) / 470, 0.45) : 1;
  const scaleY = isMobile ? 0.62 : 1;

  orbitDomElements.forEach(item => {
    const data = item.data;
    data.angle += data.speed;

    const rx = data.radiusX * scaleX;
    const ry = data.radiusY * scaleY;

    const x = centerX + Math.cos(data.angle) * rx;
    const y = centerY + Math.sin(data.angle) * ry;

    // Escala y brillo según profundidad orbital (frente vs fondo)
    const depth = Math.sin(data.angle); // -1 (fondo) a 1 (frente)
    const baseScale = isMobile ? 0.72 : 0.85;
    const scale = baseScale + (depth + 1) * (isMobile ? 0.14 : 0.18);
    const opacity = 0.55 + (depth + 1) * 0.25;
    const zIndex = Math.round((depth + 1) * 10) + 10;

    item.dom.style.left = `${x}px`;
    item.dom.style.top = `${y}px`;
    item.dom.style.transform = `translate(-50%, -50%) scale(${scale})`;
    item.dom.style.opacity = `${opacity}`;
    item.dom.style.zIndex = `${zIndex}`;
  });
}

/* ==========================================================================
   4. MODAL DE LA TARJETA DE ROSAS AMARILLAS
   ========================================================================== */

function initRoseCardModal() {
  const modal = document.getElementById('rose-card-modal');
  const closeX = document.getElementById('card-close-x');
  const closeBtn = document.getElementById('card-close-btn');

  const closeModal = () => {
    modal?.classList.remove('active');
  };

  closeX?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function openRoseCard(titleText) {
  const modal = document.getElementById('rose-card-modal');
  const titleEl = document.querySelector('.card-title');

  if (titleEl && titleText) {
    titleEl.textContent = titleText.replace(/[🌻💛✨💐⭐]/g, '').trim() || 'Mi persona favorita';
  }

  if (modal) {
    modal.classList.add('active');
  }
}
