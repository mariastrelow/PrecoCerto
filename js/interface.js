const CAMPOS = ["nome", "categoria", "custoIngredientes", "custoEmbalagem", "taxas", "margem"];

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

let timerMensagem = null;

function mostrarMensagem(texto, tipo) {
  const caixa = document.getElementById("mensagem");
  caixa.textContent = texto;
  caixa.className = tipo === "erro" ? "mensagem erro-msg" : "mensagem";
  caixa.hidden = false;

  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(function () {
    caixa.hidden = true;
  }, 4000);
}

function preencherCategorias() {
  const selectForm = document.getElementById("categoria");
  const selectFiltro = document.getElementById("filtro-categoria");

  selectForm.innerHTML = '<option value="">Selecione...</option>';
  selectFiltro.innerHTML = '<option value="todas">Todas</option>';

  for (const categoria of estado.categorias) {
    selectForm.innerHTML += "<option>" + escaparHTML(categoria) + "</option>";
    selectFiltro.innerHTML += "<option>" + escaparHTML(categoria) + "</option>";
  }
}

function mostrarErros(erros) {
  for (const campo of CAMPOS) {
    const input = document.getElementById(campo);
    const span = document.getElementById("erro-" + campo);
    if (erros[campo]) {
      span.textContent = erros[campo];
      input.setAttribute("aria-invalid", "true");
    } else {
      span.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  const primeiro = CAMPOS.find(function (c) { return erros[c]; });
  if (primeiro) {
    document.getElementById(primeiro).focus();
  }
}

function limparErros() {
  mostrarErros({});
}

function lerFormulario() {
  const dados = {};
  for (const campo of CAMPOS) {
    dados[campo] = document.getElementById(campo).value;
  }
  return dados;
}

function preencherFormulario(produto) {
  document.getElementById("nome").value = produto.nome;
  document.getElementById("categoria").value = produto.categoria;
  document.getElementById("custoIngredientes").value = String(produto.custoIngredientes).replace(".", ",");
  document.getElementById("custoEmbalagem").value = String(produto.custoEmbalagem).replace(".", ",");
  document.getElementById("taxas").value = String(produto.taxas).replace(".", ",");
  document.getElementById("margem").value = String(produto.margem).replace(".", ",");
}

function atualizarModoEdicao() {
  const editando = estado.editandoId !== null;
  document.getElementById("titulo-calculadora").textContent = editando ? "Editar produto" : "Calculadora de precificação";
  document.getElementById("botao-salvar").textContent = editando ? "Salvar alterações" : "Salvar produto";
  document.getElementById("botao-cancelar").hidden = !editando;
}

function atualizarResultado(calculo, margem) {
  if (!calculo) {
    document.getElementById("res-preco").textContent = "R$ 0,00";
    document.getElementById("res-custo").textContent = "R$ 0,00";
    document.getElementById("res-taxas").textContent = "R$ 0,00";
    document.getElementById("res-lucro").textContent = "R$ 0,00";
    document.getElementById("res-margem").textContent = "0%";
    return;
  }
  document.getElementById("res-preco").textContent = formatarDinheiro(calculo.preco);
  document.getElementById("res-custo").textContent = formatarDinheiro(calculo.custoTotal);
  document.getElementById("res-taxas").textContent = formatarDinheiro(calculo.valorTaxas);
  document.getElementById("res-lucro").textContent = formatarDinheiro(calculo.lucro);
  document.getElementById("res-margem").textContent = formatarPorcentagem(margem);
}

function atualizarTabela() {
  const corpo = document.getElementById("tabela-produtos");
  const lista = produtosFiltrados();

  document.getElementById("excluir-todos").hidden = estado.produtos.length === 0;

  if (lista.length === 0) {
    const texto = estado.produtos.length === 0
      ? "Nenhum produto cadastrado. Use a Calculadora para adicionar."
      : "Nenhum produto encontrado com esse filtro.";
    corpo.innerHTML = '<tr><td colspan="7">' + texto + "</td></tr>";
    return;
  }

  let html = "";
  for (const p of lista) {
    const classeMargem = p.margem < estado.margemMinima ? ' class="margem-baixa"' : "";
    html += "<tr>" +
      "<td>" + escaparHTML(p.nome) + "</td>" +
      "<td>" + escaparHTML(p.categoria) + "</td>" +
      "<td>" + formatarDinheiro(p.custoTotal) + "</td>" +
      "<td>" + formatarDinheiro(p.preco) + "</td>" +
      "<td>" + formatarDinheiro(p.lucro) + "</td>" +
      "<td" + classeMargem + ">" + formatarPorcentagem(p.margem) + "</td>" +
      '<td><button class="botao azul pequeno" data-acao="editar" data-id="' + p.id + '">Editar</button>' +
      '<button class="botao vermelho pequeno" data-acao="excluir" data-id="' + p.id + '">Excluir</button></td>' +
      "</tr>";
  }
  corpo.innerHTML = html;
}

function desenharBarras(idElemento, itens, classeBarra) {
  const elemento = document.getElementById(idElemento);
  const maior = Math.max(...itens.map(function (i) { return i.valor; }), 1);

  let html = "";
  for (const item of itens) {
    const largura = (item.valor / maior) * 100;
    html += '<div class="barra-linha">' +
      '<span title="' + escaparHTML(item.nome) + '">' + escaparHTML(item.nome) + "</span>" +
      '<div class="barra ' + classeBarra + '"><div style="width:' + largura + '%"></div></div>' +
      "<strong>" + item.texto + "</strong>" +
      "</div>";
  }
  elemento.innerHTML = html;
}

function atualizarDashboard() {
  const produtos = estado.produtos;
  const temProdutos = produtos.length > 0;

  document.getElementById("ind-quantidade").textContent = produtos.length;
  document.getElementById("ind-custo").textContent = formatarDinheiro(media(produtos, "custoTotal"));
  document.getElementById("ind-preco").textContent = formatarDinheiro(media(produtos, "preco"));
  document.getElementById("ind-margem").textContent = formatarPorcentagem(media(produtos, "margem"));

  document.getElementById("dashboard-vazio").hidden = temProdutos;
  document.getElementById("dashboard-conteudo").hidden = !temProdutos;
  if (!temProdutos) return;

  const ordenados = produtos.slice().sort(function (a, b) { return b.lucro - a.lucro; });
  const top5 = ordenados.slice(0, 5).map(function (p) {
    return { nome: p.nome, valor: p.lucro, texto: formatarDinheiro(p.lucro) };
  });
  desenharBarras("grafico-lucro", top5, "");

  const contagem = {};
  for (const p of produtos) {
    contagem[p.categoria] = (contagem[p.categoria] || 0) + 1;
  }
  const categorias = Object.keys(contagem).map(function (nome) {
    return { nome: nome, valor: contagem[nome], texto: contagem[nome] + " un." };
  });
  desenharBarras("grafico-categorias", categorias, "categoria");

  const baixa = produtos.filter(function (p) { return p.margem < estado.margemMinima; });
  const lista = document.getElementById("lista-alertas");
  if (baixa.length === 0) {
    lista.innerHTML = "<li>Todos os produtos estão com margem de pelo menos " + estado.margemMinima + "%.</li>";
  } else {
    lista.innerHTML = baixa.map(function (p) {
      return "<li><strong>" + escaparHTML(p.nome) + "</strong> está com margem de " +
        formatarPorcentagem(p.margem) + " (recomendado: " + estado.margemMinima + "% ou mais).</li>";
    }).join("");
  }

  const menorMargem = produtos.slice().sort(function (a, b) { return a.margem - b.margem; })[0];
  document.getElementById("destaque-maior").textContent = ordenados[0].nome + " (" + formatarDinheiro(ordenados[0].lucro) + ")";
  document.getElementById("destaque-menor").textContent = menorMargem.nome + " (" + formatarPorcentagem(menorMargem.margem) + ")";
}

function mostrarDica() {
  const elemento = document.getElementById("dica");
  if (estado.dicas.length === 0) {
    elemento.hidden = true;
    return;
  }
  const sorteio = Math.floor(Math.random() * estado.dicas.length);
  elemento.textContent = "Dica: " + estado.dicas[sorteio];
  elemento.hidden = false;
}

function atualizarTela() {
  atualizarDashboard();
  atualizarTabela();
}

function atualizarConexao() {
  const status = document.getElementById("status-conexao");
  if (navigator.onLine) {
    status.textContent = "● Online";
    status.className = "conexao online";
  } else {
    status.textContent = "● Offline - usando dados salvos";
    status.className = "conexao offline";
  }
}
