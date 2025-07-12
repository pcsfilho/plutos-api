const axios = require("axios");
const prompt = require("prompt-sync")({ sigint: true });

// Função para obter IPCA mais recente via IBGE (SIDRA)
async function obterIPCA() {
  try {
    const url = "https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63/p/last";
    const response = await axios.get(url);
    const valor = parseFloat(response.data[1]["V"].replace(",", "."));
    return valor;
  } catch (error) {
    console.error("Erro ao obter IPCA:", error.message);
    return null;
  }
}

// Função para obter variação de M2 nos últimos 12 meses via Banco Central (SGS)
async function obterExpansaoMonetaria() {
  try {
    const url =
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.2755/dados/ultimos/13?formato=json";
    const response = await axios.get(url);
    const valores = response.data;

    const valorAtual = parseFloat(
      valores[valores.length - 1].valor.replace(",", ".")
    );
    const valorAnterior = parseFloat(valores[0].valor.replace(",", "."));
    const crescimento = ((valorAtual - valorAnterior) / valorAnterior) * 100;

    return crescimento;
  } catch (error) {
    console.error("Erro ao obter expansão monetária:", error.message);
    return null;
  }
}

// Função para calcular a inflação pessoal
function calcularInflacaoPessoal(categorias) {
  let inflacaoTotal = 0;
  for (const cat of categorias) {
    inflacaoTotal += (cat.peso / 100) * cat.inflacao;
  }
  return inflacaoTotal;
}

// Função principal
async function main() {
  console.log("=== Calculadora de Rentabilidade Mínima ===\n");

  const categorias = [];
  const numCategorias = parseInt(
    prompt("Quantas categorias deseja adicionar? ")
  );

  for (let i = 0; i < numCategorias; i++) {
    const nome = prompt(`Nome da categoria #${i + 1}: `);
    const peso = parseFloat(prompt(`Peso no orçamento (em %): `));
    const inflacao = parseFloat(
      prompt(`Inflação da categoria nos últimos 12 meses (em %): `)
    );
    categorias.push({ nome, peso, inflacao });
  }

  const inflacaoPessoal = calcularInflacaoPessoal(categorias);
  console.log(`\nInflação pessoal estimada: ${inflacaoPessoal.toFixed(2)}%`);

  const ipca = await obterIPCA();
  if (ipca !== null) {
    console.log(`IPCA oficial (último mês): ${ipca.toFixed(2)}%`);
  }

  const expansaoMonetaria = await obterExpansaoMonetaria();
  if (expansaoMonetaria !== null) {
    console.log(
      `Expansão monetária (M2 - últimos 12 meses): ${expansaoMonetaria.toFixed(
        2
      )}%`
    );
  }

  const ganhoReal = parseFloat(
    prompt("\nQual ganho real (acima da inflação) você deseja? (%): ")
  );

  const rentabilidadeMinimaPessoal = inflacaoPessoal + ganhoReal;
  console.log(
    `\nRentabilidade mínima baseada na inflação pessoal: ${rentabilidadeMinimaPessoal.toFixed(
      2
    )}%`
  );

  if (ipca !== null) {
    const rentabilidadeMinimaIPCA = ipca + ganhoReal;
    console.log(
      `Rentabilidade mínima baseada no IPCA: ${rentabilidadeMinimaIPCA.toFixed(
        2
      )}%`
    );
  }

  if (expansaoMonetaria !== null) {
    const rentabilidadeMinimaExpansao = expansaoMonetaria + ganhoReal;
    console.log(
      `Rentabilidade mínima baseada na expansão monetária: ${rentabilidadeMinimaExpansao.toFixed(
        2
      )}%`
    );
  }
}

main();
