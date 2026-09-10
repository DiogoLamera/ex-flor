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
js/main.js           scroll suave, topo, menu mobile, links de WhatsApp e formulário
js/animacoes.js      abertura, hero, reveals no scroll, parallax e portfólio horizontal
assets/img/          fotos
```

## Seções e animações

- **Abertura**: flor do logo se desenha e a cortina revela a página
- **Hero**: foto abre com máscara, título "FLORES" sobe letra por letra, ramos se desenham, pétalas caem e a foto inclina seguindo o mouse
- **Nossos buquês / preços**: linhas se desenham e as fotos abrem com parallax por dentro
- **Faixa de flores**: rolagem infinita que acelera conforme a velocidade do scroll
- **Buquês em alta**: cards entram em sequência; o preço vira botão "Encomendar" que abre o WhatsApp com o buquê e o valor
- **Por que nos escolher?**: ícones se desenham e o contador de lojas anima
- **Portfólio**: no desktop a seção fica presa e os trabalhos passam na horizontal; no celular vira carrossel de arrastar
- **Contato**: o formulário monta a mensagem (nome, ocasião e detalhes) e abre o WhatsApp
- **Onde estamos**: endereço, telefone, horário e mapa do Google Maps
- **Rodapé**: a palavra "pétala" sobe letra por letra

## WhatsApp e mapa

Todos os botões de compra levam ao WhatsApp. O número fica em um só lugar, no topo de `js/main.js`:

```js
const WHATSAPP = "5511900000000"; // DDI + DDD + número, só dígitos
```

O número atual é fictício. Troque pelo WhatsApp real da loja antes de publicar.

O mapa aponta para o bairro Jardim Paulista (endereço fictício). Para usar o endereço real, troque o texto
depois de `q=` no `src` do `<iframe>` e no link "Como chegar", ambos na seção "Onde estamos" do `index.html`.

## Acessibilidade

Com `prefers-reduced-motion: reduce` ativo, a página abre sem abertura, sem scroll suave e sem animações grandes, com todo o conteúdo visível.
Se o GSAP não carregar, o conteúdo também aparece normalmente.

## Créditos

Fotos do [Unsplash](https://unsplash.com), sob a licença Unsplash.
