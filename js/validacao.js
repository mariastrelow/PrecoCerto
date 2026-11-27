function converterNumero(texto) {
  const limpo = String(texto).trim().replace(/\s/g, "").replace(",", ".");
  if (limpo === "") return NaN;
  return Number(limpo);
}

function validarProduto(dados, produtos, idEditando) {
  const erros = {};
  const nome = dados.nome.trim().replace(/\s+/g, " ");

  if (nome === "") {
    erros.nome = "Informe o nome do produto.";
  } else if (nome.length < 2) {
    erros.nome = "O nome precisa ter pelo menos 2 letras.";
  } else {
    const repetido = produtos.some(function (p) {
      return p.nome.toLowerCase() === nome.toLowerCase() && p.id !== idEditando;
    });
    if (repetido) {
      erros.nome = "Já existe um produto com esse nome.";
    }
  }

  if (dados.categoria === "") {
    erros.categoria = "Escolha uma categoria.";
  }

  const ingredientes = converterNumero(dados.custoIngredientes);
  if (dados.custoIngredientes.trim() === "") {
    erros.custoIngredientes = "Informe o custo dos ingredientes.";
  } else if (!Number.isFinite(ingredientes)) {
    erros.custoIngredientes = "Use apenas números. Ex.: 12,50";
  } else if (ingredientes <= 0) {
    erros.custoIngredientes = "O custo precisa ser maior que zero.";
  }

  let embalagem = 0;
  if (dados.custoEmbalagem.trim() !== "") {
    embalagem = converterNumero(dados.custoEmbalagem);
    if (!Number.isFinite(embalagem)) {
      erros.custoEmbalagem = "Use apenas números. Ex.: 2,00";
    } else if (embalagem < 0) {
      erros.custoEmbalagem = "O valor não pode ser negativo.";
    }
  }

  const taxas = converterNumero(dados.taxas);
  if (dados.taxas.trim() === "") {
    erros.taxas = "Informe as taxas (use 0 se não tiver).";
  } else if (!Number.isFinite(taxas)) {
    erros.taxas = "Use apenas números. Ex.: 10";
  } else if (taxas < 0 || taxas >= 100) {
    erros.taxas = "As taxas devem ficar entre 0 e 99%.";
  }

  const margem = converterNumero(dados.margem);
  if (dados.margem.trim() === "") {
    erros.margem = "Informe a margem de lucro desejada.";
  } else if (!Number.isFinite(margem)) {
    erros.margem = "Use apenas números. Ex.: 30";
  } else if (margem <= 0 || margem >= 100) {
    erros.margem = "A margem deve ficar entre 1 e 99%.";
  }

  if (!erros.taxas && !erros.margem && taxas + margem >= 100) {
    erros.margem = "Taxas + margem precisam somar menos de 100%.";
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros: erros,
    valores: {
      nome: nome,
      categoria: dados.categoria,
      custoIngredientes: ingredientes,
      custoEmbalagem: embalagem,
      taxas: taxas,
      margem: margem
    }
  };
}
