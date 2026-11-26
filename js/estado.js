const estado = {
  produtos: [],
  categorias: [],
  dicas: [],
  exemplos: [],
  margemMinima: 15,
  editandoId: null,
  busca: "",
  filtroCategoria: "todas"
};

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function montarProduto(valores, id) {
  const calculo = calcularPreco(
    valores.custoIngredientes,
    valores.custoEmbalagem,
    valores.taxas,
    valores.margem
  );
  return {
    id: id,
    nome: valores.nome,
    categoria: valores.categoria,
    custoIngredientes: valores.custoIngredientes,
    custoEmbalagem: valores.custoEmbalagem,
    taxas: valores.taxas,
    margem: valores.margem,
    custoTotal: calculo.custoTotal,
    preco: calculo.preco,
    lucro: calculo.lucro
  };
}

function atualizarLista(novaLista) {
  if (!salvarProdutos(novaLista)) {
    return false;
  }
  estado.produtos = novaLista;
  return true;
}

function adicionarProduto(valores) {
  const produto = montarProduto(valores, gerarId());
  return atualizarLista(estado.produtos.concat(produto));
}

function editarProduto(id, valores) {
  const novaLista = estado.produtos.map(function (p) {
    return p.id === id ? montarProduto(valores, id) : p;
  });
  return atualizarLista(novaLista);
}

function excluirProduto(id) {
  const novaLista = estado.produtos.filter(function (p) {
    return p.id !== id;
  });
  return atualizarLista(novaLista);
}

function excluirTodos() {
  return atualizarLista([]);
}

function buscarProduto(id) {
  return estado.produtos.find(function (p) {
    return p.id === id;
  });
}

function produtosFiltrados() {
  const busca = estado.busca.trim().toLowerCase();
  return estado.produtos.filter(function (p) {
    const passaBusca = p.nome.toLowerCase().includes(busca);
    const passaCategoria = estado.filtroCategoria === "todas" || p.categoria === estado.filtroCategoria;
    return passaBusca && passaCategoria;
  });
}
