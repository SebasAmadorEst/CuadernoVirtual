/**
 * ============================================================================
 * MAS PHYSICAL SIMULATOR & VECTOR ENGINE
 * Simulador Físico en Vivo a 60 FPS con Vectores Cinemáticos y Energías
 * - Sistema Masa-Resorte Horizontal / Vertical
 * - Resorte dinámico helicoidal realista
 * - Vectores de desplazamiento (x), velocidad (v) y aceleración (a)
 * - Barras de conservación de energía mecánica (Ec, Ep, Em)
 * - Sincronización continua con el plano cartesiano GeoGebra
 * ============================================================================
 */

class MASSimulator {
  constructor(canvasId, geoPlaneInstance) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.geoPlane = geoPlaneInstance;

    // Parámetros físicos del sistema
    this.params = {
      m: 1.0,        // Masa [kg]
      k: 4.0,        // Constante elástica [N/m]
      A: 1.2,        // Amplitud [m]
      phi: 0.0,      // Fase inicial [rad]
      time: 0.0,     // Tiempo acumulado [s]
      speedScale: 1.0, // Factor de velocidad de simulación
      isPlaying: true
    };

    // Parámetros derivados
    this.recalculatePhysics();

    this.initCanvasSize();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initCanvasSize();
        this.render();
      });
      this.resizeObserver.observe(this.canvas);
    }
    this.lastTimestamp = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || this.canvas.clientWidth || 800;
    this.height = rect.height || this.canvas.clientHeight || 200;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  recalculatePhysics() {
    this.omega = Math.sqrt(this.params.k / this.params.m); // w = sqrt(k/m)
    this.period = (2 * Math.PI) / this.omega;             // T = 2pi / w
    this.frequency = 1 / this.period;                     // f = 1 / T
    this.vMax = this.params.A * this.omega;               // v_max = A * w
    this.aMax = this.params.A * (this.omega * this.omega); // a_max = A * w^2
    this.totalEnergy = 0.5 * this.params.k * (this.params.A * this.params.A); // E_T = 1/2 k A^2

    // Actualizar datos en pantalla si existen los elementos
    this.updateInfoCards();

    // Sincronizar parámetros con el plano GeoGebra
    if (this.geoPlane) {
      this.geoPlane.updateMASParams({
        A: this.params.A,
        omega: this.omega,
        phi: this.params.phi
      });
    }
  }

  updateInfoCards() {
    const elOmega = document.getElementById('valOmega');
    const elT = document.getElementById('valPeriod');
    const elF = document.getElementById('valFreq');
    const elVmax = document.getElementById('valVmax');
    const elAmax = document.getElementById('valAmax');

    if (elOmega) elOmega.textContent = `${this.omega.toFixed(2)} rad/s`;
    if (elT) elT.textContent = `${this.period.toFixed(2)} s`;
    if (elF) elF.textContent = `${this.frequency.toFixed(2)} Hz`;
    if (elVmax) elVmax.textContent = `${this.vMax.toFixed(2)} m/s`;
    if (elAmax) elAmax.textContent = `${this.aMax.toFixed(2)} m/s²`;
  }

  animate(currentTimestamp) {
    const dt = (currentTimestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = currentTimestamp;

    if (this.params.isPlaying) {
      this.params.time += dt * this.params.speedScale;

      // Mantener el tiempo dentro de una ventana cíclica razonable o continuo
      if (this.geoPlane) {
        this.geoPlane.masParams.currentTime = this.params.time;
        this.geoPlane.render();
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const { A, phi, time, m, k } = this.params;
    const omega = this.omega;

    // Cinemática actual
    const x = A * Math.cos(omega * time + phi);
    const v = -A * omega * Math.sin(omega * time + phi);
    const a = -A * (omega * omega) * Math.cos(omega * time + phi);

    // Energías actuales
    const kinetic = 0.5 * m * (v * v);
    const potential = 0.5 * k * (x * x);
    const total = this.totalEnergy;

    this.updateEnergyBars(kinetic, potential, total);

    // Configuración visual del simulador
    const centerY = this.height / 2 + 10;
    const wallX = 60;
    const equilibriumX = this.width / 2;
    const pixelsPerMeter = 100; // Escala visual del desplazamiento
    const massWidth = 55;
    const massHeight = 55;

    const massX = equilibriumX + x * pixelsPerMeter;

    // 1. Dibujar Pared Fija con Rayado de Apoyo
    ctx.fillStyle = '#64748b';
    ctx.fillRect(wallX - 16, centerY - 60, 16, 120);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let py = centerY - 55; py <= centerY + 55; py += 12) {
      ctx.beginPath();
      ctx.moveTo(wallX - 16, py);
      ctx.lineTo(wallX - 26, py + 10);
      ctx.stroke();
    }

    // 2. Línea Guía de Suelo Pulido
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wallX - 16, centerY + massHeight / 2);
    ctx.lineTo(this.width - 20, centerY + massHeight / 2);
    ctx.stroke();

    // 3. Línea de Equilibrio x = 0 (Referencia)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(equilibriumX, centerY - 60);
    ctx.lineTo(equilibriumX, centerY + 60);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '11px Outfit, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('x = 0 (Equilibrio)', equilibriumX, centerY - 68);

    // 4. Dibujar Resorte Helicoidal Paramétrico
    this.drawSpring(ctx, wallX, centerY, massX - massWidth / 2, centerY);

    // 5. Dibujar Bloque de Masa m
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const grad = ctx.createLinearGradient(
      massX - massWidth / 2, centerY - massHeight / 2,
      massX + massWidth / 2, centerY + massHeight / 2
    );
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#0369a1');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 2;

    const rx = massX - massWidth / 2;
    const ry = centerY - massHeight / 2;
    ctx.beginPath();
    ctx.roundRect(rx, ry, massWidth, massHeight, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Texto de la masa
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`m=${m}kg`, massX, centerY);

    // 6. Dibujar Vectores Cinemáticos Dinámicos
    // Vector Elongación x (Cian / Azul desde equilibrio hasta la masa)
    this.drawVector(
      ctx, equilibriumX, centerY + 38,
      massX, centerY + 38,
      '#0284c7', `x = ${x.toFixed(2)} m`
    );

    // Vector Velocidad v (Verde desde la masa en dirección del movimiento)
    const vScale = 25;
    if (Math.abs(v) > 0.02) {
      this.drawVector(
        ctx, massX, centerY - 38,
        massX + v * vScale, centerY - 38,
        '#10b981', `v = ${v.toFixed(2)} m/s`
      );
    }

    // Vector Aceleración a (Rojo opuesto al desplazamiento)
    const aScale = 12;
    if (Math.abs(a) > 0.05) {
      this.drawVector(
        ctx, massX, centerY - 54,
        massX + a * aScale, centerY - 54,
        '#ef4444', `a = ${a.toFixed(2)} m/s²`
      );
    }
  }

  drawSpring(ctx, x1, y1, x2, y2) {
    const coils = 16;
    const springLength = x2 - x1;
    const coilWidth = springLength / coils;
    const amplitude = 18;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Tramo recto inicial
    ctx.lineTo(x1 + 10, y1);

    for (let i = 0; i < coils; i++) {
      const startX = x1 + 10 + i * (springLength - 20) / coils;
      const midX = startX + (springLength - 20) / (coils * 2);
      const endX = startX + (springLength - 20) / coils;
      const dir = (i % 2 === 0) ? -1 : 1;

      ctx.lineTo(midX, y1 + dir * amplitude);
      ctx.lineTo(endX, y1);
    }

    // Tramo recto final hasta el bloque
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  drawVector(ctx, x1, y1, x2, y2, color, label) {
    const dx = x2 - x1;
    if (Math.abs(dx) < 4) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.2;

    // Cuerpo de la flecha
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Cabeza de la flecha
    const headLength = 8;
    const dir = dx > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - dir * headLength, y2 - 4);
    ctx.lineTo(x2 - dir * headLength, y2 + 4);
    ctx.closePath();
    ctx.fill();

    // Etiqueta
    ctx.font = 'bold 11px Fira Code, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, (x1 + x2) / 2, y1 - 6);
  }

  updateEnergyBars(kinetic, potential, total) {
    const elKinetic = document.getElementById('barKinetic');
    const elPotential = document.getElementById('barPotential');
    const elTotal = document.getElementById('barTotal');

    const txtKinetic = document.getElementById('txtKinetic');
    const txtPotential = document.getElementById('txtPotential');
    const txtTotal = document.getElementById('txtTotal');

    if (!elKinetic || !elPotential || !elTotal || total <= 0) return;

    const pctK = Math.min(100, Math.max(0, (kinetic / total) * 100));
    const pctP = Math.min(100, Math.max(0, (potential / total) * 100));

    elKinetic.style.width = `${pctK}%`;
    elPotential.style.width = `${pctP}%`;
    elTotal.style.width = '100%';

    if (txtKinetic) txtKinetic.textContent = `${kinetic.toFixed(2)} J`;
    if (txtPotential) txtPotential.textContent = `${potential.toFixed(2)} J`;
    if (txtTotal) txtTotal.textContent = `${total.toFixed(2)} J`;
  }

  // Métodos de Control
  togglePlay() {
    this.params.isPlaying = !this.params.isPlaying;
    return this.params.isPlaying;
  }

  reset() {
    this.params.time = 0.0;
    if (this.geoPlane) {
      this.geoPlane.masParams.currentTime = 0.0;
      this.geoPlane.render();
    }
    this.render();
  }

  setAmplitude(val) {
    this.params.A = parseFloat(val);
    this.recalculatePhysics();
  }

  setMass(val) {
    this.params.m = parseFloat(val);
    this.recalculatePhysics();
  }

  setK(val) {
    this.params.k = parseFloat(val);
    this.recalculatePhysics();
  }

  setPhase(val) {
    this.params.phi = parseFloat(val);
    this.recalculatePhysics();
  }

  setSpeed(val) {
    this.params.speedScale = parseFloat(val);
  }
}

window.MASSimulator = MASSimulator;
