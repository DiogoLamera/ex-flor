/* Animações com GSAP: abertura, hero, reveals no scroll, parallax e portfólio horizontal.
   Todo movimento amplo passa por gsap.matchMedia() e respeita prefers-reduced-motion. */
(function () {
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  const temSplit = typeof window.SplitText !== "undefined";
  const temDraw = typeof window.DrawSVGPlugin !== "undefined";
  gsap.registerPlugin(ScrollTrigger, ...(temSplit ? [SplitText] : []), ...(temDraw ? [DrawSVGPlugin] : []));

  const App = window.App || {};
  const raiz = document.documentElement;
  const mm = gsap.matchMedia();
  const { random } = gsap.utils;

  // Barra de progresso de leitura (movimento pequeno, fica ativa em qualquer preferência)
  gsap.to(".progresso__barra", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    raiz.classList.remove("anim");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pararPetalas = petalas();
    abertura();
    parallaxHero();
    reveals();
    sobre();
    fotosComMascara();
    faixa();
    ramosNoScroll();
    vantagens();
    depoimentos();
    rodape();
    return () => pararPetalas();
  });

  // Portfólio horizontal fixo só no desktop; no celular fica o arrastar nativo
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    portfolioHorizontal();
    return () => document.querySelector(".portfolio").classList.remove("is-fixado");
  });

  mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => inclinarHero());

  // Triggers criados fora da ordem da página precisam ser ordenados antes de medir
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => {
    App.lenis?.resize();
    ScrollTrigger.refresh();
  });

  /* ======================================================================= */

  function revelar(alvos, extra = {}) {
    const lista = gsap.utils.toArray(alvos);
    return gsap.to(lista, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "power3.out",
      overwrite: true,
      ...extra,
      onComplete() {
        lista.forEach((el) => el.classList.add("is-visto"));
        gsap.set(lista, { clearProps: "opacity,transform" });
      },
    });
  }

  // Ao fim do reveal a máscara sai de vez; inline "none" vence o estado inicial do CSS
  function semMascara() {
    gsap.set(this.targets(), { clipPath: "none" });
  }

  // Desenha caule, depois folhas e flor, de cada ramo
  function desenharRamos(alvos) {
    const tl = gsap.timeline();
    gsap.utils.toArray(alvos).forEach((ramo, i) => {
      const inicio = i * 0.18;
      const svg = ramo.querySelector("svg");
      tl.set(ramo, { opacity: 1 }, inicio);
      if (!temDraw || !svg) {
        tl.from(ramo, { opacity: 0, duration: 1 }, inicio);
        return;
      }
      tl.from(svg.querySelector(".ramo__caule"), { drawSVG: 0, duration: 1.3, ease: "power2.inOut" }, inicio)
        .from(svg.querySelectorAll(".ramo__folha path, .ramo__flor path"), {
          drawSVG: 0,
          duration: 0.7,
          stagger: 0.025,
          ease: "power2.out",
        }, inicio + 0.35)
        .add(() => balancar(svg));
    });
    return tl;
  }

  // Balanço leve e contínuo, como folha ao vento
  function balancar(svg) {
    gsap.fromTo(svg, { rotation: -1.5 }, {
      rotation: random(1.5, 3),
      duration: random(3.2, 5),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "15% 98%",
    });
  }

  /* ---------- Abertura + entrada do hero ---------- */
  function abertura() {
    const tela = document.querySelector(".abertura");
    const flor = tela.querySelector(".abertura__flor");
    const fotoHero = document.querySelector(".hero__foto");
    const imgHero = fotoHero.querySelector("img");

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    App.lenis?.stop();

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.set(flor, { opacity: 1 });
    if (temDraw) {
      intro.from(flor.querySelectorAll("ellipse, circle"), { drawSVG: 0, duration: 0.9, stagger: 0.09, ease: "power2.inOut" });
    }
    intro
      .fromTo(flor, { rotation: -40, scale: 0.8 }, { rotation: 0, scale: 1, duration: 1.3, ease: "power3.inOut" }, 0)
      .fromTo(".abertura__nome", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.55);

    const carregou = Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : null, imgHero.decode ? imgHero.decode().catch(() => {}) : null]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    const introAcabou = new Promise((r) => intro.eventCallback("onComplete", r));

    Promise.all([carregou, introAcabou]).then(() => {
      const raio = getComputedStyle(fotoHero).borderRadius;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".abertura__cortina", { scaleY: 1, duration: 0.75, ease: "power4.inOut" })
        .set(tela, { display: "none" })
        .addLabel("hero")
        .add(() => raiz.classList.add("intro-feita"), "hero")
        .fromTo(".topo__inner", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.9, clearProps: "transform" }, "hero")
        .fromTo(fotoHero,
          { clipPath: `inset(100% 0% 0% 0% round ${raio})` },
          { clipPath: `inset(0% 0% 0% 0% round ${raio})`, duration: 1.4, ease: "power4.inOut", onComplete: semMascara },
          "hero")
        .fromTo(imgHero, { scale: 1.35 }, { scale: 1, duration: 2, ease: "power3.out" }, "hero+=0.1")
        .fromTo(".hero__tag", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "hero+=0.35")
        .to(".marca-texto__barra", { scaleX: 1, duration: 1, ease: "power3.inOut" }, "hero+=0.4")
        .add(tituloHero(), "hero+=0.5")
        .fromTo(".hero__desc", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "hero+=0.85")
        .fromTo(".hero .link-seta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "hero+=1")
        .fromTo(".selo", { opacity: 0, y: 24, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.7)" }, "hero+=1.15")
        .add(desenharRamos(".hero .ramo"), "hero+=0.6")
        .add(() => App.lenis?.start(), "hero+=0.8")
        .add(flutuarSelo);
    });
  }

  function tituloHero() {
    const alvo = document.querySelector(".marca-texto__txt");
    gsap.set(alvo, { visibility: "visible" });
    if (!temSplit) {
      return gsap.from(alvo, { opacity: 0, y: 40, duration: 1 });
    }
    const split = SplitText.create(alvo, { type: "chars", mask: "chars" });
    return gsap.from(split.chars, {
      yPercent: 115,
      rotation: 6,
      duration: 1.1,
      stagger: 0.07,
      ease: "power4.out",
    });
  }

  function flutuarSelo() {
    gsap.to(".selo", { y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }

  /* ---------- Pétalas caindo no hero ---------- */
  function petalas() {
    const caixa = document.querySelector(".petalas");
    const hero = document.querySelector(".hero");
    if (!caixa) return () => {};

    const cores = ["#f6cfd4", "#eeb3bc", "#f9dfe2", "#e9a3ae", "#fbe3d6"];
    const total = window.innerWidth < 700 ? 7 : 14;
    const ativas = new Set();
    let ligado = true;
    let rodando = true;

    function cair(el, primeira) {
      if (!ligado) return;
      const largura = caixa.offsetWidth;
      const altura = caixa.offsetHeight;
      const duracao = random(8, 14);

      gsap.set(el, { x: random(0, largura), y: -40, rotation: random(0, 360), scale: random(0.6, 1.3), opacity: 0 });
      const tl = gsap.timeline({
        delay: primeira ? random(0.5, 9) : random(0, 2),
        onComplete() {
          ativas.delete(tl);
          cair(el);
        },
      });
      tl.to(el, { y: altura + 40, duration: duracao, ease: "none" })
        .to(el, { x: `+=${random(-70, 70)}`, duration: duracao / 3, ease: "sine.inOut", yoyo: true, repeat: 2 }, 0)
        .to(el, { rotation: `+=${random(-300, 300)}`, rotationX: random(-180, 180), duration: duracao, ease: "none" }, 0)
        .to(el, { opacity: random(0.6, 0.95), duration: 1.2 }, 0)
        .to(el, { opacity: 0, duration: 1.5 }, duracao - 1.5);
      if (!rodando) tl.pause();
      ativas.add(tl);
    }

    for (let i = 0; i < total; i++) {
      const el = document.createElement("span");
      el.className = "petala";
      el.innerHTML = `<svg viewBox="0 0 20 28"><path d="M10 1C16 7 19 15 10 27 1 15 4 7 10 1z" fill="${cores[i % cores.length]}"/></svg>`;
      caixa.append(el);
      cair(el, true);
    }

    // Pausa as pétalas quando o hero sai da tela
    const st = ScrollTrigger.create({
      trigger: hero,
      start: "top bottom",
      end: "bottom top",
      onToggle(self) {
        rodando = self.isActive;
        ativas.forEach((tl) => (rodando ? tl.resume() : tl.pause()));
      },
    });

    return () => {
      ligado = false;
      st.kill();
      ativas.forEach((tl) => tl.kill());
      caixa.replaceChildren();
    };
  }

  /* ---------- Parallax do hero ---------- */
  function parallaxHero() {
    const gatilho = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__texto", { y: -90, ease: "none", scrollTrigger: gatilho });
    gsap.to(".hero__midia", { y: 50, ease: "none", scrollTrigger: gatilho });
    gsap.utils.toArray(".hero .ramo svg").forEach((svg, i) => {
      gsap.to(svg, { yPercent: i % 2 ? -18 : -30, ease: "none", scrollTrigger: gatilho });
    });
  }

  // Inclinação sutil da foto do hero seguindo o mouse
  function inclinarHero() {
    const hero = document.querySelector(".hero");
    const midia = document.querySelector(".hero__midia");
    gsap.set(midia, { transformPerspective: 1000 });
    const rotX = gsap.quickTo(midia, "rotationX", { duration: 0.9, ease: "power3.out" });
    const rotY = gsap.quickTo(midia, "rotationY", { duration: 0.9, ease: "power3.out" });

    function mover(e) {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rotY(px * 8);
      rotX(py * -6);
    }
    function sair() {
      rotX(0);
      rotY(0);
    }
    hero.addEventListener("pointermove", mover);
    hero.addEventListener("pointerleave", sair);
    return () => {
      hero.removeEventListener("pointermove", mover);
      hero.removeEventListener("pointerleave", sair);
    };
  }

  /* ---------- Reveals genéricos ---------- */
  function reveals() {
    gsap.utils.toArray("[data-split]").forEach((titulo) => {
      if (!temSplit) {
        gsap.set(titulo, { visibility: "visible" });
        gsap.from(titulo, { opacity: 0, y: 30, duration: 0.9, scrollTrigger: { trigger: titulo, start: "top 88%", once: true } });
        return;
      }
      SplitText.create(titulo, {
        type: "words,lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          gsap.set(titulo, { visibility: "visible" });
          return gsap.from(self.words, {
            yPercent: 110,
            duration: 1,
            stagger: 0.06,
            ease: "power4.out",
            scrollTrigger: { trigger: titulo, start: "top 88%", once: true },
          });
        },
      });
    });

    ScrollTrigger.batch("[data-revela]", {
      start: "top 90%",
      once: true,
      onEnter: (lote) => revelar(lote, { stagger: 0.14 }),
    });

    ScrollTrigger.batch(".produto", {
      start: "top 92%",
      once: true,
      onEnter: (lote) => revelar(lote, { stagger: 0.09, duration: 1 }),
    });
  }

  /* ---------- Sobre: linhas se desenhando ---------- */
  function sobre() {
    const gatilho = { trigger: ".sobre", start: "top 72%", once: true };
    gsap.to(".bloco__linha", { scaleX: 1, duration: 1.3, ease: "power3.inOut", stagger: 0.3, delay: 0.3, scrollTrigger: gatilho });
    gsap.to(".sobre__divisor", { scaleX: 1, scaleY: 1, duration: 1.6, ease: "power3.inOut", scrollTrigger: { ...gatilho } });
  }

  /* ---------- Fotos que se abrem e fazem parallax por dentro ---------- */
  function fotosComMascara() {
    gsap.utils.toArray(".foto-mascara").forEach((fig, i) => {
      const img = fig.querySelector("img");
      const raio = getComputedStyle(fig).borderRadius;
      const gatilho = { trigger: fig, start: "top 86%", once: true };

      gsap.fromTo(fig,
        { clipPath: `inset(100% 0% 0% 0% round ${raio})` },
        { clipPath: `inset(0% 0% 0% 0% round ${raio})`, duration: 1.5, ease: "power4.inOut", delay: (i % 2) * 0.18, onComplete: semMascara, scrollTrigger: gatilho });
      gsap.from(img, { scale: 1.3, duration: 1.9, ease: "power3.out", delay: (i % 2) * 0.18, scrollTrigger: { ...gatilho } });
      gsap.fromTo(img, { yPercent: 0 }, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  /* ---------- Faixa infinita que acelera com a velocidade do scroll ---------- */
  function faixa() {
    const loop = gsap.to(".faixa__trilho", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

    ScrollTrigger.create({
      trigger: ".faixa",
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate(self) {
        const alvo = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 5);
        gsap.to(loop, {
          timeScale: alvo,
          duration: 0.2,
          overwrite: true,
          onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 }),
        });
      },
    });
  }

  /* ---------- Ramos fora do hero: desenham ao entrar e sobem no parallax ---------- */
  function ramosNoScroll() {
    gsap.utils.toArray(".ramo").forEach((ramo) => {
      if (ramo.closest(".hero")) return;
      const secao = ramo.closest("section");
      ScrollTrigger.create({
        trigger: ramo,
        start: "top 88%",
        once: true,
        onEnter: () => desenharRamos(ramo),
      });
      gsap.to(ramo.querySelector("svg"), {
        yPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: secao, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  /* ---------- Por que nos escolher: cards, ícones desenhados e contador ---------- */
  function vantagens() {
    ScrollTrigger.batch(".vantagem", {
      start: "top 90%",
      once: true,
      onEnter(lote) {
        revelar(lote, { stagger: 0.12 });
        lote.forEach((card, i) => {
          if (temDraw) {
            gsap.from(card.querySelectorAll(".vantagem__icone *"), {
              drawSVG: 0,
              duration: 1.3,
              stagger: 0.12,
              delay: 0.25 + i * 0.12,
              ease: "power2.inOut",
            });
          }
          const num = card.querySelector(".contador");
          if (num) {
            const valor = { n: 0 };
            gsap.to(valor, {
              n: Number(num.dataset.alvo),
              duration: 2,
              delay: 0.3,
              ease: "power2.out",
              onUpdate: () => (num.textContent = Math.round(valor.n)),
            });
          }
        });
      },
    });
  }

  /* ---------- Portfólio: trilho horizontal preso durante o scroll ---------- */
  function portfolioHorizontal() {
    const secao = document.querySelector(".portfolio");
    const trilho = secao.querySelector(".portfolio__trilho");
    secao.classList.add("is-fixado");

    const distancia = () => Math.max(0, trilho.scrollWidth - document.documentElement.clientWidth);

    const mover = gsap.to(trilho, {
      x: () => -distancia(),
      ease: "none",
      scrollTrigger: {
        trigger: secao,
        start: "top top",
        end: () => `+=${distancia()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.utils.toArray(".trabalho", trilho).forEach((card) => {
      gsap.fromTo(card.querySelector("img"), { xPercent: -6 }, {
        xPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: mover, start: "left right", end: "right left", scrub: true },
      });
      gsap.from(card.querySelector(".trabalho__legenda"), {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: card, containerAnimation: mover, start: "left 85%", toggleActions: "play none none reverse" },
      });
    });
  }

  /* ---------- Depoimentos: cards e estrelas ---------- */
  function depoimentos() {
    ScrollTrigger.batch(".depoimento", {
      start: "top 90%",
      once: true,
      onEnter(lote) {
        revelar(lote, { stagger: 0.15 });
        lote.forEach((card, i) => {
          gsap.from(card.querySelectorAll(".estrelas i"), {
            scale: 0,
            rotation: -90,
            duration: 0.6,
            stagger: 0.07,
            delay: 0.35 + i * 0.15,
            ease: "back.out(3)",
          });
        });
      },
    });
  }

  /* ---------- Rodapé: palavra gigante sobe letra por letra ---------- */
  function rodape() {
    const palavra = document.querySelector(".rodape__gigante");
    if (!palavra) return;
    const alvos = temSplit ? SplitText.create(palavra, { type: "chars" }).chars : palavra;
    gsap.from(alvos, {
      yPercent: 80,
      opacity: 0,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: ".rodape", start: "top 85%", end: "bottom bottom", scrub: 1 },
    });
  }
})();
