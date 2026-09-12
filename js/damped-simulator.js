/**
 * ============================================================================
 * DAMPED & DRIVEN OSCILLATOR SIMULATOR & RESONANCE ENGINE
 * Motor de Simulación de Oscilador Amortiguado y Resonancia a 60 FPS
 * - Amortiguamiento viscoso: m d²x/dt² + b dx/dt + k x = F₀ cos(ω_d t)
 * - Regímenes: Subamortiguado, Críticamente Amortiguado, Sobreamortiguado
 * - Trazado en plano GeoGebra de la envolvente exponencial ±A e^(-γt)
 * - Curva universal de resonancia de amplitud A(ω_d) interactiva
 * ============================================================================
 */

class DampedSimulator {
  constructor(simCanvasId, geoCanvasId) {
    this.simCanvas = document.getElementById(simCanvasId);
    this.geoCanvas = document.getElementById(geoCanvasId);
    if (!this.simCanvas || !this.geoCanvas) return;

    this.simCtx = this.simCanvas.getContext('2d');
    this.geoCtx = this.geoCanvas.getContext('2d');

    // Parámetros físicos
    this.params = {
      m: 1.0,           // Masa [kg]
      k: 9.0,           // Constante elástica [N/m] (w0 = 3 rad/s)
      b: 0.6,           // Coeficiente de amortiguamiento viscoso [N·s/m]
      A0: 1.2,          // Amplitud inicial [m]
      x: 1.2,           // Posición instantánea [m]
      v: 0.0,           // Velocidad instantánea [m/s]
      time: 0.0,
      f0: 0.0,          // Amplitud de fuerza externa impulsora [N]
      omegaD: 3.0,      // Frecuencia impulsora [rad/s]
      regime: 'sub',    // 'sub' | 'crit' | 'over' | 'resonance'
      isPlaying: true,
      speedScale: 1.0
    };

    this.history = []; // { t, x, envPos, envNeg }
    this.maxHistory = 400;

    this.initCanvasSizes();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initCanvasSizes();
        this.render();
      });
      [this.simCanvas, this.geoCanvas].forEach(canvas => this.resizeObserver.observe(canvas));
    }
    this.recalculateDerived();
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
  }

  recalculateDerived() {
    this.omega0 = Math.sqrt(this.params.k / this.params.m);
    this.gamma = this.params.b / (2 * this.params.m); // factor de amortiguamiento γ = b / 2m
    this.bCrit = 2 * Math.sqrt(this.params.k * this.params.m); // b crítico = 2 sqrt(km)

    if (this.gamma < this.omega0) {
      this.omegaPrime = Math.sqrt(this.omega0 * this.omega0 - this.gamma * this.gamma);
    } else {
      this.omegaPrime = 0.0;
    }

    const elOmega0 = document.getElementById('dampValOmega0');
    const elGamma = document.getElementById('dampValGamma');
    const elRegime = document.getElementById('dampValRegime');

    if (elOmega0) elOmega0.textContent = `${this.omega0.toFixed(2)} rad/s`;
    if (elGamma) elGamma.textContent = `${this.gamma.toFixed(2)} s⁻¹`;

    if (elRegime) {
      if (this.params.regime === 'resonance') {
        elRegime.textContent = 'Forzado / Resonancia';
      } else if (this.gamma < this.omega0 * 0.98) {
        elRegime.textContent = 'Subamortiguado';
      } else if (Math.abs(this.gamma - this.omega0) <= this.omega0 * 0.05) {
        elRegime.textContent = 'Críticamente Amortiguado';
      } else {
        elRegime.textContent = 'Sobreamortiguado';
      }
    }
  }

  setRegime(regimeType) {
    this.params.regime = regimeType;
    if (regimeType === 'sub') {
      this.params.b = 0.6;
      this.params.f0 = 0.0;
    } else if (regimeType === 'crit') {
      this.params.b = 2 * Math.sqrt(this.params.k * this.params.m); // exact critical
      this.params.f0 = 0.0;
    } else if (regimeType === 'over') {
      this.params.b = 10.0;
      this.params.f0 = 0.0;
    } else if (regimeType === 'resonance') {
      this.params.b = 0.5;
      this.params.f0 = 3.5;
      this.params.omegaD = this.omega0;
    }
    this.reset();
  }

  setDampingB(bVal) {
    this.params.b = Math.max(0.05, bVal);
    this.recalculateDerived();
  }

  setK(kVal) {
    this.params.k = Math.max(1.0, kVal);
    this.recalculateDerived();
  }

  setOmegaD(wVal) {
    this.params.omegaD = Math.max(0.5, Math.min(8.0, wVal));
  }

  togglePlay() {
    this.params.isPlaying = !this.params.isPlaying;
    return this.params.isPlaying;
  }

  reset() {
    this.params.x = this.params.A0;
    this.params.v = 0.0;
    this.params.time = 0.0;
    this.history = [];
    this.recalculateDerived();
    this.render();
  }

  animate(currentTimestamp) {
    const dt = Math.min((currentTimestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = currentTimestamp;

    if (this.params.isPlaying) {
      const subSteps = 8;
      const subDt = (dt * this.params.speedScale) / subSteps;

      for (let i = 0; i < subSteps; i++) {
        // m a + b v + k x = F0 cos(w_d t)
        // a = (F0 cos(w_d t) - b v - k x) / m
        const drivingForce = this.params.f0 * Math.cos(this.params.omegaD * this.params.time);
        const restoringForce = -this.params.k * this.params.x;
        const dampingForce = -this.params.b * this.params.v;

        const a = (drivingForce + restoringForce + dampingForce) / this.params.m;

        this.params.v += a * subDt;
        this.params.x += this.params.v * subDt;
        this.params.time += subDt;
      }

      // Envolvente exponencial teórica
      const env = this.params.A0 * Math.exp(-this.gamma * this.params.time);

      this.history.push({
        t: this.params.time,
        x: this.params.x,
        envPos: env,
        envNeg: -env
      });

      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    this.renderSim();
    this.renderGeo();
  }

  renderSim() {
    const ctx = this.simCtx;
    const w = this.simWidth;
    const h = this.simHeight;

    ctx.clearRect(0, 0, w, h);

    // Fondo tenue
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    const wallX = 26;
    const groundY = h - 35;
    const massSize = 42;
    const eqX = w / 2;
    const pixelsPerMeter = 55;
    const massX = eqX + this.params.x * pixelsPerMeter;
    const massY = groundY - massSize;

    // Piso y Pared izquierda
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(wallX - 8, groundY, w - wallX + 8, 4);
    ctx.fillRect(wallX - 8, 20, 8, groundY - 20 + 4);

    // Línea de equilibrio (x=0) punteada
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(eqX + massSize / 2, 25);
    ctx.lineTo(eqX + massSize / 2, groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 1. Resorte helicoidal (parte superior)
    const springY = massY + 12;
    const springLen = massX - wallX;
    this.drawCoilSpring(ctx, wallX, springY, springLen, 12, 11, '#0284c7');

    // 2. Amortiguador viscoso (Dashpot en la parte inferior)
    const dashpotY = massY + 28;
    this.drawDashpot(ctx, wallX, dashpotY, massX, 10, '#64748b');

    // Bloque (Masa)
    const blockGrad = ctx.createLinearGradient(massX, massY, massX + massSize, massY + massSize);
    blockGrad.addColorStop(0, '#0ea5e9');
    blockGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = blockGrad;
    ctx.beginPath();
    ctx.roundRect(massX, massY, massSize, massSize, 6);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Texto de masa
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.params.m.toFixed(1)} kg`, massX + massSize / 2, massY + massSize / 2 + 3);
    ctx.textAlign = 'start';

    // Ruedas bajo el bloque
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(massX + 10, groundY - 2, 4, 0, Math.PI * 2);
    ctx.arc(massX + massSize - 10, groundY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Vector de fuerza restauradora o impulsora
    if (Math.abs(this.params.v) > 0.05) {
      const vLen = Math.max(-30, Math.min(30, this.params.v * 15));
      this.drawArrow(ctx, massX + massSize / 2, massY - 6, massX + massSize / 2 + vLen, massY - 6, '#10b981', 'v');
    }

    // Régimen actual
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`b = ${this.params.b.toFixed(2)} N·s/m | γ = ${this.gamma.toFixed(2)}`, 10, 16);
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

    ctx.font = '10px Fira Code, monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('t [s]', w - 28, originY + 12);
    ctx.fillText('x(t)', originX + 5, 14);

    if (this.history.length > 1) {
      const scaleTime = (w - originX - 25) / this.maxHistory;
      const visibleAmplitude = this.history.reduce((maximum, point) => Math.max(
        maximum,
        Math.abs(point.x),
        Math.abs(point.envPos),
        Math.abs(point.envNeg)
      ), this.params.A0 * 0.08);
      const scaleX = (h / 2 - 20) / Math.max(visibleAmplitude * 1.25, this.params.A0 * 0.08);

      // Envolventes exponenciales ±A e^(-γt) [Fucsia / Magenta punteada]
      if (this.params.regime !== 'resonance') {
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        // Envolvente superior
        ctx.beginPath();
        for (let i = 0; i < this.history.length; i++) {
          const pt = this.history[i];
          const screenX = originX + i * scaleTime;
          const screenY = originY - pt.envPos * scaleX;
          if (i === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();

        // Envolvente inferior
        ctx.beginPath();
        for (let i = 0; i < this.history.length; i++) {
          const pt = this.history[i];
          const screenX = originX + i * scaleTime;
          const screenY = originY - pt.envNeg * scaleX;
          if (i === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Curva real x(t)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const pt = this.history[i];
        const screenX = originX + i * scaleTime;
        const screenY = originY - pt.x * scaleX;
        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Punto actual
      const last = this.history[this.history.length - 1];
      const curX = originX + (this.history.length - 1) * scaleTime;
      const curY = originY - last.x * scaleX;

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
    ctx.fillText('— x(t) Posición', w - 120, 16);
    ctx.fillStyle = '#d946ef';
    ctx.fillText('--- ±A e^(-γt) Envolvente', w - 120, 28);
  }

  drawCoilSpring(ctx, startX, y, length, amplitude, coils, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(startX, y);

    const leadIn = 10;
    const leadOut = 10;
    const activeLength = Math.max(10, length - leadIn - leadOut);

    ctx.lineTo(startX + leadIn, y);

    const step = activeLength / (coils * 2);
    for (let i = 0; i < coils * 2; i++) {
      const cx = startX + leadIn + (i + 0.5) * step;
      const cy = y + (i % 2 === 0 ? -amplitude : amplitude);
      ctx.lineTo(cx, cy);
    }

    ctx.lineTo(startX + length - leadOut, y);
    ctx.lineTo(startX + length, y);
    ctx.stroke();
  }

  drawDashpot(ctx, startX, y, massX, height, color) {
    const cylLen = 45;
    const cylStartX = startX + 12;

    // Tubo del cilindro
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cylStartX + cylLen, y - height);
    ctx.lineTo(cylStartX, y - height);
    ctx.lineTo(cylStartX, y + height);
    ctx.lineTo(cylStartX + cylLen, y + height);
    ctx.stroke();

    // Fluido viscoso tenue
    ctx.fillStyle = 'rgba(100, 116, 139, 0.18)';
    ctx.fillRect(cylStartX, y - height + 1, cylLen - 6, height * 2 - 2);

    // Émbolo y vástago
    const pistonX = Math.max(cylStartX + 4, Math.min(cylStartX + cylLen - 4, cylStartX + (massX - startX) * 0.28));
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pistonX, y - height + 2);
    ctx.lineTo(pistonX, y + height - 2);
    ctx.stroke();

    // Vástago hacia la masa
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pistonX, y);
    ctx.lineTo(massX, y);
    ctx.stroke();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLength = 5;
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
      ctx.font = 'bold 8px Outfit, sans-serif';
      ctx.fillText(label, toX + 3 * Math.cos(angle), toY + 3 * Math.sin(angle));
    }
  }
}
