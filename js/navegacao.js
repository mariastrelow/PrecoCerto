const ROTAS = ["inicio", "calculadora", "produtos", "sobre"];

function mostrarRotaAtual() {
  let rota = location.hash.replace("#", "");

  if (!ROTAS.includes(rota)) {
    rota = "inicio";
    history.replaceState(null, "", "#inicio");
  }

  document.querySelectorAll("main > section").forEach(function (secao) {
    secao.hidden = secao.id !== rota;
  });

  document.querySelectorAll("nav a").forEach(function (link) {
    if (link.getAttribute("href") === "#" + rota) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const titulo = document.querySelector("#" + rota + " h1");
  document.title = titulo.textContent + " | PreçoCerto";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", mostrarRotaAtual);
