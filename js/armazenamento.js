const CHAVE_PRODUTOS = "precocerto_produtos";

function lerProdutos() {
  try {
    const texto = localStorage.getItem(CHAVE_PRODUTOS);
    if (texto === null) {
      return { produtos: [], ok: true };
    }

    const dados = JSON.parse(texto);
    if (!Array.isArray(dados)) {
      console.warn("Conteúdo do localStorage não é uma lista. Ignorando.");
      return { produtos: [], ok: false };
    }

    const validos = dados.filter(function (p) {
      return p && typeof p.nome === "string" && Number.isFinite(p.preco);
    });
    return { produtos: validos, ok: validos.length === dados.length };
  } catch (erro) {
    console.error("Erro ao ler os produtos salvos:", erro);
    return { produtos: [], ok: false };
  }
}

function salvarProdutos(produtos) {
  try {
    localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos));
    return true;
  } catch (erro) {
    console.error("Erro ao salvar os produtos:", erro);
    return false;
  }
}
