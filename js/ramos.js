/* Gera os ramos em traço fino (line art) que decoram a página.
   Cada ramo é um caule em curva de Bézier com folhas distribuídas ao longo dele,
   o que permite "desenhar" o traço com o DrawSVGPlugin em js/animacoes.js. */
(function () {
  const MODELOS = {
    longo: { pontos: [[60, 395], [80, 280], [200, 210], [345, 40]], folhas: 9, tamanho: [74, 40] },
    curto: { pontos: [[60, 360], [110, 290], [190, 250], [330, 150]], folhas: 5, tamanho: [62, 38] },
    flor: { pontos: [[70, 395], [140, 300], [130, 170], [250, 70]], folhas: 6, tamanho: [70, 44], flor: true },
  };

  const arred = (n) => Math.round(n * 10) / 10;
  const par = (x, y) => `${arred(x)} ${arred(y)}`;
  const graus = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI;

  function bezier(p, t) {
    const u = 1 - t;
    return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
  }

  function derivada(p, t) {
    const u = 1 - t;
    return [0, 1].map((i) => 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i]));
  }

  // Pseudoaleatório com semente: o mesmo ramo sai igual a cada carregamento
  function sorteio(semente) {
    let s = semente;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  // Folha apontando para +x a partir da origem, com cabinho e nervura central
  function folha(L, W, curva) {
    const a = 7;
    return (
      `<path d="M0 0L${a} 0"/>` +
      `<path d="M${a} 0C${par(a + L * 0.22, -W + curva * 0.3)} ${par(a + L * 0.7, -W * 1.05 + curva)} ${par(a + L, curva)}` +
      `C${par(a + L * 0.7, W * 1.05 + curva)} ${par(a + L * 0.22, W + curva * 0.3)} ${a} 0"/>` +
      `<path d="M${a} 0Q${par(a + L * 0.5, curva * 0.5 - W * 0.12)} ${par(a + L * 0.86, curva * 0.92)}"/>`
    );
  }

  // Botão de flor em formato de tulipa, apontando para -y
  const BOTAO =
    '<path d="M0 0C-15 -5 -17 -28 -8 -42C-4 -34 4 -34 8 -42C17 -28 15 -5 0 0Z"/>' +
    '<path d="M-8 -42C-3 -30 3 -18 1 -2"/>' +
    '<path d="M8 -42C5 -33 0 -27 -4 -14"/>' +
    '<path d="M0 0C-6 4 -12 4 -16 1"/>' +
    '<path d="M0 0C6 4 12 4 16 1"/>';

  function criarRamo(tipo, semente) {
    const cfg = MODELOS[tipo] || MODELOS.curto;
    const p = cfg.pontos;
    const rand = sorteio(semente);
    const caule = `M${p[0].join(" ")}C${p[1].join(" ")} ${p[2].join(" ")} ${p[3].join(" ")}`;

    let folhas = "";
    for (let i = 0; i < cfg.folhas; i++) {
      const t = 0.14 + (0.8 * i) / (cfg.folhas - 1);
      const [x, y] = bezier(p, t);
      const [dx, dy] = derivada(p, t);
      const lado = i % 2 ? 1 : -1;
      const angulo = graus(dx, dy) + lado * (38 + rand() * 18);
      const L = (cfg.tamanho[0] + (cfg.tamanho[1] - cfg.tamanho[0]) * t) * (0.85 + rand() * 0.3);
      const W = L * (0.26 + rand() * 0.06);
      folhas += `<g class="ramo__folha" transform="translate(${par(x, y)}) rotate(${arred(angulo)})">${folha(L, W, lado * L * 0.08)}</g>`;
    }

    const [dx, dy] = derivada(p, 1);
    const ponta = cfg.flor
      ? `<g class="ramo__flor" stroke-width="1" transform="translate(${p[3].join(" ")}) rotate(${arred(graus(dx, dy) + 90)}) scale(1.5)">${BOTAO}</g>`
      : `<g class="ramo__folha" transform="translate(${p[3].join(" ")}) rotate(${arred(graus(dx, dy))})">${folha(cfg.tamanho[1], cfg.tamanho[1] * 0.28, 0)}</g>`;

    return (
      '<svg viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
      `<path class="ramo__caule" d="${caule}"/>${folhas}${ponta}</svg>`
    );
  }

  document.querySelectorAll("[data-ramo]").forEach((el, i) => {
    el.innerHTML = criarRamo(el.dataset.ramo, 11 + i * 7);
  });
})();
