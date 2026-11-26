function calcularPreco(custoIngredientes, custoEmbalagem, taxas, margem) {
  const custoTotal = custoIngredientes + custoEmbalagem;
  const divisor = 1 - (taxas + margem) / 100;
  const preco = custoTotal / divisor;
  const valorTaxas = preco * (taxas / 100);
  const lucro = preco * (margem / 100);

  return {
    custoTotal: arredondar(custoTotal),
    preco: arredondar(preco),
    valorTaxas: arredondar(valorTaxas),
    lucro: arredondar(lucro)
  };
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarPorcentagem(valor) {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
}

function media(lista, campo) {
  if (lista.length === 0) return 0;
  let soma = 0;
  for (const item of lista) {
    soma += item[campo];
  }
  return soma / lista.length;
}
