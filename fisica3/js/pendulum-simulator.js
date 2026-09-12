/**
 * ============================================================================
 * PENDULUM SIMULATOR & GEOGEBRA ANGULAR ENGINE
 * Motor de Simulación de Péndulo Simple a 60 FPS con Vectores y GeoGebra
 * - Ecuación de movimiento no lineal: d²θ/dt² + (g/L) sin(θ) = 0
 * - Vectores de tensión (T), peso (mg) y componente tangencial restauradora (Ft)
 * - Ambientes gravitacionales: Tierra, Luna, Marte, Júpiter
 * - Plano cartesiano sincronizado para θ(t), ω(t) y espacio de fases (θ, ω)
 * ============================================================================
 */

class PendulumSimulator {
  constructor(simCanvasId, geoCanvasId, phaseCanvasId) {
    this.simCanvas = document.getElementById(simCanvasId);
    this.geoCanvas = document.getElementById(geoCanvasId);
    this.phaseCanvas = document.getElementById(phaseCanvasId);
    if (!this.simCanvas || !this.geoCanvas) return;

    this.simCtx = this.simCanvas.getContext('2d');
    this.geoCtx = this.geoCanvas.getContext('2d');
    this.phaseCtx = this.phaseCanvas?.getContext('2d');

    // Parámetros físicos
    this.params = {
      length: 1.5,     // Longitud [m] (0.5 a 3.0)
      theta0: 0.52,    // Ángulo inicial [rad] (aprox 30°)
      theta: 0.52,     // Ángulo actual [rad]
      omega: 0.0,      // Velocidad angular [rad/s]
      alpha: 0.0,      // Aceleración angular [rad/s²]
      mass: 1.0,       // Masa de la lenteja [kg]
      gravity: 9.8,    // Aceleración gravitacional [m/s²]
      planetName: 'Tierra',
      time: 0.0,
      isPlaying: true,
      speedScale: 1.0
    };

    // Historial para la gráfica cartesiana
    this.history = []; // { t, theta, omega }
    this.maxHistory = 400;

    this.initCanvasSizes();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initCanvasSizes();
        this.render();
      });
      [this.simCanvas, this.geoCanvas, this.phaseCanvas]
        .filter(Boolean)
        .forEach(canvas => this.resizeObserver.observe(canvas));
    }
    this.lastTimestamp = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvasSizes() {
    const dpr = window.devicePixelRatio || 1;

    // Sim Canvas
    const rectSim = this.simCanvas.getBoundingClientRect();
    this.simWidth = rectSim.width || this.simCanvas.clientWidth || 360;
    this.simHeight = rectSim.height || this.simCanvas.clientHeight || 210;
    this.simCanvas.width = Math.floor(this.simWidth * dpr);
    this.simCanvas.height = Math.floor(this.simHeight * dpr);
    this.simCtx.resetTransform();
    this.simCtx.scale(dpr, dpr);

    // Geo Canvas
    const rectGeo = this.geoCanvas.getBoundingClientRect();
    this.geoWidth = rectGeo.width || this.geoCanvas.clientWidth || 360;
    this.geoHeight = rectGeo.height || this.geoCanvas.clientHeight || 210;
    this.geoCanvas.width = Math.floor(this.geoWidth * dpr);
    this.geoCanvas.height = Math.floor(this.geoHeight * dpr);
    this.geoCtx.resetTransform();
    this.geoCtx.scale(dpr, dpr);

    if (this.phaseCanvas && this.phaseCtx) {
      const rectPhase = this.phaseCanvas.getBoundingClientRect();
      this.phaseWidth = rectPhase.width || this.phaseCanvas.clientWidth || 360;
      this.phaseHeight = rectPhase.height || this.phaseCanvas.clientHeight || 200;
      this.phaseCanvas.width = Math.floor(this.phaseWidth * dpr);
      this.phaseCanvas.height = Math.floor(this.phaseHeight * dpr);
      this.phaseCtx.resetTransform();
      this.phaseCtx.scale(dpr, dpr);
    }
  }

  setLength(l) {
    this.params.length = Math.max(0.4, Math.min(3.0, l));
    this.updateMetrics();
  }

  setInitialAngle(deg) {
    const rad = (deg * Math.PI) / 180;
    this.params.theta0 = rad;
    this.reset();
  }

  setMass(m) {
    this.params.mass = Math.max(0.2, m);
    this.updateMetrics();
  }

  setGravity(g, name = 'Personalizada') {
    this.params.gravity = g;
    this.params.planetName = name;
    this.updateMetrics();
  }

  togglePlay() {
    this.params.isPlaying = !this.params.isPlaying;
    return this.params.isPlaying;
  }

  reset() {
    this.params.theta = this.params.theta0;
    this.params.omega = 0.0;
    this.params.alpha = -(this.params.gravity / this.params.length) * Math.sin(this.params.theta);
    this.params.time = 0.0;
    this.history = [];
    this.updateMetrics();
    this.render();
  }

  updateMetrics() {
    const omega0 = Math.sqrt(this.params.gravity / this.params.length);
    const T0 = (2 * Math.PI) / omega0;
    const TExact = T0 * (1 + (1 / 16) * (this.params.theta0 * this.params.theta0));

    const elPeriod = document.getElementById('pendValT');
    const elOmega = document.getElementById('pendValOmega');
    const elTension = document.getElementById('pendValTension');

    const tension = this.params.mass * (this.params.gravity * Math.cos(this.params.theta) + this.params.length * (this.params.omega * this.params.omega));

    if (elPeriod) elPeriod.textContent = `${TExact.toFixed(2)} s`;
    if (elOmega) elOmega.textContent = `${omega0.toFixed(2)} rad/s`;
    if (elTension) elTension.textContent = `${Math.abs(tension).toFixed(1)} N`;
  }

  animate(currentTimestamp) {
    const dt = Math.min((currentTimestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = currentTimestamp;

    if (this.params.isPlaying) {
      const subSteps = 6;
      const subDt = (dt * this.params.speedScale) / subSteps;

      for (let i = 0; i < subSteps; i++) {
        const g_over_L = this.params.gravity / this.params.length;
        this.params.alpha = -g_over_L * Math.sin(this.params.theta);
        this.params.omega += this.params.alpha * subDt;
        this.params.theta += this.params.omega * subDt;
        this.params.time += subDt;
      }

      this.history.push({
        t: this.params.time,
        theta: this.params.theta,
        omega: this.params.omega
      });

      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      this.updateMetrics();
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    this.renderSim();
    this.renderGeo();
    this.renderPhase();
  }

  renderPhase() {
    if (!this.phaseCtx || !this.phaseCanvas) return;

    const ctx = this.phaseCtx;
    const w = this.phaseWidth;
    const h = this.phaseHeight;
    const originX = 38;
    const originY = h / 2;
    const plotWidth = w - originX - 12;
    const plotHeight = h - 22;
    const thetaLimit = Math.max(0.7, Math.abs(this.params.theta0) * 1.35);
    const omegaLimit = Math.max(1.5, Math.sqrt(this.params.gravity / this.params.length) * thetaLimit * 1.35);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = originX; x <= w - 8; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, h - 14);
      ctx.stroke();
    }
    for (let y = 8; y <= h - 14; y += 20) {
      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(w - 8, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(w - 8, originY);
    ctx.moveTo(originX, 8);
    ctx.lineTo(originX, h - 14);
    ctx.stroke();

    ctx.font = '10px Fira Code, monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('θ [rad]', w - 54, originY - 7);
    ctx.fillText('ω', originX + 6, 16);

    if (this.history.length > 1) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      this.history.forEach((point, index) => {
        const x = originX + ((point.theta + thetaLimit) / (2 * thetaLimit)) * plotWidth;
        const y = originY - (point.omega / omegaLimit) * (plotHeight / 2);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const last = this.history[this.history.length - 1];
      const currentX = originX + ((last.theta + thetaLimit) / (2 * thetaLimit)) * plotWidth;
      const currentY = originY - (last.omega / omegaLimit) * (plotHeight / 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '9px Outfit, sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('Trayectoria (θ, ω)', w - 118, h - 5);
  }

  renderSim() {
    const ctx = this.simCtx;
    const w = this.simWidth;
    const h = this.simHeight;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    const pivotX = w / 2;
    const pivotY = 22;

    const pixelsPerMeter = (h - 55) / 2.6;
    const visualLength = this.params.length * pixelsPerMeter;

    const bobX = pivotX + visualLength * Math.sin(this.params.theta);
    const bobY = pivotY + visualLength * Math.cos(this.params.theta);

    // Eje vertical punteado de referencia
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + visualLength + 10);
    ctx.stroke();

    // Arco angular
    ctx.beginPath();
    const arcRadius = 38;
    ctx.arc(pivotX, pivotY, arcRadius, Math.PI / 2, Math.PI / 2 + this.params.theta, this.params.theta < 0);
    ctx.stroke();
    ctx.setLineDash([]);

    const angleDeg = ((this.params.theta * 180) / Math.PI).toFixed(1);
    ctx.fillStyle = '#0284c7';
    ctx.font = '10px Fira Code, monospace';
    ctx.fillText(`θ = ${angleDeg}°`, pivotX + (this.params.theta >= 0 ? 12 : -50), pivotY + arcRadius + 12);

    // Cuerda
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Pivote
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vectores físicos
    const vectorScale = 2.4;

    // 1. Tensión T (hacia el pivote, Cian)
    const tensionMag = Math.max(0, this.params.mass * (this.params.gravity * Math.cos(this.params.theta) + this.params.length * (this.params.omega * this.params.omega)));
    const tVecLen = Math.min(55, tensionMag * vectorScale * 0.7);
    const tDirX = -Math.sin(this.params.theta);
    const tDirY = -Math.cos(this.params.theta);
    this.drawArrow(ctx, bobX, bobY, bobX + tDirX * tVecLen, bobY + tDirY * tVecLen, '#00f0ff', 'T');

    // 2. Peso mg (vertical, Rojo)
    const mgLen = Math.min(45, this.params.mass * this.params.gravity * vectorScale * 0.7);
    this.drawArrow(ctx, bobX, bobY, bobX, bobY + mgLen, '#ef4444', 'mg');

    // 3. Fuerza Tangencial Ft = -mg sin(θ) (Verde)
    const ftMag = -this.params.mass * this.params.gravity * Math.sin(this.params.theta);
    const ftLen = ftMag * vectorScale * 0.8;
    const tangX = Math.cos(this.params.theta);
    const tangY = -Math.sin(this.params.theta);
    this.drawArrow(ctx, bobX, bobY, bobX + tangX * ftLen, bobY + tangY * ftLen, '#10b981', 'Ft');

    // Lenteja
    const bobRadius = 11 + Math.sqrt(this.params.mass) * 3.5;
    const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, bobRadius);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#075985');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '9px Outfit, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${this.params.planetName} (g = ${this.params.gravity.toFixed(2)} m/s²)`, 8, h - 8);
  }

  renderGeo() {
    const ctx = this.geoCtx;
    const w = this.geoWidth;
    const h = this.geoHeight;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const originX = 35;
    const originY = h / 2;

    // Cuadrícula
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(w - 10, originY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(originX, 8);
    ctx.lineTo(originX, h - 8);
    ctx.stroke();

    // Etiquetas
    ctx.font = '10px Fira Code, monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('t [s]', w - 28, originY + 12);
    ctx.fillText('θ(t)', originX + 5, 14);

    if (this.history.length > 1) {
      const scaleTime = (w - originX - 25) / this.maxHistory;
      const scaleTheta = (h / 2 - 20) / Math.max(0.7, Math.abs(this.params.theta0) * 1.25);

      // Curva θ(t)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const pt = this.history[i];
        const screenX = originX + i * scaleTime;
        const screenY = originY - pt.theta * scaleTheta;
        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Curva ω(t)
      const scaleOmega = scaleTheta * 0.35;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const pt = this.history[i];
        const screenX = originX + i * scaleTime;
        const screenY = originY - pt.omega * scaleOmega;
        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const last = this.history[this.history.length - 1];
      const curX = originX + (this.history.length - 1) * scaleTime;
      const curY = originY - last.theta * scaleTheta;

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.font = '9px Outfit, sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('— θ(t) Ángulo', w - 130, 16);
    ctx.fillStyle = '#10b981';
    ctx.fillText('--- ω(t) Vel. Angular', w - 130, 28);
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLength = 6;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 3) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.fillText(label, toX + 4 * Math.cos(angle), toY + 4 * Math.sin(angle));
    }
  }
}
