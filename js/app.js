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

function compactLongPages() {
  const pageTemplate = (label, number, title, subtitle, content) => `
    <div class="page-header-banner"><span class="unit-label">${label}</span><span class="page-number-tag">Página ${number} de 18</span></div>
    <h2 class="page-title">${title}</h2>
    <p class="page-subtitle">${subtitle}</p>
    ${content}`;

  const replacePage = (id, html) => {
    const page = document.getElementById(id);
    if (page) {
      page.classList.add('content-condensed');
      page.innerHTML = `<div class="page-content-wrapper">${html}</div>`;
    }
  };

  replacePage('page-1', pageTemplate(
    'Unidad I: Fundamentos Oscilatorios', 1,
    '<i class="fas fa-list-ol" style="color:#0284c7"></i> Indice y reseña historica',
    'Conceptos iniciales y evolucion de la teoria oscilatoria',
    `<div class="concept-card"><h4><i class="fas fa-bookmark"></i> Contenidos</h4><p class="text-paragraph">El cuaderno estudia el M.A.S., el pendulo simple, las oscilaciones amortiguadas, la resonancia y sus aplicaciones.</p><p class="text-paragraph">Galileo estudio el isocronismo del pendulo; Hooke establecio la fuerza restauradora $F=-kx$; Newton formalizo la dinamica y Fourier explico la descomposicion de las vibraciones periodicas.</p></div>
     <div class="concept-card"><h4><i class="fas fa-landmark"></i> Idea central</h4><p class="text-paragraph">Un sistema oscila alrededor de un equilibrio estable cuando existe una fuerza o torque restaurador. El M.A.S. es el modelo lineal fundamental para describirlo.</p></div>`
  ));

  replacePage('page-2', pageTemplate(
    'Evolucion Historica y Cientifica', 2,
    '<i class="fas fa-hourglass-half" style="color:#0284c7"></i> Linea de tiempo',
    'Hitos esenciales del movimiento oscilatorio',
    `<div class="timeline-container"><div class="timeline-node"><div class="timeline-badge"><i class="fas fa-bell"></i></div><div class="timeline-card"><span class="timeline-year">1581</span><h4 class="timeline-scientist">Galileo Galilei</h4><p class="text-paragraph">Observo el isocronismo del pendulo y relaciono la oscilacion con la medicion del tiempo.</p></div></div><div class="timeline-node"><div class="timeline-badge"><i class="fas fa-compress-arrows-alt"></i></div><div class="timeline-card"><span class="timeline-year">1678</span><h4 class="timeline-scientist">Robert Hooke</h4><p class="text-paragraph">Formulo la ley de elasticidad: $F=-kx$, base del oscilador masa-resorte.</p></div></div><div class="timeline-node"><div class="timeline-badge"><i class="fas fa-wave-square"></i></div><div class="timeline-card"><span class="timeline-year">1822</span><h4 class="timeline-scientist">Joseph Fourier</h4><p class="text-paragraph">Demostro que una vibracion periodica puede expresarse como suma de oscilaciones armonicas.</p></div></div></div>`
  ));

  replacePage('page-4', pageTemplate(
    'Marco Teorico y Dimensional', 4,
    '<i class="fas fa-book" style="color:#0284c7"></i> Magnitudes fundamentales',
    'Variables, relaciones y unidades del M.A.S.',
    `<div class="concept-card"><h4>Movimiento oscilatorio</h4><p class="text-paragraph">Es un movimiento de vaiven alrededor de un equilibrio. Si se repite en intervalos iguales, tambien es periodico.</p></div><div class="concept-card"><h4>Variables del sistema</h4><p class="text-paragraph">La elongacion $x$ y la amplitud $A$ se miden en metros. El periodo $T$ se mide en segundos y la frecuencia $f$ en hertz.</p><div class="math-equation-row"><div class="math-equation-content">$$f=\frac{1}{T},\qquad \omega=2\pi f=\frac{2\pi}{T}$$</div><span class="math-equation-tag">(1)</span></div></div><div class="science-table-container"><table class="science-table"><thead><tr><th>Magnitud</th><th>Simbolo</th><th>Unidad</th></tr></thead><tbody><tr><td>Elongacion</td><td>$x$</td><td>m</td></tr><tr><td>Amplitud</td><td>$A$</td><td>m</td></tr><tr><td>Periodo</td><td>$T$</td><td>s</td></tr><tr><td>Frecuencia</td><td>$f$</td><td>Hz</td></tr><tr><td>Frecuencia angular</td><td>$\omega$</td><td>rad/s</td></tr></tbody></table></div>`
  ));

  replacePage('page-5', pageTemplate(
    'Rigor Analitico y Deduccion Formal', 5,
    '<i class="fas fa-calculator" style="color:#0284c7"></i> Ecuaciones del M.A.S.',
    'Derivacion resumida de posicion, velocidad y aceleracion',
    `<p class="text-paragraph">Para una masa $m$ unida a un resorte de constante $k$, Newton y Hooke producen:</p><div class="math-equation-row"><div class="math-equation-content">$$m\ddot{x}+kx=0,\qquad \omega=\sqrt{\frac{k}{m}}$$</div><span class="math-equation-tag">(4)</span></div><p class="text-paragraph">La solucion depende de la amplitud $A$ y la fase inicial $\phi_0$:</p><div class="math-equation-row"><div class="math-equation-content">$$x(t)=A\cos(\omega t+\phi_0)$$</div><span class="math-equation-tag">(5)</span></div><div class="math-equation-row"><div class="math-equation-content">$$v(t)=-A\omega\sin(\omega t+\phi_0),\qquad v_{max}=A\omega$$</div><span class="math-equation-tag">(6)</span></div><div class="math-equation-row"><div class="math-equation-content">$$a(t)=-\omega^2x(t),\qquad a_{max}=A\omega^2$$</div><span class="math-equation-tag">(7)</span></div><div class="concept-card"><h4><i class="fas fa-check-circle"></i> Lectura fisica</h4><p class="text-paragraph">La velocidad se desfasa $\pi/2$ respecto a la posicion y la aceleracion se opone a ella. En los extremos $v=0$; en el equilibrio $|v|$ es maxima.</p></div>`
  ));

  replacePage('page-7', pageTemplate(
    'Aplicacion Practica y Resolucion', 7,
    '<i class="fas fa-pencil-ruler" style="color:#0284c7"></i> Ejercicio guiado',
    'Metodo breve de cinco fases para un oscilador masa-resorte',
    `<div class="exercise-solver-card"><div class="exercise-enunciado"><strong>Problema:</strong> $m=0.250\,kg$, $k=40.0\,N/m$, $A=0.120\,m$ y $v_0=0$.</div><div class="step-datos"><div class="step-datos-title"><i class="fas fa-database"></i> Datos</div><p class="dato-item">$m=0.250\,kg$, $k=40.0\,N/m$, $A=0.120\,m$, $\phi_0=0$.</p></div><div class="step-formulas"><div class="step-formulas-title"><i class="fas fa-square-root-alt"></i> Formulas</div><div class="math-equation-content">$$\omega=\sqrt{k/m},\quad T=2\pi/\omega,\quad f=1/T$$</div></div><div class="step-despejes"><div class="step-despejes-title"><i class="fas fa-check-double"></i> Resultado</div><p class="despeje-item">$\omega=12.65\,rad/s$, $T=0.497\,s$, $f=2.01\,Hz$.</p><p class="despeje-item">$v_{max}=1.52\,m/s$, $a_{max}=19.2\,m/s^2$.</p><p class="despeje-item">$$x(t)=0.120\cos(12.65t)\,m$$</p></div><div class="step-validacion"><div class="step-validacion-title"><i class="fas fa-shield-alt"></i> Validacion</div><p>La energia total es $E=\frac12kA^2=0.288\,J$ y coincide con la energia cinetica maxima.</p></div></div>`
  ));

  replacePage('page-9', pageTemplate(
    'Unidad II: Pendulo Simple', 9,
    '<i class="fas fa-drafting-compass" style="color:#8b5cf6"></i> Fundamentos teoricos',
    'Modelo exacto y aproximacion de angulos pequenos',
    `<div class="concept-card" style="border-left-color:#8b5cf6"><h4>Modelo fisico</h4><p class="text-paragraph">Una masa $m$ cuelga de un hilo de longitud $L$. La variable dinamica es el angulo $\theta$.</p></div><div class="math-equation-row"><div class="math-equation-content">$$\ddot{\theta}+\frac{g}{L}\sin\theta=0$$</div><span class="math-equation-tag">(12)</span></div><div class="concept-card" style="background:#fef3c7;border-left-color:#f59e0b"><h4>Aproximacion armonica</h4><p class="text-paragraph">Para $\theta<15^\circ$, $\sin\theta\approx\theta$ y:</p><div class="math-equation-content">$$\omega_0=\sqrt{g/L},\qquad T_0=2\pi\sqrt{L/g}$$</div></div><div class="concept-card"><h4>Amplitud finita</h4><p class="text-paragraph">A amplitudes grandes el periodo aumenta. La primera correccion es $T\approx T_0(1+\theta_0^2/16)$.</p></div>`
  ));

  replacePage('page-3', pageTemplate(
    'Estructura Cognitiva y Relaciones', 3,
    '<i class="fas fa-project-diagram" style="color:#0284c7"></i> Mapa mental del M.A.S.',
    'Relaciones entre cinematica, dinamica y energia',
    `<div class="mindmap-container"><div class="mindmap-node-core">MOVIMIENTO OSCILATORIO<div style="font-size:.8rem;font-weight:normal;margin-top:4px">Equilibrio, periodo y amplitud</div></div><div class="mindmap-branches"><div class="mindmap-branch-card"><h5>Cinematica</h5><p>$x(t)$, $v(t)$, $a(t)$ y sus desfases.</p></div><div class="mindmap-branch-card"><h5>Dinamica</h5><p>La fuerza restauradora cumple $F=-kx$.</p></div><div class="mindmap-branch-card"><h5>Energia</h5><p>$E=E_c+E_p$ permanece constante sin friccion.</p></div></div></div>`
  ));

  replacePage('page-6', pageTemplate(
    'Laboratorio Virtual de Fisica Computacional', 6,
    '<i class="fas fa-chart-line" style="color:#0284c7"></i> Simulador masa-resorte',
    'Explora la relacion entre amplitud, masa, constante elastica y energia',
    `<div class="simulator-box"><div class="simulator-summary"><p class="text-paragraph">Elige los parametros y observa como cambian $x(t)$, $v(t)$, $a(t)$ y la energia mecanica.</p></div><canvas id="simCanvas" class="sim-viewport-canvas" style="height:130px"></canvas><div class="sim-controls-grid"><div class="sim-control-item"><label>Amplitud $A$</label><input type="range" id="sliderAmp" min=".2" max="2" step=".05" value="1.2"></div><div class="sim-control-item"><label>Masa $m$</label><input type="range" id="sliderMass" min=".2" max="5" step=".1" value="1"></div><div class="sim-control-item"><label>Constante $k$</label><input type="range" id="sliderK" min="1" max="20" step=".5" value="4"></div><div class="sim-control-item"><label>Fase $\phi_0$</label><input type="range" id="sliderPhi" min="0" max="6.28" step=".1" value="0"></div></div><div class="sim-action-bar"><button class="sim-btn" id="btnPlay"><i class="fas fa-pause"></i> Pausar</button><button class="sim-btn secondary" id="btnResetSim"><i class="fas fa-undo"></i> Reiniciar</button></div></div><div class="geogebra-container"><div class="geogebra-header"><span class="geogebra-title">Plano de curvas $x(t)$, $v(t)$ y $a(t)$</span></div><canvas id="geoCanvas" class="geogebra-canvas" style="height:70px"></canvas></div>`
  ));

  replacePage('page-8', pageTemplate(
    'Sintesis Terminologica y Fuentes', 8,
    '<i class="fas fa-spell-check" style="color:#0284c7"></i> Glosario y referencias',
    'Definiciones esenciales para repasar la unidad',
    `<div class="glossary-grid" id="glossaryGrid"><div class="glossary-card"><h5 class="glossary-term">Amplitud $A$</h5><p class="glossary-def">Elongacion maxima respecto al equilibrio.</p></div><div class="glossary-card"><h5 class="glossary-term">Periodo $T$</h5><p class="glossary-def">Tiempo de una oscilacion completa.</p></div><div class="glossary-card"><h5 class="glossary-term">Frecuencia $f$</h5><p class="glossary-def">Numero de ciclos por segundo.</p></div><div class="glossary-card"><h5 class="glossary-term">Fase $\phi_0$</h5><p class="glossary-def">Estado inicial del oscilador.</p></div><div class="glossary-card"><h5 class="glossary-term">Resonancia</h5><p class="glossary-def">Respuesta maxima cuando coinciden las frecuencias.</p></div><div class="glossary-card"><h5 class="glossary-term">Amortiguamiento</h5><p class="glossary-def">Perdida de energia por rozamiento.</p></div></div><div class="concept-card"><h4><i class="fas fa-graduation-cap"></i> Referencias base</h4><p class="text-paragraph">French, A. P. <em>Vibraciones y ondas</em>. Reverte.</p><p class="text-paragraph">Halliday, Resnick y Walker. <em>Fundamentals of Physics</em>.</p><p class="text-paragraph">Serway y Jewett. <em>Fisica para ciencias e ingenieria</em>.</p></div>`
  ));

  replacePage('page-12', pageTemplate(
    'Analisis Energetico del Pendulo', 12,
    '<i class="fas fa-bolt" style="color:#f59e0b"></i> Energia del pendulo',
    'Conversion entre energia potencial y cinetica',
    `<div class="concept-card"><h4>Conservacion de la energia</h4><p class="text-paragraph">Sin rozamiento, la energia total permanece constante:</p><div class="math-equation-content">$$E=\frac12mL^2\dot{\theta}^2+mgL(1-\cos\theta)$$</div></div><div class="concept-card"><h4>Lectura del movimiento</h4><p class="text-paragraph">En los extremos, la velocidad es cero y la energia es potencial. En el equilibrio, la velocidad es maxima y la energia es cinetica.</p></div><div class="step-despejes"><div class="step-despejes-title">Ejemplo lunar</div><p class="despeje-item">Para $L=2\,m$ y $g=1.62\,m/s^2$, $T_0=6.98\,s$.</p></div>`
  ));

  replacePage('page-13', pageTemplate(
    'Unidad III: Oscilaciones Amortiguadas', 13,
    '<i class="fas fa-wave-square" style="color:#10b981"></i> Oscilador amortiguado',
    'Ecuacion, regimenes y factor de calidad',
    `<div class="concept-card" style="border-left-color:#10b981"><h4>Ecuacion general</h4><div class="math-equation-content">$$m\ddot{x}+b\dot{x}+kx=0$$</div><p class="text-paragraph">Con $\gamma=b/(2m)$ y $\omega_0=\sqrt{k/m}$ se distinguen tres regimenes.</p></div><div class="mindmap-branches"><div class="mindmap-branch-card"><h5>Subamortiguado</h5><p>$\gamma<\omega_0$: oscila con amplitud decreciente.</p></div><div class="mindmap-branch-card"><h5>Critico</h5><p>$\gamma=\omega_0$: vuelve al equilibrio sin oscilar.</p></div><div class="mindmap-branch-card"><h5>Sobre</h5><p>$\gamma>\omega_0$: retorno lento sin oscilacion.</p></div></div><div class="math-equation-row"><div class="math-equation-content">$$Q=\frac{\omega_0}{2\gamma}$$</div><span class="math-equation-tag">(18)</span></div>`
  ));

  replacePage('page-16', pageTemplate(
    'Energia Disipada y Aplicaciones', 16,
    '<i class="fas fa-fire" style="color:#ef4444"></i> Energia y resonancia',
    'Decaimiento, potencia y aplicaciones tecnologicas',
    `<div class="concept-card"><h4>Decaimiento energetico</h4><p class="text-paragraph">En el regimen subamortiguado:</p><div class="math-equation-content">$$E(t)=E_0e^{-2\gamma t},\qquad \tau=\frac{1}{2\gamma}=\frac{m}{b}$$</div></div><div class="step-despejes"><div class="step-despejes-title">Ejemplo</div><p class="despeje-item">Para $m=.5\,kg$, $k=18\,N/m$, $b=.9\,N\,s/m$: $\omega_0=6$, $\gamma=.9$, $\tau=.556\,s$.</p></div><div class="concept-card"><h4>Aplicaciones</h4><p class="text-paragraph">Amortiguadores sismicos, circuitos resonantes, telecomunicaciones y resonancia magnetica.</p></div>`
  ));

  replacePage('page-17', pageTemplate(
    'Sintesis Comparativa', 17,
    '<i class="fas fa-table" style="color:#0284c7"></i> Tres sistemas oscilatorios',
    'Comparacion de ecuaciones, energia y comportamiento',
    `<div class="science-table-container"><table class="science-table"><thead><tr><th>Propiedad</th><th>M.A.S.</th><th>Pendulo</th><th>Amortiguado</th></tr></thead><tbody><tr><td>Ecuacion</td><td>$\ddot{x}+\omega_0^2x=0$</td><td>$\ddot{\theta}+(g/L)\sin\theta=0$</td><td>$\ddot{x}+2\gamma\dot{x}+\omega_0^2x=0$</td></tr><tr><td>Periodo</td><td>$2\pi\sqrt{m/k}$</td><td>$2\pi\sqrt{L/g}$</td><td>$2\pi/\omega'$</td></tr><tr><td>Energia</td><td>Conservada</td><td>Conservada</td><td>Disipada</td></tr><tr><td>Rasgo</td><td>Lineal</td><td>No lineal</td><td>Decae</td></tr></tbody></table></div><div class="concept-card"><h4>Idea unificadora</h4><p class="text-paragraph">Todos los sistemas oscilan alrededor de un equilibrio; la diferencia principal es la fuerza restauradora y la presencia de perdidas.</p></div>`
  ));

  replacePage('page-10', pageTemplate(
    'Laboratorio Computacional II: Pendulo', 10,
    '<i class="fas fa-play-circle" style="color:#8b5cf6"></i> Simulador de pendulo',
    'Observa el movimiento angular y modifica sus parametros',
    `<div class="simulator-box"><canvas id="pendSimCanvas" class="sim-viewport-canvas" style="height:170px"></canvas><div class="sim-controls-grid"><div class="sim-control-item"><label>Longitud $L$</label><input type="range" id="pendSliderL" min=".4" max="3" step=".05" value="1.5"></div><div class="sim-control-item"><label>Angulo $\theta_0$</label><input type="range" id="pendSliderTheta" min="5" max="85" value="30"></div><div class="sim-control-item"><label>Masa $m$</label><input type="range" id="pendSliderMass" min=".2" max="5" step=".1" value="1"></div></div><div class="sim-action-bar"><button class="sim-btn" id="pendBtnPlay">Pausar</button><button class="sim-btn secondary" id="pendBtnReset">Reiniciar</button></div></div>`
  ));

  replacePage('page-11', pageTemplate(
    'Laboratorio Computacional II: Grafica Angular', 11,
    '<i class="fas fa-chart-line" style="color:#8b5cf6"></i> Graficas del pendulo',
    'Posicion angular, velocidad angular y espacio de fases',
    `<div class="geogebra-container"><div class="geogebra-header"><span class="geogebra-title">$\theta(t)$ y $\omega(t)$</span></div><canvas id="pendGeoCanvas" class="geogebra-canvas" style="height:170px"></canvas></div><div class="concept-card"><h4>Lectura de la grafica</h4><p class="text-paragraph">Las oscilaciones se mantienen cerradas cuando no hay rozamiento. A mayor amplitud, la aproximacion armonica pierde precision.</p><canvas id="pendPhaseCanvas" class="geogebra-canvas" style="height:130px"></canvas></div>`
  ));

  replacePage('page-14', pageTemplate(
    'Laboratorio Computacional III: Amortiguado', 14,
    '<i class="fas fa-sliders-h" style="color:#10b981"></i> Simulador amortiguado',
    'Compara los regimenes subamortiguado, critico y sobreamortiguado',
    `<div class="simulator-box"><canvas id="dampSimCanvas" class="sim-viewport-canvas" style="height:170px"></canvas><div class="sim-controls-grid"><div class="sim-control-item"><label>Amortiguamiento $b$</label><input type="range" id="dampSliderB" min=".05" max="15" step=".05" value=".6"></div><div class="sim-control-item"><label>Constante $k$</label><input type="range" id="dampSliderK" min="1" max="25" step=".5" value="9"></div><div class="sim-control-item"><label>Frecuencia impulsora</label><input type="range" id="dampSliderWd" min=".5" max="8" step=".1" value="3"></div></div><div class="sim-action-bar"><button class="sim-btn" id="dampBtnPlay">Pausar</button><button class="sim-btn secondary" id="dampBtnReset">Reiniciar</button></div></div>`
  ));

  replacePage('page-15', pageTemplate(
    'Laboratorio Computacional III: Grafica', 15,
    '<i class="fas fa-chart-area" style="color:#10b981"></i> Envolvente y resonancia',
    'Curva de posicion y respuesta forzada',
    `<div class="geogebra-container"><div class="geogebra-header"><span class="geogebra-title">$x(t)$ y $Ae^{-\gamma t}$</span></div><canvas id="dampGeoCanvas" class="geogebra-canvas" style="height:180px"></canvas></div><div class="concept-card"><h4>Resonancia</h4><p class="text-paragraph">La amplitud crece cuando la frecuencia externa se aproxima a la frecuencia natural. El amortiguamiento limita el maximo.</p><div class="math-equation-content">$$\omega_{res}=\sqrt{\omega_0^2-2\gamma^2}$$</div></div>`
  ));

  replacePage('page-18', pageTemplate(
    'Cierre Academico y Sintesis Final', 18,
    '<i class="fas fa-graduation-cap" style="color:#0284c7"></i> Sintesis global',
    'Resumen de las tres unidades del cuaderno',
    `<div class="concept-card"><h4>Movimiento oscilatorio</h4><p class="text-paragraph">El M.A.S. describe oscilaciones lineales; el pendulo incorpora una geometria angular y el amortiguado incluye perdidas de energia.</p></div><div class="science-table-container"><table class="science-table"><thead><tr><th>Sistema</th><th>Variable</th><th>Idea clave</th></tr></thead><tbody><tr><td>M.A.S.</td><td>$x$</td><td>$F=-kx$</td></tr><tr><td>Pendulo</td><td>$\theta$</td><td>$T=2\pi\sqrt{L/g}$</td></tr><tr><td>Amortiguado</td><td>$x$</td><td>$E$ disminuye</td></tr></tbody></table></div><div class="concept-card"><h4>Conclusiones</h4><p class="text-paragraph">Las ecuaciones, simulaciones y graficas permiten conectar el modelo matematico con la observacion fisica.</p></div>`
  ));

  ['page-10','page-11','page-14','page-15','page-18'].forEach(id => {
    const page = document.getElementById(id);
    page?.querySelectorAll('canvas').forEach(canvas => {
      canvas.style.height = id === 'page-10' || id === 'page-14' ? '210px' : '180px';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Motores
  const mathEngine = new MathEngine();
  
  // Instanciar Plano Cartesiano GeoGebra (Página 6)
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
  // currentPage: 0 = Portada, 1..N = Páginas de contenido
  // currentSpread: 0 = Portada (Cerrado), 1..N = Pliegos de contenido
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
