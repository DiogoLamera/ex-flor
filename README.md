# Pétala Ateliê Floral

Landing page de demonstração para uma floricultura, feita para apresentar a ideia ao cliente.
Todos os dados (nome da loja, preços, endereço, telefone, depoimentos) são fictícios.

## Como abrir

Não precisa de build. Basta abrir o `index.html` no navegador.

Se preferir um servidor local:

```bash
npx serve .
# ou
python -m http.server 8080
```

## Stack

- HTML, CSS e JavaScript puros
- [GSAP 3.15](https://gsap.com) (ScrollTrigger, SplitText e DrawSVG), via CDN
- [Lenis](https://lenis.dev) para o scroll suave
- Fontes Alegreya e Alegreya SC (Google Fonts)

## Estrutura

```
index.html
css/style.css        estilos, estados iniciais das animações e responsivo
js/ramos.js          gera os ramos de folhas em traço fino (SVG)
js/main.js           scroll suave, topo, menu mobile, sacola e formulário
js/animacoes.js      abertura, hero, reveals no scroll, parallax e portfólio horizontal
assets/img/          fotos
```

## Seções e animações

- **Abertura**: flor do logo se desenha e a cortina revela a página
- **Hero**: foto abre com máscara, título "FLORES" sobe letra por letra, ramos se desenham, pétalas caem e a foto inclina seguindo o mouse
- **Nossos buquês / preços**: linhas se desenham e as fotos abrem com parallax por dentro
- **Faixa de flores**: rolagem infinita que acelera conforme a velocidade do scroll
- **Buquês em alta**: cards entram em sequência; o preço vira botão e a miniatura voa até a sacola
- **Por que nos escolher?**: ícones se desenham e o contador de lojas anima
- **Portfólio**: no desktop a seção fica presa e os trabalhos passam na horizontal; no celular vira carrossel de arrastar
- **Depoimentos, contato e rodapé**: reveals, validação do formulário com máscara de telefone e a palavra "pétala" subindo letra por letra

A sacola e o formulário funcionam só na página, sem enviar nada.

## Acessibilidade

Com `prefers-reduced-motion: reduce` ativo, a página abre sem abertura, sem scroll suave e sem animações grandes, com todo o conteúdo visível.
Se o GSAP não carregar, o conteúdo também aparece normalmente.

## Créditos

Fotos do [Unsplash](https://unsplash.com), sob a licença Unsplash.
