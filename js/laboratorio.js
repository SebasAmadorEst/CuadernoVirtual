document.addEventListener('DOMContentLoaded', () => {
  const initial = { amplitude: 1.2, omega: 2, phase: 0 };
  const bounds = {
    amplitude: [0.1, 3],
    omega: [0.5, 8],
    phase: [-3.14, 3.14]
  };
  const plane = new GeoGebraPlane('geoCanvas', {
    originXRatio: 0.1,
    originYRatio: 0.5,
    scaleX: 72,
    scaleY: 42,
    gridColorMinor: '#e9efeb',
    gridColorMajor: '#d1dbd5',
    axisColor: '#42575b',
    font: '10px DM Mono, monospace',
    showCurves: { x: true, v: true, a: true },
    curveStyles: {
      x: { color: '#1677a8', width: 2.5, dash: [] },
      v: { color: '#168b68', width: 2.5, dash: [7, 4] },
      a: { color: '#d45743', width: 2, dash: [2, 3] }
    }
  });
  const simulator = new MASSimulator('masCanvas', plane);
  simulator.params.isPlaying = true;

  let model = { ...initial };
  const relationViews = {
    velocity: { zoom: 1, centerX: 0, centerY: 0, pointer: null, dragging: null },
    acceleration: { zoom: 1, centerX: 0, centerY: 0, pointer: null, dragging: null }
  };
  const byId = id => document.getElementById(id);
  const clamp = (value, [minimum, maximum]) => Math.min(maximum, Math.max(minimum, value));
  const format = (value, digits = 2) => Number(value).toFixed(digits);
  const radiansToPlanePhase = phase => phase - Math.PI / 2;

  function setOmega(value) {
    model.omega = clamp(value, bounds.omega);
    syncFields('omega');
    syncFields('frequency');
    syncFields('period');
    updateModel();
  }

  function syncFields(name) {
    const value = name === 'frequency' ? model.omega / (2 * Math.PI)
      : name === 'period' ? (2 * Math.PI) / model.omega
        : model[name];
    const formatted = name === 'frequency' ? value.toFixed(4) : value.toFixed(2);
    const key = name === 'amplitude' ? 'amplitude' : name;
    const range = byId(`${key}Range`);
    const number = byId(`${key}Number`);
    if (range) range.value = String(value);
    if (number) number.value = formatted;
  }

  function updateModel() {
    const phaseForCosine = radiansToPlanePhase(model.phase);
    simulator.setAmplitude(model.amplitude);
    simulator.setK(model.omega * model.omega);
    simulator.setPhase(phaseForCosine);
    plane.options.showCurves.x = byId('showX').checked;
    plane.options.showCurves.v = byId('showV').checked;
    plane.options.showCurves.a = byId('showA').checked;
    plane.render();
    updateReadouts();
    drawRelationGraphs();
  }

  function updateReadouts() {
    const { A } = { A: model.amplitude };
    const omega = model.omega;
    const alpha = model.phase;
    const time = simulator.params.time;
    const argument = omega * time + alpha;
    const x = A * Math.sin(argument);
    const velocity = A * omega * Math.cos(argument);
    const acceleration = -A * omega * omega * Math.sin(argument);
    const kinetic = 0.5 * velocity * velocity;
    const potential = 0.5 * omega * omega * x * x;
    const total = 0.5 * omega * omega * A * A;

    byId('readoutOmega').innerHTML = `${format(omega)} <small>rad/s</small>`;
    byId('currentX').textContent = `${format(x)} m`;
    byId('currentV').textContent = `${format(velocity)} m/s`;
    byId('currentA').textContent = `${format(acceleration)} m/s²`;
    byId('currentTime').textContent = `${format(time)} s`;
    byId('maxVelocity').innerHTML = `${format(A * omega)} <small>m/s</small>`;
    byId('maxAcceleration').innerHTML = `${format(A * omega * omega)} <small>m/s²</small>`;
    byId('totalEnergy').innerHTML = `${format(total)} <small>J</small>`;
    byId('kineticEnergyFill').style.width = `${total ? 100 * kinetic / total : 0}%`;
    byId('potentialEnergyFill').style.width = `${total ? 100 * potential / total : 0}%`;
  }

  function drawRelationGraphs() {
    drawRelation(byId('velocityPositionCanvas'), 'velocity');
    drawRelation(byId('accelerationPositionCanvas'), 'acceleration');
  }

  function drawRelation(canvas, type) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const width = rect.width;
    const height = rect.height;
    const margin = { left: 43, right: 14, top: 12, bottom: 27 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const A = model.amplitude;
    const omega = model.omega;
    const view = relationViews[type];
    const xRadius = A * 1.15 / view.zoom;
    const yRadius = (type === 'velocity' ? A * omega * 1.18 : A * omega * omega * 1.18) / view.zoom;
    const minX = view.centerX - xRadius;
    const maxX = view.centerX + xRadius;
    const minY = view.centerY - yRadius;
    const maxY = view.centerY + yRadius;
    const xPixel = x => margin.left + (x - minX) / (maxX - minX) * plotWidth;
    const yPixel = y => margin.top + (maxY - y) / (maxY - minY) * plotHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '9px DM Mono, monospace';
    ctx.lineWidth = 1;
    for (let index = 0; index <= 4; index += 1) {
      const px = margin.left + plotWidth * index / 4;
      const py = margin.top + plotHeight * index / 4;
      const xValue = minX + (maxX - minX) * index / 4;
      const yValue = maxY - (maxY - minY) * index / 4;
      ctx.strokeStyle = '#edf1ee';
      ctx.beginPath(); ctx.moveTo(px, margin.top); ctx.lineTo(px, margin.top + plotHeight); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(margin.left, py); ctx.lineTo(margin.left + plotWidth, py); ctx.stroke();
      ctx.fillStyle = '#75837e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(format(xValue, 1), px, margin.top + plotHeight + 5);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(format(yValue, 1), margin.left - 5, py);
    }
    ctx.strokeStyle = '#82918b';
    ctx.lineWidth = 1.2;
    if (minY <= 0 && maxY >= 0) {
      ctx.beginPath(); ctx.moveTo(margin.left, yPixel(0)); ctx.lineTo(margin.left + plotWidth, yPixel(0)); ctx.stroke();
    }
    if (minX <= 0 && maxX >= 0) {
      ctx.beginPath(); ctx.moveTo(xPixel(0), margin.top); ctx.lineTo(xPixel(0), margin.top + plotHeight); ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(type === 'velocity' ? 'v' : 'a', 6, margin.top + 4);
    ctx.textAlign = 'right';
    ctx.fillText('x [m]', width - 7, height - 10);

    ctx.save();
    ctx.beginPath();
    ctx.rect(margin.left, margin.top, plotWidth, plotHeight);
    ctx.clip();
    if (type === 'velocity') {
      drawCurve(ctx, -A, A, 280, x => omega * Math.sqrt(Math.max(0, A * A - x * x)), '#168b68', xPixel, yPixel);
      drawCurve(ctx, -A, A, 280, x => -omega * Math.sqrt(Math.max(0, A * A - x * x)), '#168b68', xPixel, yPixel, [6, 4]);
    } else {
      drawCurve(ctx, minX, maxX, 160, x => -omega * omega * x, '#d45743', xPixel, yPixel);
    }
    if (view.pointer) {
      const { x, y } = view.pointer;
      const mathX = minX + (x - margin.left) / plotWidth * (maxX - minX);
      const mathY = maxY - (y - margin.top) / plotHeight * (maxY - minY);
      const value = type === 'velocity'
        ? (mathY >= 0 ? 1 : -1) * omega * Math.sqrt(Math.max(0, A * A - mathX * mathX))
        : -omega * omega * mathX;
      ctx.strokeStyle = 'rgba(23, 45, 51, .38)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, margin.top + plotHeight); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(margin.left + plotWidth, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = type === 'velocity' ? '#168b68' : '#d45743';
      ctx.beginPath(); ctx.arc(xPixel(mathX), yPixel(value), 4, 0, Math.PI * 2); ctx.fill();
      byId(`${type}PositionReadout`).textContent = `x: ${format(mathX)} m · ${type === 'velocity' ? 'v' : 'a'}: ${format(value)} ${type === 'velocity' ? 'm/s' : 'm/s²'}`;
    }
    ctx.restore();
  }

  function relationCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function relationRanges(type, view, canvas) {
    const A = model.amplitude;
    const baseX = A * 1.15 / view.zoom;
    const baseY = (type === 'velocity' ? A * model.omega * 1.18 : A * model.omega * model.omega * 1.18) / view.zoom;
    const margin = { left: 43, right: 14, top: 12, bottom: 27 };
    return { x: baseX, y: baseY, plotWidth: canvas.clientWidth - margin.left - margin.right, plotHeight: canvas.clientHeight - margin.top - margin.bottom, margin };
  }

  function changeRelationZoom(type, canvas, factor, point) {
    const view = relationViews[type];
    const before = relationRanges(type, view, canvas);
    const xRatio = (point.x - before.margin.left) / before.plotWidth - 0.5;
    const yRatio = 0.5 - (point.y - before.margin.top) / before.plotHeight;
    const anchorX = view.centerX + xRatio * 2 * before.x;
    const anchorY = view.centerY + yRatio * 2 * before.y;
    view.zoom = clamp(view.zoom * factor, [0.35, 12]);
    const after = relationRanges(type, view, canvas);
    view.centerX = anchorX - xRatio * 2 * after.x;
    view.centerY = anchorY - yRatio * 2 * after.y;
    drawRelation(canvas, type);
  }

  function setupRelationInteraction(type) {
    const canvas = byId(`${type}PositionCanvas`);
    const view = relationViews[type];
    const readout = byId(`${type}PositionReadout`);
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      canvas.setPointerCapture(event.pointerId);
      view.dragging = { pointerId: event.pointerId, ...relationCoordinates(canvas, event) };
      view.pointer = relationCoordinates(canvas, event);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', event => {
      const point = relationCoordinates(canvas, event);
      if (view.dragging && view.dragging.pointerId === event.pointerId) {
        const deltaX = point.x - view.dragging.x;
        const deltaY = point.y - view.dragging.y;
        const ranges = relationRanges(type, view, canvas);
        view.centerX -= deltaX * 2 * ranges.x / ranges.plotWidth;
        view.centerY += deltaY * 2 * ranges.y / ranges.plotHeight;
        view.dragging = { pointerId: event.pointerId, ...point };
      }
      view.pointer = point;
      drawRelation(canvas, type);
    });
    const stopDragging = event => {
      if (!view.dragging || view.dragging.pointerId !== event.pointerId) return;
      view.dragging = null;
      canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);
    canvas.addEventListener('pointerleave', () => {
      if (!view.dragging) {
        view.pointer = null;
        readout.textContent = 'Mueve el cursor para inspeccionar';
        drawRelation(canvas, type);
      }
    });
    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      changeRelationZoom(type, canvas, event.deltaY < 0 ? 1.2 : 1 / 1.2, relationCoordinates(canvas, event));
    }, { passive: false });
    byId(`${type}ZoomIn`).addEventListener('click', () => changeRelationZoom(type, canvas, 1.25, { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }));
    byId(`${type}ZoomOut`).addEventListener('click', () => changeRelationZoom(type, canvas, 0.8, { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }));
    byId(`${type}Reset`).addEventListener('click', () => {
      view.zoom = 1;
      view.centerX = 0;
      view.centerY = 0;
      view.pointer = null;
      readout.textContent = 'Mueve el cursor para inspeccionar';
      drawRelation(canvas, type);
    });
  }

  function drawCurve(ctx, start, end, samples, equation, color, xPixel, yPixel, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dash);
    for (let index = 0; index <= samples; index += 1) {
      const x = start + (end - start) * index / samples;
      const y = equation(x);
      if (index === 0) ctx.moveTo(xPixel(x), yPixel(y));
      else ctx.lineTo(xPixel(x), yPixel(y));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ['amplitude', 'phase'].forEach(name => {
    const range = byId(`${name}Range`);
    const number = byId(`${name}Number`);
    const commit = raw => {
      const value = Number(raw);
      if (!Number.isFinite(value)) return;
      model[name] = clamp(value, bounds[name]);
      syncFields(name);
      updateModel();
    };
    range.addEventListener('input', event => commit(event.target.value));
    number.addEventListener('change', event => commit(event.target.value));
  });

  const omegaFromControls = {
    omega: value => value,
    frequency: value => value * 2 * Math.PI,
    period: value => (2 * Math.PI) / value
  };
  Object.entries(omegaFromControls).forEach(([name, toOmega]) => {
    const range = byId(`${name}Range`);
    const number = byId(`${name}Number`);
    const commit = raw => {
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) return;
      setOmega(toOmega(value));
    };
    range.addEventListener('input', event => commit(event.target.value));
    number.addEventListener('change', event => commit(event.target.value));
  });

  const linePatterns = { solid: [], dashed: [7, 4], dotted: [2, 3] };
  const curveControls = [
    { key: 'x', visible: 'showX', color: 'colorX', width: 'widthX', opacity: 'opacityX', dash: 'dashX' },
    { key: 'v', visible: 'showV', color: 'colorV', width: 'widthV', opacity: 'opacityV', dash: 'dashV' },
    { key: 'a', visible: 'showA', color: 'colorA', width: 'widthA', opacity: 'opacityA', dash: 'dashA' }
  ];
  function applyCurveStyles() {
    curveControls.forEach(control => {
      const color = byId(control.color).value;
      const opacity = Number(byId(control.opacity).value);
      const channels = color.match(/[\da-f]{2}/gi).map(channel => parseInt(channel, 16));
      plane.options.curveStyles[control.key] = {
        color: `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${opacity})`,
        width: Number(byId(control.width).value),
        dash: linePatterns[byId(control.dash).value]
      };
      plane.options.showCurves[control.key] = byId(control.visible).checked;
    });
    plane.render();
  }
  curveControls.forEach(control => {
    [control.visible, control.color, control.width, control.opacity, control.dash].forEach(id => {
      byId(id).addEventListener('input', applyCurveStyles);
      byId(id).addEventListener('change', applyCurveStyles);
    });
  });

  ['x', 'v', 'a'].forEach(key => {
    const color = byId(`vectorColor${key.toUpperCase()}`);
    const width = byId(`vectorWidth${key.toUpperCase()}`);
    const opacity = byId(`vectorOpacity${key.toUpperCase()}`);
    const dash = byId(`vectorDash${key.toUpperCase()}`);
    const updateVectorStyle = () => {
      const channels = color.value.match(/[\da-f]{2}/gi).map(channel => parseInt(channel, 16));
      simulator.params.vectorStyles[key] = {
        color: `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`,
        width: Number(width.value),
        opacity: Number(opacity.value),
        dash: linePatterns[dash.value]
      };
    };
    [color, width, opacity, dash].forEach(input => {
      input.addEventListener('input', updateVectorStyle);
      input.addEventListener('change', updateVectorStyle);
    });
  });

  byId('toolZoomIn').addEventListener('click', () => plane.zoomIn());
  byId('toolZoomOut').addEventListener('click', () => plane.zoomOut());
  byId('toolReset').addEventListener('click', () => plane.resetView());
  byId('toolPan').addEventListener('click', () => {
    plane.setMode('pan');
    byId('toolPan').classList.add('active');
    byId('toolInspect').classList.remove('active');
  });
  byId('toolInspect').addEventListener('click', () => {
    plane.setMode('inspect');
    byId('toolInspect').classList.add('active');
    byId('toolPan').classList.remove('active');
  });
  byId('toolPalette').addEventListener('click', () => byId('paletteModal').classList.toggle('open'));
  byId('closePalette').addEventListener('click', () => byId('paletteModal').classList.remove('open'));
  byId('playToggle').addEventListener('click', event => {
    const playing = simulator.togglePlay();
    event.currentTarget.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    event.currentTarget.setAttribute('aria-label', playing ? 'Pausar simulación' : 'Reanudar simulación');
    event.currentTarget.title = playing ? 'Pausar simulación' : 'Reanudar simulación';
  });
  byId('resetTime').addEventListener('click', () => simulator.reset());
  byId('resetParameters').addEventListener('click', () => {
    model = { ...initial };
    syncFields('amplitude');
    syncFields('phase');
    setOmega(initial.omega);
    simulator.reset();
    updateModel();
  });

  window.addEventListener('resize', drawRelationGraphs);
  setupRelationInteraction('velocity');
  setupRelationInteraction('acceleration');
  window.setInterval(updateReadouts, 80);
  syncFields('amplitude');
  syncFields('phase');
  setOmega(initial.omega);
  applyCurveStyles();
  updateModel();
});