// investimento.ts

function calcularRentabilidadeReal(
  taxaNominal: number,
  inflacao: number
): number {
  return (1 + taxaNominal) / (1 + inflacao) - 1;
}

function calcularValorFuturo(
  valorPresente: number,
  inflacao: number,
  tempoMeses: number
): number {
  const tempoAnos = tempoMeses / 12;
  return valorPresente * Math.pow(1 + inflacao, tempoAnos);
}

function calcularAporteMensal(
  valorFuturo: number,
  rentabilidadeReal: number,
  tempoMeses: number
): number {
  const i = rentabilidadeReal / 12;
  return (valorFuturo * i) / (Math.pow(1 + i, tempoMeses) - 1);
}

// Dados de entrada
const taxaNominal = 0.1; // 10% ao ano
const inflacao = 0.0604; // 6,04% ao ano
const tempoMeses = 120;
const valorDesejadoHoje = 120000;

// Cálculos
const rentabilidadeReal = calcularRentabilidadeReal(taxaNominal, inflacao);
const valorFuturo = calcularValorFuturo(
  valorDesejadoHoje,
  inflacao,
  tempoMeses
);
const aporteMensal = calcularAporteMensal(
  valorFuturo,
  rentabilidadeReal,
  tempoMeses
);

// Resultados
console.log("Rentabilidade Real: ", (rentabilidadeReal * 100).toFixed(2) + "%");
console.log("Valor Desejado Ajustado: R$ ", valorFuturo.toFixed(2));
console.log("Aporte Mensal Necessário: R$ ", aporteMensal.toFixed(2));
console.log("Possível? ", aporteMensal > 0 ? "SIM" : "NÃO");
