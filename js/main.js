/* Interações da página: scroll suave, topo, menu, sacola, formulário e avisos */
(function () {
  const raiz = document.documentElement;
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  // Sem GSAP, nada pode ficar escondido esperando uma animação que não vai rodar
  if (!temGsap) raiz.classList.remove("anim");

  // Rede de segurança: se a abertura travar por qualquer motivo, a página aparece
  setTimeout(() => {
    if (raiz.classList.contains("anim") && !raiz.classList.contains("intro-feita")) {
      raiz.classList.remove("anim");
      App.lenis?.start();
    }
  }, 7000);

  const App = (window.App = { lenis: null });

  /* ---------- Scroll suave (Lenis + ticker do GSAP, um único loop de raf) ---------- */
  if (!semMovimento && typeof window.Lenis !== "undefined") {
    if (temGsap) {
      gsap.registerPlugin(ScrollTrigger);
      App.lenis = new Lenis({ autoRaf: false });
      App.lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => App.lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      App.lenis = new Lenis({ autoRaf: true });
    }
  }

  function rolarPara(alvo) {
    if (App.lenis) {
      App.lenis.scrollTo(alvo, { duration: 1.4 });
    } else if (alvo === 0) {
      window.scrollTo({ top: 0, behavior: semMovimento ? "auto" : "smooth" });
    } else {
      alvo.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth", block: "start" });
    }
  }
  App.rolarPara = rolarPara;

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    e.preventDefault();
    if (id === "#") return;
    const alvo = document.querySelector(id);
    if (!alvo) return;
    alternarMenu(false);
    rolarPara(alvo);
    alvo.setAttribute("tabindex", "-1");
    alvo.focus({ preventScroll: true });
  });

  /* ---------- Avisos ---------- */
  const aviso = document.querySelector(".aviso");
  let avisoTimer;
  function avisar(msg) {
    aviso.textContent = msg;
    aviso.classList.add("is-visivel");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("is-visivel"), 3200);
  }
  App.avisar = avisar;

  /* ---------- Topo: fundo ao rolar, esconde descendo, volta subindo ---------- */
  const topo = document.querySelector(".topo");
  const voltarTopo = document.querySelector(".voltar-topo");
  let ultimoY = window.scrollY;

  function aoRolar(y) {
    topo.classList.toggle("is-rolado", y > 20);
    if (!document.body.classList.contains("menu-aberto") && Math.abs(y - ultimoY) > 4) {
      topo.classList.toggle("is-escondido", y > ultimoY && y > 420);
    }
    voltarTopo.classList.toggle("is-visivel", y > 700);
    ultimoY = y;
  }
  if (App.lenis) App.lenis.on("scroll", ({ scroll }) => aoRolar(scroll));
  else window.addEventListener("scroll", () => aoRolar(window.scrollY), { passive: true });
  aoRolar(window.scrollY);

  voltarTopo.addEventListener("click", () => rolarPara(0));

  // Link ativo no menu conforme a seção visível
  const linksMenu = document.querySelectorAll(".menu__lista a");
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        linksMenu.forEach((a) => a.classList.toggle("is-ativo", a.getAttribute("href") === `#${entrada.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["inicio", "loja", "portfolio", "contato"].forEach((id) => {
    const secao = document.getElementById(id);
    if (secao) observador.observe(secao);
  });

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.querySelector(".menu-btn");

  function travarRolagem(travar) {
    if (App.lenis) travar ? App.lenis.stop() : App.lenis.start();
    else raiz.style.overflow = travar ? "hidden" : "";
  }

  function alternarMenu(abrir = !document.body.classList.contains("menu-aberto")) {
    const estava = document.body.classList.contains("menu-aberto");
    if (abrir === estava) return;
    document.body.classList.toggle("menu-aberto", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    if (abrir) topo.classList.remove("is-escondido");
    travarRolagem(abrir);
  }

  menuBtn.addEventListener("click", () => alternarMenu());
  window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && alternarMenu(false));

  /* ---------- Sacola ---------- */
  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const itens = new Map();
  const sacola = document.querySelector(".sacola");
  const sacolaBtn = document.querySelector(".sacola-btn");
  const sacolaQtd = sacolaBtn.querySelector(".sacola-btn__qtd");
  const lista = sacola.querySelector(".sacola__lista");
  const totalEl = sacola.querySelector(".sacola__total strong");
  const fecharBtn = sacola.querySelector(".sacola__fechar");
  const veu = document.querySelector(".veu");

  function criarItem(item) {
    const li = document.createElement("li");
    li.className = "item";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = "";
    img.width = 64;
    img.height = 64;

    const info = document.createElement("div");
    const nome = document.createElement("p");
    nome.className = "item__nome";
    nome.textContent = item.nome;
    const preco = document.createElement("p");
    preco.className = "item__preco";
    preco.textContent = moeda.format(item.preco);
    info.append(nome, preco);

    const qtd = document.createElement("div");
    qtd.className = "item__qtd";
    const menos = document.createElement("button");
    menos.type = "button";
    menos.textContent = "−";
    menos.setAttribute("aria-label", `Tirar um ${item.nome}`);
    menos.addEventListener("click", () => mudarQtd(item.id, -1));
    const valor = document.createElement("output");
    valor.textContent = item.qtd;
    const mais = document.createElement("button");
    mais.type = "button";
    mais.textContent = "+";
    mais.setAttribute("aria-label", `Adicionar mais um ${item.nome}`);
    mais.addEventListener("click", () => mudarQtd(item.id, 1));
    qtd.append(menos, valor, mais);

    li.append(img, info, qtd);
    return li;
  }

  function renderizar() {
    let total = 0;
    let quantidade = 0;
    lista.replaceChildren();
    itens.forEach((item) => {
      total += item.preco * item.qtd;
      quantidade += item.qtd;
      lista.append(criarItem(item));
    });
    totalEl.textContent = moeda.format(total);
    sacolaQtd.textContent = quantidade;
    sacola.classList.toggle("tem-itens", quantidade > 0);
    sacolaBtn.classList.toggle("tem-itens", quantidade > 0);
    sacolaBtn.setAttribute("aria-label", `Abrir sacola, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`);
  }

  function mudarQtd(id, delta) {
    const item = itens.get(id);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) itens.delete(id);
    renderizar();
    if (!itens.size) fecharBtn.focus();
  }

  function sacudirSacola() {
    if (!temGsap || semMovimento) return;
    gsap.fromTo(sacolaBtn.querySelector("svg"), { rotation: -16 }, { rotation: 0, duration: 0.9, ease: "elastic.out(1.2, 0.3)" });
    gsap.fromTo(sacolaQtd, { scale: 1.7 }, { scale: 1, duration: 0.7, ease: "back.out(3)", clearProps: "transform" });
  }

  // Miniatura do buquê voa em arco até o ícone da sacola
  function voarParaSacola(foto, aoChegar) {
    if (!temGsap || semMovimento) return aoChegar();
    topo.classList.remove("is-escondido");

    const de = foto.getBoundingClientRect();
    const para = sacolaBtn.getBoundingClientRect();
    const voo = document.createElement("img");
    voo.src = foto.currentSrc || foto.src;
    voo.alt = "";
    voo.className = "voo";
    document.body.append(voo);

    const x0 = de.left + de.width / 2 - 32;
    const y0 = de.top + de.height / 2 - 32;
    const x1 = para.left + para.width / 2 - 32;
    const y1 = para.top + para.height / 2 - 32;

    gsap.set(voo, { left: 0, top: 0, x: x0, y: y0, scale: 0.4, opacity: 0 });
    gsap
      .timeline({ onComplete: () => { voo.remove(); aoChegar(); } })
      .to(voo, { scale: 1.5, opacity: 1, duration: 0.3, ease: "back.out(2)" })
      .to(voo, { x: x1, duration: 0.8, ease: "power2.inOut" }, 0.25)
      .to(voo, { y: y1, duration: 0.8, ease: "back.in(1.6)" }, 0.25)
      .to(voo, { scale: 0.3, duration: 0.8, ease: "power2.in" }, 0.25);
  }

  document.querySelectorAll(".preco").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { id, nome, preco, img } = btn.dataset;
      const item = itens.get(id) || { id, nome, preco: Number(preco), img, qtd: 0 };
      item.qtd += 1;
      itens.set(id, item);
      voarParaSacola(btn.closest(".produto").querySelector("img"), () => {
        renderizar();
        sacudirSacola();
      });
      avisar(`${nome} foi para a sacola`);
    });
  });

  let focoAntes = null;
  function abrirSacola(abrir) {
    sacola.classList.toggle("is-aberta", abrir);
    sacola.setAttribute("aria-hidden", String(!abrir));
    sacola.inert = !abrir;
    sacolaBtn.setAttribute("aria-expanded", String(abrir));
    travarRolagem(abrir);

    if (abrir) {
      focoAntes = document.activeElement;
      veu.hidden = false;
      void veu.offsetWidth; // força o reflow para a transição de opacidade rodar
      veu.classList.add("is-visivel");
      fecharBtn.focus();
    } else {
      veu.classList.remove("is-visivel");
      setTimeout(() => { if (!sacola.classList.contains("is-aberta")) veu.hidden = true; }, 400);
      (focoAntes || sacolaBtn).focus();
    }
  }

  sacolaBtn.addEventListener("click", () => abrirSacola(true));
  fecharBtn.addEventListener("click", () => abrirSacola(false));
  veu.addEventListener("click", () => abrirSacola(false));
  sacola.querySelector("[data-finalizar]").addEventListener("click", () => {
    avisar(itens.size ? "Site de demonstração: nenhum pedido foi enviado." : "Escolha um buquê primeiro.");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sacola.classList.contains("is-aberta")) abrirSacola(false);
    else if (document.body.classList.contains("menu-aberto")) {
      alternarMenu(false);
      menuBtn.focus();
    }
  });

  /* ---------- Formulário ---------- */
  const form = document.querySelector(".formulario");
  const telefone = form.querySelector("#telefone");

  // Máscara simples: (11) 91234-5678
  telefone.addEventListener("input", () => {
    const d = telefone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    telefone.value = v;
  });

  function marcarErro(input, msg) {
    const campo = input.closest(".campo");
    campo.classList.toggle("is-erro", Boolean(msg));
    let erro = campo.querySelector(".campo__erro");
    if (msg && !erro) {
      erro = document.createElement("span");
      erro.className = "campo__erro";
      erro.id = `${input.id}-erro`;
      campo.append(erro);
    }
    if (erro) erro.textContent = msg || "";
    input.setAttribute("aria-invalid", String(Boolean(msg)));
    if (msg) input.setAttribute("aria-describedby", `${input.id}-erro`);
    else input.removeAttribute("aria-describedby");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.querySelector("#nome");
    const erroNome = nome.value.trim().length < 2 ? "Conte pra gente o seu nome." : "";
    const erroTel = telefone.value.replace(/\D/g, "").length < 10 ? "Informe um WhatsApp com DDD." : "";
    marcarErro(nome, erroNome);
    marcarErro(telefone, erroTel);
    if (erroNome || erroTel) {
      (erroNome ? nome : telefone).focus();
      return;
    }

    const botao = form.querySelector(".botao span");
    const primeiroNome = nome.value.trim().split(" ")[0];
    botao.textContent = "Pedido enviado!";
    avisar(`Obrigado, ${primeiroNome}! Como é uma demonstração, nada foi enviado de verdade.`);
    form.reset();
    setTimeout(() => (botao.textContent = "Enviar pedido"), 3500);
  });
})();
