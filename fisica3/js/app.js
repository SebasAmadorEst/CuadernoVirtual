/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER
 * Controlador Principal del Cuaderno Interactivo Virtual
 * - Gestión de Páginas Secuenciales (1 a 18, 9 pliegos)
 * - Navegación por botones, selector desplegable, teclado y gestos táctiles
 * - Vinculación del simulador M.A.S. con el plano cartesiano estilo GeoGebra
 * - Simulador de Péndulo Simple (págs. 10-11) y Oscilador Amortiguado (págs. 14-15)
 * - Paleta interactiva de estilos gráficos y herramientas
 * - Buscador en vivo del glosario y mapa mental interactivo
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const mathEngine = new MathEngine();
  const geoPlane = new GeoGebraPlane('geoCanvas', {
    originXRatio: 0.12,
    originYRatio: 0.5,
    scaleX: 85,
    scaleY: 80
  });

  // Instanciar Simulador Físico M.A.S. (Página 6)
  const masSimulator = new MASSimulator('simCanvas', geoPlane);

  // Instanciar Simulador de Péndulo Simple (Páginas 10 & 11)
  const pendulumSimulator = new PendulumSimulator('pendSimCanvas', 'pendGeoCanvas', 'pendPhaseCanvas');

  // Instanciar Simulador Amortiguado (Páginas 14 & 15)
  const dampedSimulator = new DampedSimulator('dampSimCanvas', 'dampGeoCanvas');

  // 2. Control de Paginación del Cuaderno Virtual
  const notebookStage = document.getElementById('notebookStage');
  const pageCover = document.getElementById('page-cover');
  const contentPages = [
    ...document.querySelectorAll('.notebook-page:not(.page-cover)')
  ];
  const allPages = [pageCover, ...contentPages].filter(Boolean);

  contentPages.forEach(page => {
    const contentWrapper = page.querySelector('.page-content-wrapper');
    if (contentWrapper) {
      contentWrapper.addEventListener('wheel', event => {
        const maximumScroll = contentWrapper.scrollHeight - contentWrapper.clientHeight;
        if (maximumScroll <= 0) return;
        contentWrapper.scrollTop = Math.max(0, Math.min(maximumScroll, contentWrapper.scrollTop + event.deltaY));
        event.preventDefault();
      }, { passive: false });
    }

    page.addEventListener('wheel', event => {
      if (event.target.closest('.page-content-wrapper')) return;
      const maximumScroll = page.scrollHeight - page.clientHeight;
      if (maximumScroll <= 0) return;

      page.scrollTop = Math.max(
        0,
        Math.min(maximumScroll, page.scrollTop + event.deltaY)
      );
      event.preventDefault();
    }, { passive: false });
  });

  const pageSelector = document.getElementById('pageSelector');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnHome = document.getElementById('btnHome');
  const btnEnd = document.getElementById('btnEnd');
  const btnOpenNotebook = document.getElementById('btnOpenNotebook');

  // Estado:
  // currentPage: 0 = Portada, 1..18 = Páginas de contenido
  // currentSpread: 0 = Portada (Cerrado), 1..9 = Pliegos de contenido
  let currentPage = 0;
  let currentSpread = 0;
  const TOTAL_CONTENT_PAGES = contentPages.length;
  const TOTAL_SPREADS = Math.ceil(TOTAL_CONTENT_PAGES / 2);

  function isTwoPageMode() {
    return window.innerWidth >= 1024;
  }

  function updatePageSelectorOptions() {
    if (!pageSelector) return;
    const isTwoPage = isTwoPageMode();
    pageSelector.innerHTML = '';

    if (isTwoPage) {
      const options = [{ value: '0', text: 'Portada Oficial (Cerrado)' }];
      for (let spread = 1; spread <= TOTAL_SPREADS; spread += 1) {
        const first = (spread * 2) - 1;
        const last = Math.min(spread * 2, TOTAL_CONTENT_PAGES);
        options.push({ value: String(spread), text: `Págs. ${first}-${last}: Cuaderno de Física` });
      }
      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.text;
        pageSelector.appendChild(el);
      });
      pageSelector.value = currentSpread.toString();
    } else {
      const options = [{ value: '0', text: 'Portada Oficial (Cubierta)' }];
      for (let page = 1; page <= TOTAL_CONTENT_PAGES; page += 1) {
        options.push({ value: String(page), text: `Pág. ${page}: Cuaderno de Física` });
      }
      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.text;
        pageSelector.appendChild(el);
      });
      pageSelector.value = currentPage.toString();
    }
  }

  function renderMathOnPages(elements) {
    if (window.renderMathInElement) {
      elements.forEach(el => {
        if (el) {
          renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      });
    }
  }

  function refreshLabCanvas() {
    const hasActiveSourcePage = sourceId => [...document.querySelectorAll(`[data-source-page="${sourceId}"]`)]
      .some(page => page.classList.contains('active'));

    if (hasActiveSourcePage('page-6')) {
      setTimeout(() => {
        if (geoPlane) {
          geoPlane.initCanvasSize();
          geoPlane.render();
        }
        if (masSimulator) {
          masSimulator.initCanvasSize();
          masSimulator.render();
        }
      }, 100);
    }

    // Refrescar canvases del péndulo (págs. 10 y 11)
    if (hasActiveSourcePage('page-10') || hasActiveSourcePage('page-11')) {
      setTimeout(() => {
        if (pendulumSimulator) pendulumSimulator.initCanvasSizes();
      }, 100);
    }

    // Refrescar canvases del amortiguado (págs. 14 y 15)
    if (hasActiveSourcePage('page-14') || hasActiveSourcePage('page-15')) {
      setTimeout(() => {
        if (dampedSimulator) dampedSimulator.initCanvasSizes();
      }, 100);
    }
  }

  function renderTwoPageSpread(spread) {
    if (spread < 0) spread = 0;
    if (spread > TOTAL_SPREADS) spread = TOTAL_SPREADS;
    currentSpread = spread;
    currentPage = spread === 0 ? 0 : (spread * 2 - 1);

    // Limpiar clases activas y de posición
    allPages.forEach(p => {
      p.classList.remove('active', 'page-left', 'page-right');
    });

    const activeElements = [];

    if (currentSpread === 0) {
      // Portada en cuaderno cerrado
      if (notebookStage) {
        notebookStage.classList.add('stage-closed');
        notebookStage.classList.remove('stage-open');
      }
      if (pageCover) {
        pageCover.classList.add('active');
        activeElements.push(pageCover);
      }

      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.innerHTML = 'Abrir <i class="fas fa-book-open"></i>';
      }
    } else {
      // Pliego abierto a doble página
      if (notebookStage) {
        notebookStage.classList.remove('stage-closed');
        notebookStage.classList.add('stage-open');
      }

      const leftIdx = (currentSpread * 2) - 2;  // 0 -> pág 1, 2 -> pág 3, 4 -> pág 5, 6 -> pág 7
      const rightIdx = (currentSpread * 2) - 1; // 1 -> pág 2, 3 -> pág 4, 5 -> pág 6, 7 -> pág 8

      const leftPage = contentPages[leftIdx];
      const rightPage = contentPages[rightIdx];

      if (leftPage) {
        leftPage.classList.add('active', 'page-left');
        activeElements.push(leftPage);
      }
      if (rightPage) {
        rightPage.classList.add('active', 'page-right');
        activeElements.push(rightPage);
      }

      if (btnPrev) btnPrev.disabled = false;
      if (btnNext) {
        btnNext.disabled = currentSpread >= TOTAL_SPREADS;
        btnNext.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>';
      }
    }

    if (pageSelector) pageSelector.value = currentSpread.toString();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderMathOnPages(activeElements);
    refreshLabCanvas();
  }

  function renderSinglePage(pageIndex) {
    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex > TOTAL_CONTENT_PAGES) pageIndex = TOTAL_CONTENT_PAGES;
    currentPage = pageIndex;
    currentSpread = currentPage === 0 ? 0 : Math.ceil(currentPage / 2);

    allPages.forEach(p => {
      p.classList.remove('active', 'page-left', 'page-right');
    });

    if (notebookStage) {
      if (currentPage === 0) {
        notebookStage.classList.add('stage-closed');
        notebookStage.classList.remove('stage-open');
      } else {
        notebookStage.classList.remove('stage-closed');
        notebookStage.classList.add('stage-open');
      }
    }

    const activeEl = currentPage === 0 ? pageCover : contentPages[currentPage - 1];
    if (activeEl) {
      activeEl.classList.add('active');
    }

    if (btnPrev) btnPrev.disabled = currentPage === 0;
    if (btnNext) {
      btnNext.disabled = currentPage >= TOTAL_CONTENT_PAGES;
      btnNext.innerHTML = currentPage === 0
        ? 'Abrir <i class="fas fa-book-open"></i>'
        : 'Siguiente <i class="fas fa-chevron-right"></i>';
    }

    if (pageSelector) pageSelector.value = currentPage.toString();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeEl) renderMathOnPages([activeEl]);
    refreshLabCanvas();
  }

  function navigateNext() {
    if (isTwoPageMode()) {
      renderTwoPageSpread(currentSpread + 1);
    } else {
      renderSinglePage(currentPage + 1);
    }
  }

  function navigatePrev() {
    if (isTwoPageMode()) {
      renderTwoPageSpread(currentSpread - 1);
    } else {
      renderSinglePage(currentPage - 1);
    }
  }

  function navigateHome() {
    if (isTwoPageMode()) {
      renderTwoPageSpread(0);
    } else {
      renderSinglePage(0);
    }
  }

  function navigateEnd() {
    if (isTwoPageMode()) {
      renderTwoPageSpread(TOTAL_SPREADS);
    } else {
      renderSinglePage(TOTAL_CONTENT_PAGES);
    }
  }

  function openNotebook() {
    if (isTwoPageMode()) {
      renderTwoPageSpread(1); // Spread 1: Páginas 1 y 2
    } else {
      renderSinglePage(1);   // Página 1: Índice
    }
  }

  function goToPageNumber(targetPage) {
    if (targetPage < 0) targetPage = 0;
    if (isTwoPageMode()) {
      const targetSpread = targetPage === 0 ? 0 : Math.ceil(targetPage / 2);
      renderTwoPageSpread(targetSpread);
    } else {
      renderSinglePage(targetPage);
    }
  }

  // Event Listeners de Navegación
  if (btnPrev) btnPrev.addEventListener('click', navigatePrev);
  if (btnNext) btnNext.addEventListener('click', navigateNext);
  if (btnHome) btnHome.addEventListener('click', navigateHome);
  if (btnEnd) btnEnd.addEventListener('click', navigateEnd);
  if (btnOpenNotebook) btnOpenNotebook.addEventListener('click', openNotebook);

  if (pageSelector) {
    pageSelector.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (isTwoPageMode()) {
        renderTwoPageSpread(val);
      } else {
        renderSinglePage(val);
      }
    });
  }

  // Navegación por Teclado
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      navigateNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      navigatePrev();
    } else if (e.key === 'Home') {
      navigateHome();
    } else if (e.key === 'End') {
      navigateEnd();
    }
  });

  // Salto desde el Índice Interactivo
  document.querySelectorAll('[data-goto-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = parseInt(link.getAttribute('data-goto-page'), 10);
      goToPageNumber(targetPage);
    });
  });

  // Listener de Redimensionamiento de Ventana (Adaptación Responsiva Dinámica)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updatePageSelectorOptions();
      if (isTwoPageMode()) {
        currentSpread = currentPage === 0 ? 0 : Math.ceil(currentPage / 2);
        renderTwoPageSpread(currentSpread);
      } else {
        renderSinglePage(currentPage);
      }
    }, 150);
  });

  // 3. Controles del Simulador Físico M.A.S.
  const sliderAmp = document.getElementById('sliderAmp');
  const sliderMass = document.getElementById('sliderMass');
  const sliderK = document.getElementById('sliderK');
  const sliderPhi = document.getElementById('sliderPhi');
  const btnPlay = document.getElementById('btnPlay');
  const btnResetSim = document.getElementById('btnResetSim');
  const speedBtns = document.querySelectorAll('[data-speed]');

  const labelAmp = document.getElementById('labelAmp');
  const labelMass = document.getElementById('labelMass');
  const labelK = document.getElementById('labelK');
  const labelPhi = document.getElementById('labelPhi');

  if (sliderAmp) {
    sliderAmp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelAmp) labelAmp.textContent = `${val.toFixed(2)} m`;
      masSimulator.setAmplitude(val);
    });
  }

  if (sliderMass) {
    sliderMass.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelMass) labelMass.textContent = `${val.toFixed(2)} kg`;
      masSimulator.setMass(val);
    });
  }

  if (sliderK) {
    sliderK.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelK) labelK.textContent = `${val.toFixed(1)} N/m`;
      masSimulator.setK(val);
    });
  }

  if (sliderPhi) {
    sliderPhi.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelPhi) labelPhi.textContent = `${val.toFixed(2)} rad`;
      masSimulator.setPhase(val);
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      const isPlaying = masSimulator.togglePlay();
      btnPlay.innerHTML = isPlaying 
        ? '<i class="fas fa-pause"></i> Pausar'
        : '<i class="fas fa-play"></i> Reanudar';
    });
  }

  if (btnResetSim) {
    btnResetSim.addEventListener('click', () => {
      masSimulator.reset();
    });
  }

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.getAttribute('data-speed'));
      masSimulator.setSpeed(speed);
    });
  });

  // ==========================================================================
  // 8. Controles del Simulador de Péndulo Simple (Páginas 10-11)
  // ==========================================================================
  const pendSliderL = document.getElementById('pendSliderL');
  const pendSliderTheta = document.getElementById('pendSliderTheta');
  const pendSliderMass = document.getElementById('pendSliderMass');
  const pendBtnPlay = document.getElementById('pendBtnPlay');
  const pendBtnReset = document.getElementById('pendBtnReset');
  const pendLabelL = document.getElementById('pendLabelL');
  const pendLabelTheta = document.getElementById('pendLabelTheta');
  const pendLabelMass = document.getElementById('pendLabelMass');

  // Botones de planeta para el péndulo
  const planetButtons = document.querySelectorAll('[data-planet]');
  const gravities = { tierra: { g: 9.81, name: 'Tierra' }, luna: { g: 1.62, name: 'Luna' }, marte: { g: 3.72, name: 'Marte' }, jupiter: { g: 24.79, name: 'Júpiter' } };
  planetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      planetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const planet = btn.getAttribute('data-planet');
      const { g, name } = gravities[planet] || { g: 9.81, name: 'Tierra' };
      pendulumSimulator.setGravity(g, name);
    });
  });

  if (pendSliderL) {
    pendSliderL.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (pendLabelL) pendLabelL.textContent = `${val.toFixed(2)} m`;
      pendulumSimulator.setLength(val);
    });
  }

  if (pendSliderTheta) {
    pendSliderTheta.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (pendLabelTheta) pendLabelTheta.textContent = `${val}°`;
      pendulumSimulator.setInitialAngle(val);
    });
  }

  if (pendSliderMass) {
    pendSliderMass.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (pendLabelMass) pendLabelMass.textContent = `${val.toFixed(1)} kg`;
      pendulumSimulator.setMass(val);
    });
  }

  if (pendBtnPlay) {
    pendBtnPlay.addEventListener('click', () => {
      const isPlaying = pendulumSimulator.togglePlay();
      pendBtnPlay.innerHTML = isPlaying
        ? '<i class="fas fa-pause"></i> Pausar'
        : '<i class="fas fa-play"></i> Reanudar';
    });
  }

  if (pendBtnReset) {
    pendBtnReset.addEventListener('click', () => pendulumSimulator.reset());
  }

  // ==========================================================================
  // 9. Controles del Simulador Oscilador Amortiguado (Páginas 14-15)
  // ==========================================================================
  const dampSliderB = document.getElementById('dampSliderB');
  const dampSliderK = document.getElementById('dampSliderK');
  const dampSliderWd = document.getElementById('dampSliderWd');
  const dampBtnPlay = document.getElementById('dampBtnPlay');
  const dampBtnReset = document.getElementById('dampBtnReset');
  const dampLabelB = document.getElementById('dampLabelB');
  const dampLabelK = document.getElementById('dampLabelK');
  const dampLabelWd = document.getElementById('dampLabelWd');

  // Botones de régimen
  const regimeButtons = document.querySelectorAll('[data-regime]');
  regimeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      regimeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const regime = btn.getAttribute('data-regime');
      dampedSimulator.setRegime(regime);
      // Sincronizar sliders al nuevo régimen
      if (dampSliderB) dampSliderB.value = dampedSimulator.params.b;
      if (dampLabelB) dampLabelB.textContent = `${dampedSimulator.params.b.toFixed(2)} N·s/m`;
    });
  });

  if (dampSliderB) {
    dampSliderB.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (dampLabelB) dampLabelB.textContent = `${val.toFixed(2)} N·s/m`;
      dampedSimulator.setDampingB(val);
    });
  }

  if (dampSliderK) {
    dampSliderK.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (dampLabelK) dampLabelK.textContent = `${val.toFixed(1)} N/m`;
      dampedSimulator.setK(val);
    });
  }

  if (dampSliderWd) {
    dampSliderWd.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (dampLabelWd) dampLabelWd.textContent = `${val.toFixed(1)} rad/s`;
      dampedSimulator.setOmegaD(val);
    });
  }

  if (dampBtnPlay) {
    dampBtnPlay.addEventListener('click', () => {
      const isPlaying = dampedSimulator.togglePlay();
      dampBtnPlay.innerHTML = isPlaying
        ? '<i class="fas fa-pause"></i> Pausar'
        : '<i class="fas fa-play"></i> Reanudar';
    });
  }

  if (dampBtnReset) {
    dampBtnReset.addEventListener('click', () => dampedSimulator.reset());
  }

  // Inicializar label de omega_d
  if (dampLabelWd) dampLabelWd.textContent = `${dampedSimulator.params.omegaD.toFixed(1)} rad/s`;

  // ==========================================================================
  // 10. Barra de Herramientas Estilo GeoGebra (Página 6 M.A.S.)
  const toolPan = document.getElementById('toolPan');
  const toolInspect = document.getElementById('toolInspect');
  const toolZoomIn = document.getElementById('toolZoomIn');
  const toolZoomOut = document.getElementById('toolZoomOut');
  const toolReset = document.getElementById('toolReset');
  const toolPalette = document.getElementById('toolPalette');
  const paletteModal = document.getElementById('paletteModal');
  const closePalette = document.getElementById('closePalette');

  if (toolPan) {
    toolPan.addEventListener('click', () => {
      toolPan.classList.add('active');
      if (toolInspect) toolInspect.classList.remove('active');
      geoPlane.setMode('pan');
    });
  }

  if (toolInspect) {
    toolInspect.addEventListener('click', () => {
      toolInspect.classList.add('active');
      if (toolPan) toolPan.classList.remove('active');
      geoPlane.setMode('inspect');
    });
  }

  if (toolZoomIn) toolZoomIn.addEventListener('click', () => geoPlane.zoomIn());
  if (toolZoomOut) toolZoomOut.addEventListener('click', () => geoPlane.zoomOut());
  if (toolReset) toolReset.addEventListener('click', () => geoPlane.resetView());

  if (toolPalette && paletteModal) {
    toolPalette.addEventListener('click', () => {
      paletteModal.classList.toggle('open');
    });
  }

  if (closePalette && paletteModal) {
    closePalette.addEventListener('click', () => {
      paletteModal.classList.remove('open');
    });
  }

  // Controles de la Paleta de Estilos Gráficos
  const chkCurveX = document.getElementById('chkCurveX');
  const chkCurveV = document.getElementById('chkCurveV');
  const chkCurveA = document.getElementById('chkCurveA');
  const chkMinorGrid = document.getElementById('chkMinorGrid');
  const selectLineWidth = document.getElementById('selectLineWidth');

  if (chkCurveX) {
    chkCurveX.addEventListener('change', (e) => {
      geoPlane.options.showCurves.x = e.target.checked;
      geoPlane.render();
    });
  }

  if (chkCurveV) {
    chkCurveV.addEventListener('change', (e) => {
      geoPlane.options.showCurves.v = e.target.checked;
      geoPlane.render();
    });
  }

  if (chkCurveA) {
    chkCurveA.addEventListener('change', (e) => {
      geoPlane.options.showCurves.a = e.target.checked;
      geoPlane.render();
    });
  }

  if (chkMinorGrid) {
    chkMinorGrid.addEventListener('change', (e) => {
      geoPlane.options.showMinorGrid = e.target.checked;
      geoPlane.render();
    });
  }

  if (selectLineWidth) {
    selectLineWidth.addEventListener('change', (e) => {
      const w = parseFloat(e.target.value);
      geoPlane.options.curveStyles.x.width = w;
      geoPlane.options.curveStyles.v.width = w * 0.9;
      geoPlane.options.curveStyles.a.width = w * 0.8;
      geoPlane.render();
    });
  }

  // Muestras de color para cada curva
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const curve = swatch.getAttribute('data-curve') || 'x';
      document.querySelectorAll(`.color-swatch[data-curve="${curve}"]`).forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      geoPlane.options.curveStyles[curve].color = color;
      geoPlane.render();
    });
  });

  // 5. Calculadora Simbólica Interactiva con Nerdamer (Página 8)
  const calcBtn = document.getElementById('btnSolveNerdamer');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const mVal = parseFloat(document.getElementById('calcM').value) || 1.0;
      const kVal = parseFloat(document.getElementById('calcK').value) || 4.0;
      const AVal = parseFloat(document.getElementById('calcA').value) || 1.0;
      const phiVal = parseFloat(document.getElementById('calcPhi').value) || 0.0;

      const result = mathEngine.solveSymbolicMAS(mVal, kVal, AVal, phiVal);
      if (result) {
        const outDiv = document.getElementById('nerdamerOutput');
        outDiv.style.display = 'block';

        mathEngine.renderLatexToElement('resOmega', `\\omega = \\sqrt{\\frac{${kVal}}{${mVal}}} = ${result.omegaVal.toFixed(3)}\\text{ rad/s}`);
        mathEngine.renderLatexToElement('resX', `x(t) = ${result.xLatex}\\text{ m}`);
        mathEngine.renderLatexToElement('resV', `v(t) = \\frac{dx}{dt} = ${result.vLatex}\\text{ m/s}`);
        mathEngine.renderLatexToElement('resA', `a(t) = \\frac{dv}{dt} = ${result.aLatex}\\text{ m/s}^2`);
      }
    });
  }

  // 6. Buscador del Glosario Dinámico (Página 9)
  const glossarySearch = document.getElementById('glossarySearch');
  if (glossarySearch) {
    glossarySearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.glossary-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 7. Registro de Service Worker para soporte PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('PWA Service Worker registrado con éxito.');
    }).catch(err => {
      console.log('Error registrando Service Worker:', err);
    });
  }

  // Inicializar estado del cuaderno virtual
  updatePageSelectorOptions();
  if (isTwoPageMode()) {
    renderTwoPageSpread(0);
  } else {
    renderSinglePage(0);
  }
});
