/**
 * ============================================================================
 * GEOGEBRA-STYLE CARTESIAN PLANE ENGINE
 * Motor de Plano Cartesiano Interactivo Estilo GeoGebra
 * - Cuadrícula mayor y menor (papel milimetrado adaptativo)
 * - Reglas sobre los ejes con marcas graduadas (ticks) y números precisos
 * - Manejo de escalas automáticas y continuas
 * - Zoom in / Zoom out, Paneo (arrastre), Reset
 * - Re-escalado independiente de ejes arrastrando directamente sobre el eje X o Y
 * - Inspector de coordenadas (modo selección / cursor de punto)
 * - Paleta flotante de estilos gráficos (color, grosor, estilo de trazo, visibilidad)
 * ============================================================================
 */

class GeoGebraPlane {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Configuración base de vista y escalas (Pixels por unidad física)
    this.options = Object.assign({
      originXRatio: 0.15, // Posición inicial del eje Y respecto al ancho
      originYRatio: 0.5,  // Posición inicial del eje X respecto al alto
      scaleX: 80,         // Píxeles por segundo
      scaleY: 90,         // Píxeles por metro
      showMinorGrid: true,
      gridColorMinor: '#e2e8f0',
      gridColorMajor: '#94a3b8',
      axisColor: '#0f172a',
      font: '11px Fira Code, monospace',
      showCurves: { x: true, v: true, a: false },
      curveStyles: {
        x: { color: '#0284c7', width: 2.5, dash: [] },        // Elongación
        v: { color: '#10b981', width: 2.2, dash: [4, 4] },    // Velocidad
        a: { color: '#ef4444', width: 2.0, dash: [2, 2] }     // Aceleración
      }
    }, options);

    this.scaleX = this.options.scaleX;
    this.scaleY = this.options.scaleY;
    this.originX = 0;
    this.originY = 0;

    // Estado interactivo
    this.mode = 'pan'; // 'pan' | 'inspect'
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragAxis = null; // null | 'x' | 'y'
    this.mousePos = { x: 0, y: 0 };
    this.inspectPoint = null;

    // Parámetros físicos del M.A.S.
    this.masParams = {
      A: 1.0,        // Amplitud [m]
      omega: 2.0,    // Frecuencia angular [rad/s]
      phi: 0.0,      // Fase inicial [rad]
      currentTime: 0 // Tiempo actual de la simulación
    };

    this.initCanvasSize();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initCanvasSize();
        this.render();
      });
      this.resizeObserver.observe(this.canvas);
    }
    this.initEvents();
    this.render();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || this.canvas.clientWidth || 800;
    this.height = rect.height || this.canvas.clientHeight || 400;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    if (this.originX === 0 && this.originY === 0) {
      this.originX = this.width * this.options.originXRatio;
      this.originY = this.height * this.options.originYRatio;
    }
  }

  // Conversiones Coordenadas de Pantalla <-> Coordenadas Matemáticas
  toScreenX(mathX) {
    return this.originX + mathX * this.scaleX;
  }

  toScreenY(mathY) {
    return this.originY - mathY * this.scaleY;
  }

  toMathX(screenX) {
    return (screenX - this.originX) / this.scaleX;
  }

  toMathY(screenY) {
    return (this.originY - screenY) / this.scaleY;
  }

  // Cálculo inteligente de pasos de cuadrícula (1, 2, 5 * 10^k)
  calculateNiceStep(scale, targetPixelSpacing = 80) {
    const roughStep = targetPixelSpacing / scale;
    const exponent = Math.floor(Math.log10(roughStep));
    const fraction = roughStep / Math.pow(10, exponent);
    let niceFraction;

    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;

    return niceFraction * Math.pow(10, exponent);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Dibujar Papel Milimetrado (Cuadrícula Mayor y Menor)
    this.drawGrid();

    // 2. Dibujar Ejes Coordenados con Reglas y Ticks
    this.drawAxes();

    // 3. Dibujar Curvas Físicas del M.A.S. (x(t), v(t), a(t))
    this.drawMASCurves();

    // 4. Dibujar Línea Escáner del Tiempo Actual (sincronizado con el resorte)
    this.drawTimeTracker();

    // 5. Dibujar Cursor / Inspector de Coordenadas
    if (this.mode === 'inspect' && this.inspectPoint) {
      this.drawInspector();
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const stepX = this.calculateNiceStep(this.scaleX, 80);
    const stepY = this.calculateNiceStep(this.scaleY, 70);

    const minMathX = this.toMathX(0);
    const maxMathX = this.toMathX(this.width);
    const minMathY = this.toMathY(this.height);
    const maxMathY = this.toMathY(0);

    // Cuadrícula menor (estilo papel milimetrado: 5 divisiones intermedias)
    if (this.options.showMinorGrid) {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = this.options.gridColorMinor;
      const minorStepX = stepX / 5;
      const minorStepY = stepY / 5;

      const firstMinorX = Math.floor(minMathX / minorStepX) * minorStepX;
      for (let x = firstMinorX; x <= maxMathX; x += minorStepX) {
        const sx = this.toScreenX(x);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.height);
        ctx.stroke();
      }

      const firstMinorY = Math.floor(minMathY / minorStepY) * minorStepY;
      for (let y = firstMinorY; y <= maxMathY; y += minorStepY) {
        const sy = this.toScreenY(y);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(this.width, sy);
        ctx.stroke();
      }
    }

    // Cuadrícula mayor
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = this.options.gridColorMajor;

    const firstMajorX = Math.floor(minMathX / stepX) * stepX;
    for (let x = firstMajorX; x <= maxMathX; x += stepX) {
      const sx = this.toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.height);
      ctx.stroke();
    }

    const firstMajorY = Math.floor(minMathY / stepY) * stepY;
    for (let y = firstMajorY; y <= maxMathY; y += stepY) {
      const sy = this.toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.width, sy);
      ctx.stroke();
    }
  }

  drawAxes() {
    const ctx = this.ctx;
    const stepX = this.calculateNiceStep(this.scaleX, 80);
    const stepY = this.calculateNiceStep(this.scaleY, 70);

    const minMathX = this.toMathX(0);
    const maxMathX = this.toMathX(this.width);
    const minMathY = this.toMathY(this.height);
    const maxMathY = this.toMathY(0);

    ctx.strokeStyle = this.options.axisColor;
    ctx.fillStyle = this.options.axisColor;
    ctx.lineWidth = 1.8;
    ctx.font = this.options.font;

    // Eje X (Horizontal: Tiempo t [s])
    ctx.beginPath();
    ctx.moveTo(0, this.originY);
    ctx.lineTo(this.width, this.originY);
    ctx.stroke();

    // Flecha Eje X
    ctx.beginPath();
    ctx.moveTo(this.width - 10, this.originY - 5);
    ctx.lineTo(this.width, this.originY);
    ctx.lineTo(this.width - 10, this.originY + 5);
    ctx.fill();

    // Etiqueta Eje X
    ctx.textAlign = 'right';
    ctx.fillText('t [s]', this.width - 14, this.originY - 10);

    // Eje Y (Vertical: Amplitud / Magnitudes)
    ctx.beginPath();
    ctx.moveTo(this.originX, 0);
    ctx.lineTo(this.originX, this.height);
    ctx.stroke();

    // Flecha Eje Y
    ctx.beginPath();
    ctx.moveTo(this.originX - 5, 10);
    ctx.lineTo(this.originX, 0);
    ctx.lineTo(this.originX + 5, 10);
    ctx.fill();

    // Etiqueta Eje Y
    ctx.textAlign = 'left';
    ctx.fillText('x [m], v [m/s], a [m/s²]', this.originX + 10, 15);

    // Ticks y Marcas Numéricas en Eje X
    const firstMajorX = Math.floor(minMathX / stepX) * stepX;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = firstMajorX; x <= maxMathX; x += stepX) {
      if (Math.abs(x) < 1e-9) continue; // Cero se trata aparte
      const sx = this.toScreenX(x);

      // Marca mayor de la regla
      ctx.beginPath();
      ctx.moveTo(sx, this.originY - 5);
      ctx.lineTo(sx, this.originY + 5);
      ctx.stroke();

      // Número
      const numStr = Number(x.toFixed(4)).toString();
      ctx.fillText(numStr, sx, this.originY + 7);
    }

    // Ticks y Marcas Numéricas en Eje Y
    const firstMajorY = Math.floor(minMathY / stepY) * stepY;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = firstMajorY; y <= maxMathY; y += stepY) {
      if (Math.abs(y) < 1e-9) continue;
      const sy = this.toScreenY(y);

      // Marca mayor de la regla
      ctx.beginPath();
      ctx.moveTo(this.originX - 5, sy);
      ctx.lineTo(this.originX + 5, sy);
      ctx.stroke();

      // Número
      const numStr = Number(y.toFixed(4)).toString();
      ctx.fillText(numStr, this.originX - 8, sy);
    }

    // Número 0 en el origen
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('0', this.originX - 6, this.originY + 6);
  }

  drawMASCurves() {
    const { A, omega, phi } = this.masParams;
    const ctx = this.ctx;
    const stepPx = 1.5; // Resolución de muestreo en píxeles

    // 1. Elongación: x(t) = A * cos(omega * t + phi)
    if (this.options.showCurves.x) {
      const style = this.options.curveStyles.x;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width;
      ctx.setLineDash(style.dash);
      ctx.beginPath();

      let isFirst = true;
      for (let px = 0; px <= this.width; px += stepPx) {
        const t = this.toMathX(px);
        const xVal = A * Math.cos(omega * t + phi);
        const py = this.toScreenY(xVal);

        if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }

    // 2. Velocidad: v(t) = -A * omega * sin(omega * t + phi)
    if (this.options.showCurves.v) {
      const style = this.options.curveStyles.v;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width;
      ctx.setLineDash(style.dash);
      ctx.beginPath();

      let isFirst = true;
      for (let px = 0; px <= this.width; px += stepPx) {
        const t = this.toMathX(px);
        const vVal = -A * omega * Math.sin(omega * t + phi);
        const py = this.toScreenY(vVal);

        if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }

    // 3. Aceleración: a(t) = -A * omega^2 * cos(omega * t + phi)
    if (this.options.showCurves.a) {
      const style = this.options.curveStyles.a;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width;
      ctx.setLineDash(style.dash);
      ctx.beginPath();

      let isFirst = true;
      for (let px = 0; px <= this.width; px += stepPx) {
        const t = this.toMathX(px);
        const aVal = -A * (omega * omega) * Math.cos(omega * t + phi);
        const py = this.toScreenY(aVal);

        if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }

    ctx.setLineDash([]); // Reset dash
  }

  drawTimeTracker() {
    const t = this.masParams.currentTime;
    const sx = this.toScreenX(t);

    if (sx < 0 || sx > this.width) return;

    const ctx = this.ctx;
    const { A, omega, phi } = this.masParams;

    // Línea vertical que escanea el tiempo actual
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Puntos brillantes correspondientes al tiempo actual en cada curva
    if (this.options.showCurves.x) {
      const xVal = A * Math.cos(omega * t + phi);
      const sy = this.toScreenY(xVal);
      ctx.fillStyle = this.options.curveStyles.x.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (this.options.showCurves.v) {
      const vVal = -A * omega * Math.sin(omega * t + phi);
      const sy = this.toScreenY(vVal);
      ctx.fillStyle = this.options.curveStyles.v.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (this.options.showCurves.a) {
      const aVal = -A * (omega * omega) * Math.cos(omega * t + phi);
      const sy = this.toScreenY(aVal);
      ctx.fillStyle = this.options.curveStyles.a.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  drawInspector() {
    const ctx = this.ctx;
    const { screenX, screenY, mathX, mathY } = this.inspectPoint;

    // Líneas cruzadas de inspección
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, this.height);
    ctx.moveTo(0, screenY);
    ctx.lineTo(this.width, screenY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Punto objetivo
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Interacción de Eventos: Mouse, Touch, Zoom, Drag, Ejes
  initEvents() {
    const canvas = this.canvas;

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.initCanvasSize();
      this.render();
    });
    resizeObserver.observe(canvas);

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const mathXBefore = this.toMathX(mouseX);
      const mathYBefore = this.toMathY(mouseY);

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

      // Limites de zoom
      if (this.scaleX * zoomFactor > 10 && this.scaleX * zoomFactor < 2000) {
        this.scaleX *= zoomFactor;
        this.scaleY *= zoomFactor;

        this.originX = mouseX - mathXBefore * this.scaleX;
        this.originY = mouseY + mathYBefore * this.scaleY;
        this.render();
      }
    }, { passive: false });

    // Mouse Down
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.isDragging = true;
      this.dragStart = { x, y };

      // Detectar si se está arrastrando cerca de los ejes para re-escalamiento manual independiente
      const distToXAxis = Math.abs(y - this.originY);
      const distToYAxis = Math.abs(x - this.originX);

      if (distToXAxis < 12) {
        this.dragAxis = 'x';
        canvas.style.cursor = 'ew-resize';
      } else if (distToYAxis < 12) {
        this.dragAxis = 'y';
        canvas.style.cursor = 'ns-resize';
      } else {
        this.dragAxis = null;
        canvas.style.cursor = this.mode === 'inspect' ? 'crosshair' : 'grabbing';
      }
    });

    // Mouse Move
    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.mousePos = { x, y };

      if (!this.isDragging) {
        // Actualizar cursor según cercanía de los ejes
        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
          const distToXAxis = Math.abs(y - this.originY);
          const distToYAxis = Math.abs(x - this.originX);

          if (distToXAxis < 10) canvas.style.cursor = 'ew-resize';
          else if (distToYAxis < 10) canvas.style.cursor = 'ns-resize';
          else canvas.style.cursor = this.mode === 'inspect' ? 'crosshair' : 'grab';

          if (this.mode === 'inspect') {
            const mathX = this.toMathX(x);
            const mathY = this.toMathY(y);
            this.inspectPoint = { screenX: x, screenY: y, mathX, mathY };
            this.updateTooltip(e.clientX, e.clientY);
            this.render();
          }
        }
        return;
      }

      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;

      if (this.dragAxis === 'x') {
        // Re-escalamiento dinámico del eje X
        const factor = 1 + dx * 0.005;
        if (this.scaleX * factor > 10 && this.scaleX * factor < 2000) {
          this.scaleX *= factor;
        }
      } else if (this.dragAxis === 'y') {
        // Re-escalamiento dinámico del eje Y
        const factor = 1 - dy * 0.005;
        if (this.scaleY * factor > 10 && this.scaleY * factor < 2000) {
          this.scaleY *= factor;
        }
      } else {
        // Paneo general del lienzo
        this.originX += dx;
        this.originY += dy;
      }

      this.dragStart = { x, y };
      this.render();
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.dragAxis = null;
      canvas.style.cursor = this.mode === 'inspect' ? 'crosshair' : 'grab';
    });

    // Touch Support (Pinch to zoom and drag)
    let touchDist = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        this.isDragging = true;
        this.dragStart = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      } else if (e.touches.length === 2) {
        touchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length === 1 && this.isDragging) {
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        const dx = x - this.dragStart.x;
        const dy = y - this.dragStart.y;

        this.originX += dx;
        this.originY += dy;
        this.dragStart = { x, y };
        this.render();
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / (touchDist || currentDist);
        if (factor > 0.8 && factor < 1.2) {
          this.scaleX *= factor;
          this.scaleY *= factor;
          this.render();
        }
        touchDist = currentDist;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      touchDist = 0;
    });
  }

  updateTooltip(globalX, globalY) {
    const tooltip = document.getElementById('geoTooltip');
    if (!tooltip || !this.inspectPoint) return;

    const { mathX } = this.inspectPoint;
    const { A, omega, phi } = this.masParams;
    const xVal = A * Math.cos(omega * mathX + phi);
    const vVal = -A * omega * Math.sin(omega * mathX + phi);
    const aVal = -A * (omega * omega) * Math.cos(omega * mathX + phi);

    tooltip.style.display = 'block';
    tooltip.style.left = `${this.inspectPoint.screenX}px`;
    tooltip.style.top = `${this.inspectPoint.screenY}px`;
    tooltip.innerHTML = `
      <strong>t:</strong> ${mathX.toFixed(2)} s<br>
      <span style="color:${this.options.curveStyles.x.color}"><strong>x:</strong> ${xVal.toFixed(2)} m</span><br>
      <span style="color:${this.options.curveStyles.v.color}"><strong>v:</strong> ${vVal.toFixed(2)} m/s</span><br>
      <span style="color:${this.options.curveStyles.a.color}"><strong>a:</strong> ${aVal.toFixed(2)} m/s²</span>
    `;
  }

  // Métodos de Control para los Botones del Panel Flotante
  zoomIn() {
    this.scaleX *= 1.25;
    this.scaleY *= 1.25;
    this.render();
  }

  zoomOut() {
    this.scaleX *= 0.8;
    this.scaleY *= 0.8;
    this.render();
  }

  resetView() {
    this.scaleX = this.options.scaleX;
    this.scaleY = this.options.scaleY;
    this.originX = this.width * this.options.originXRatio;
    this.originY = this.height * this.options.originYRatio;
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    const tooltip = document.getElementById('geoTooltip');
    if (mode !== 'inspect' && tooltip) {
      tooltip.style.display = 'none';
      this.inspectPoint = null;
    }
    this.render();
  }

  updateMASParams(newParams) {
    Object.assign(this.masParams, newParams);
    this.render();
  }
}

window.GeoGebraPlane = GeoGebraPlane;
