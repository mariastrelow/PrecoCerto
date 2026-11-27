const CATEGORIAS_PADRAO = ["Lanches", "Pizzas", "Doces", "Salgados", "Bebidas", "Outros"];

async function carregarDados() {
  const aviso = document.getElementById("aviso-dados");
  aviso.textContent = "Carregando dados...";
  aviso.className = "aviso";
  aviso.hidden = false;

  try {
    const resposta = await fetch("data/dados.json");
    if (!resposta.ok) {
      throw new Error("Status " + resposta.status);
    }
    const dados = await resposta.json();

    estado.categorias = Array.isArray(dados.categorias) ? dados.categorias : CATEGORIAS_PADRAO;
    estado.dicas = Array.isArray(dados.dicas) ? dados.dicas : [];
    estado.exemplos = Array.isArray(dados.exemplos) ? dados.exemplos : [];
    if (Number.isFinite(dados.margemMinima)) {
      estado.margemMinima = dados.margemMinima;
    }
    aviso.hidden = true;
  } catch (erro) {
    console.error("Falha ao carregar data/dados.json:", erro);
    estado.categorias = CATEGORIAS_PADRAO;
    aviso.textContent = "Não foi possível carregar os dados de apoio. O app continua funcionando com as categorias padrão.";
    aviso.className = "aviso erro-aviso";
  }
}

function calcularEnquantoDigita() {
  const resultado = validarProduto(lerFormulario(), estado.produtos, estado.editandoId);
  const v = resultado.valores;
  const numerosOk = !resultado.erros.custoIngredientes && !resultado.erros.custoEmbalagem &&
    !resultado.erros.taxas && !resultado.erros.margem;

  if (numerosOk) {
    atualizarResultado(calcularPreco(v.custoIngredientes, v.custoEmbalagem, v.taxas, v.margem), v.margem);
  } else {
    atualizarResultado(null);
  }
}

function salvarFormulario(evento) {
  evento.preventDefault();

  const resultado = validarProduto(lerFormulario(), estado.produtos, estado.editandoId);
  mostrarErros(resultado.erros);

  if (!resultado.valido) {
    mostrarMensagem("Corrija os campos destacados.", "erro");
    return;
  }

  const editando = estado.editandoId !== null;
  const deuCerto = editando
    ? editarProduto(estado.editandoId, resultado.valores)
    : adicionarProduto(resultado.valores);

  if (!deuCerto) {
    mostrarMensagem("Não foi possível salvar. Verifique o armazenamento do navegador e tente novamente.", "erro");
    return;
  }

  mostrarMensagem(editando ? "Produto atualizado!" : "Produto salvo com sucesso!");
  limparFormulario();
  atualizarTela();
}

function limparFormulario() {
  document.getElementById("form-produto").reset();
  estado.editandoId = null;
  limparErros();
  atualizarResultado(null);
  atualizarModoEdicao();
}

function cliqueNaTabela(evento) {
  const botao = evento.target.closest("button");
  if (!botao) return;

  const produto = buscarProduto(botao.dataset.id);
  if (!produto) return;

  if (botao.dataset.acao === "editar") {
    estado.editandoId = produto.id;
    preencherFormulario(produto);
    limparErros();
    atualizarModoEdicao();
    calcularEnquantoDigita();
    location.hash = "#calculadora";
  }

  if (botao.dataset.acao === "excluir") {
    if (!confirm('Excluir o produto "' + produto.nome + '"? Essa ação não pode ser desfeita.')) {
      return;
    }
    if (excluirProduto(produto.id)) {
      if (estado.editandoId === produto.id) limparFormulario();
      mostrarMensagem("Produto excluído.");
      atualizarTela();
    } else {
      mostrarMensagem("Não foi possível excluir o produto.", "erro");
    }
  }
}

function excluirTodosProdutos() {
  if (!confirm("Excluir TODOS os produtos cadastrados? Essa ação não pode ser desfeita.")) {
    return;
  }
  if (excluirTodos()) {
    limparFormulario();
    mostrarMensagem("Todos os produtos foram excluídos.");
    atualizarTela();
  } else {
    mostrarMensagem("Não foi possível excluir os produtos.", "erro");
  }
}

function carregarExemplos() {
  if (estado.exemplos.length === 0) {
    mostrarMensagem("Os exemplos não estão disponíveis (dados.json não carregou).", "erro");
    return;
  }
  const lista = estado.exemplos.map(function (ex) {
    return montarProduto(ex, gerarId());
  });
  if (atualizarLista(lista)) {
    mostrarMensagem(lista.length + " produtos de exemplo carregados.");
    atualizarTela();
  } else {
    mostrarMensagem("Não foi possível salvar os exemplos.", "erro");
  }
}

async function copiarResultado() {
  const texto =
    "PreçoCerto - " + (document.getElementById("nome").value.trim() || "Produto") + "\n" +
    "Preço sugerido: " + document.getElementById("res-preco").textContent + "\n" +
    "Custo total: " + document.getElementById("res-custo").textContent + "\n" +
    "Lucro por unidade: " + document.getElementById("res-lucro").textContent + "\n" +
    "Margem: " + document.getElementById("res-margem").textContent;

  if (!navigator.clipboard) {
    mostrarMensagem("Seu navegador não permite copiar automaticamente. Selecione e copie o resultado manualmente.", "erro");
    return;
  }

  try {
    await navigator.clipboard.writeText(texto);
    mostrarMensagem("Resultado copiado!");
  } catch (erro) {
    console.error("Erro ao copiar:", erro);
    mostrarMensagem("Não foi possível copiar. A permissão pode ter sido negada.", "erro");
  }
}

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Este navegador não suporta Service Worker.");
    return;
  }
  navigator.serviceWorker.register("service-worker.js")
    .then(function () {
      console.log("Service Worker registrado.");
    })
    .catch(function (erro) {
      console.error("Erro ao registrar o Service Worker:", erro);
    });
}

async function iniciar() {
  const leitura = lerProdutos();
  estado.produtos = leitura.produtos;

  mostrarRotaAtual();
  atualizarConexao();
  window.addEventListener("online", function () {
    atualizarConexao();
    mostrarMensagem("Conexão restabelecida.");
  });
  window.addEventListener("offline", function () {
    atualizarConexao();
    mostrarMensagem("Você está offline. O app continua funcionando.", "erro");
  });

  document.getElementById("form-produto").addEventListener("submit", salvarFormulario);
  document.getElementById("form-produto").addEventListener("input", calcularEnquantoDigita);
  document.getElementById("botao-cancelar").addEventListener("click", limparFormulario);
  document.getElementById("copiar").addEventListener("click", copiarResultado);
  document.getElementById("tabela-produtos").addEventListener("click", cliqueNaTabela);
  document.getElementById("excluir-todos").addEventListener("click", excluirTodosProdutos);
  document.getElementById("carregar-exemplos").addEventListener("click", carregarExemplos);
  document.getElementById("busca").addEventListener("input", function (e) {
    estado.busca = e.target.value;
    atualizarTabela();
  });
  document.getElementById("filtro-categoria").addEventListener("change", function (e) {
    estado.filtroCategoria = e.target.value;
    atualizarTabela();
  });

  atualizarTela();

  await carregarDados();
  preencherCategorias();
  mostrarDica();
  atualizarTela();

  if (!leitura.ok) {
    mostrarMensagem("Alguns dados salvos estavam corrompidos e foram ignorados.", "erro");
  }

  registrarServiceWorker();
}

iniciar();
