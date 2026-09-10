/* Interações da página: scroll suave, topo, menu, links de WhatsApp e formulário */
(function () {
  // Número que recebe as encomendas: DDI + DDD + número, só dígitos.
  // Fictício para a demonstração; troque pelo WhatsApp real da loja.
  const WHATSAPP = "5511900000000";
  const MENSAGEM_PADRAO = "Olá! Vim pelo site e quero fazer uma encomenda.";

  const raiz = document.documentElement;
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const App = (window.App = { lenis: null });

  // Sem GSAP, nada pode ficar escondido esperando uma animação que não vai rodar
  if (!temGsap) raiz.classList.remove("anim");

  // Rede de segurança: se a abertura travar por qualquer motivo, a página aparece
  setTimeout(() => {
    if (raiz.classList.contains("anim") && !raiz.classList.contains("intro-feita")) {
      raiz.classList.remove("anim");
      App.lenis?.start();
    }
  }, 7000);

  /* ---------- WhatsApp ---------- */
  const linkWhats = (mensagem) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

  document.querySelectorAll("[data-whats]").forEach((link) => {
    link.href = linkWhats(link.dataset.whats || MENSAGEM_PADRAO);
    link.target = "_blank";
    link.rel = "noopener";
  });

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

  /* ---------- Topo: fundo ao rolar, esconde descendo, volta subindo ---------- */
  const topo = document.querySelector(".topo");
  const voltarTopo = document.querySelector(".voltar-topo");
  let ultimoY = window.scrollY;
  let yMenuAberto = 0;

  function aoRolar(y) {
    topo.classList.toggle("is-rolado", y > 20);
    const menuAberto = document.body.classList.contains("menu-aberto");
    if (menuAberto && Math.abs(y - yMenuAberto) > 80) alternarMenu(false);
    if (!menuAberto && Math.abs(y - ultimoY) > 4) {
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
  const linksMenu = document.querySelectorAll('.menu__lista a[href^="#"]');
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

  /* ---------- Menu mobile (painel suspenso abaixo do topo) ---------- */
  const menu = document.querySelector(".menu");
  const menuBtn = document.querySelector(".menu-btn");

  function alternarMenu(abrir = !document.body.classList.contains("menu-aberto")) {
    if (abrir === document.body.classList.contains("menu-aberto")) return;
    document.body.classList.toggle("menu-aberto", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    if (abrir) {
      yMenuAberto = App.lenis ? App.lenis.scroll : window.scrollY;
      topo.classList.remove("is-escondido");
    }
  }

  menuBtn.addEventListener("click", () => alternarMenu());
  menu.addEventListener("click", (e) => e.target.closest("a") && alternarMenu(false));

  // Fecha ao tocar fora do painel, ao apertar Esc ou ao voltar para o desktop
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("menu-aberto")) return;
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) alternarMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-aberto")) {
      alternarMenu(false);
      menuBtn.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && alternarMenu(false));

  /* ---------- Formulário: monta a mensagem e abre o WhatsApp ---------- */
  const form = document.querySelector(".formulario");

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
    marcarErro(nome, erroNome);
    if (erroNome) {
      nome.focus();
      return;
    }

    const ocasiao = form.querySelector("#ocasiao").value;
    const detalhes = form.querySelector("#mensagem").value.trim();
    const linhas = [
      `Olá! Meu nome é ${nome.value.trim()} e quero encomendar um buquê.`,
      `Ocasião: ${ocasiao}`,
      detalhes && `Detalhes: ${detalhes}`,
    ].filter(Boolean);

    window.open(linkWhats(linhas.join("\n")), "_blank", "noopener");
  });
})();
