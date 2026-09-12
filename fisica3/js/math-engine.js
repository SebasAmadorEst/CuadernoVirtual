/**
 * ============================================================================
 * MATH ENGINE: KATEX & NERDAMER INTEGRATION
 * Motor Matemático para Renderizado LaTeX y Álgebra Simbólica
 * ============================================================================
 */

class MathEngine {
  constructor() {
    this.initKaTeX();
  }

  initKaTeX() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // Resuelve simbólicamente la ecuación diferencial del M.A.S. y muestra pasos
  solveSymbolicMAS(mVal, kVal, AVal, phiVal) {
    if (typeof nerdamer === 'undefined') {
      return {
        omegaLatex: `\\sqrt{\\frac{${kVal}}{${mVal}}}`,
        xLatex: `${AVal}\\cos(${Math.sqrt(kVal/mVal).toFixed(2)}t + ${phiVal})`
      };
    }

    try {
      // omega = sqrt(k/m)
      const omegaVal = Math.sqrt(kVal / mVal);
      const omegaExact = nerdamer(`sqrt(${kVal}/${mVal})`).toTeX();

      // x(t) = A * cos(omega * t + phi)
      const xExpr = nerdamer(`${AVal}*cos(${omegaVal}*t + ${phiVal})`);
      const xLatex = xExpr.toTeX();

      // v(t) = d/dt [x(t)]
      const vExpr = nerdamer(`diff(${AVal}*cos(${omegaVal}*t + ${phiVal}), t)`);
      const vLatex = vExpr.toTeX();

      // a(t) = d/dt [v(t)]
      const aExpr = nerdamer(`diff(${vExpr.text()}, t)`);
      const aLatex = aExpr.toTeX();

      return {
        omegaExact,
        omegaVal,
        xLatex,
        vLatex,
        aLatex
      };
    } catch (e) {
      console.error('Nerdamer evaluation error:', e);
      return null;
    }
  }

  renderLatexToElement(elementId, latexStr, displayMode = true) {
    const el = document.getElementById(elementId);
    if (!el || typeof katex === 'undefined') return;
    katex.render(latexStr, el, {
      displayMode: displayMode,
      throwOnError: false
    });
  }
}

window.MathEngine = MathEngine;
