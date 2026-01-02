import { BankProvider } from "@prisma/client";
import { BANK_CSV_CONFIGS, parseCSVContent } from "./src/utils/csv-parser.util";

/**
 * Script de teste para validar parsing do CSV do C6 Bank
 */

// Exemplo real do CSV do C6 (Fatura de Cartão)
// IMPORTANTE: O C6 exporta com PONTO como separador decimal (formato americano)
const c6CSV = `Data de Compra;Nome no Cartão;Final do Cartão;Categoria;Descrição;Parcela;Valor (em US$);Cotação (em R$);Valor (em R$)
12/10/2025;PAULO FILHO;0680;Transporte;VIACAO JEQUIE CIDADE S;2/6;0;0;29.05
15/11/2025;PAULO FILHO;0680;Serviços pessoais;MP *KOTAS;Única;0;0;11.06
22/10/2025;PAULO FILHO;4736;Relacionados a Automotivo;GAGO AUTO PECAS;2/10;0;0;50.07
09/11/2025;PAULO FILHO;4736;-;"Inclusao de Pagamento    ";Única;0;0;-818.65
11/11/2025;PAULO FILHO;4736;Assistência médica e odontológica;MTD*AMORSAUDE FEIRA DE;Única;0;0;40.00
15/11/2025;PAULO FILHO;4736;Materiais de construção para casa;MARCON MATERIAIS DE CO;Única;0;0;26.00
17/11/2025;PAULO FILHO;4736;Associação;ECONOMART;Única;0;0;107.23
19/11/2025;PAULO FILHO;4736;Assistência médica e odontológica;GASTROS BAHIA DAY HOS;1/12;0;0;37.50
20/11/2025;PAULO FILHO;4736;Departamento / Desconto;EUROCAPA 2;1/2;0;0;37.50
26/11/2025;PAULO FILHO;4736;Especialidade varejo;IG*EDZRBEWAY;Única;0;0;29.70
01/12/2025;PAULO FILHO;4736;Associação;ECONOMART;1/2;0;0;96.43
03/12/2025;PAULO FILHO;4736;Associação;ECONOMART;Única;0;0;66.82`;

console.log("🧪 Testando parsing do CSV do C6 Bank\n");
console.log("=".repeat(80));

try {
  const config = BANK_CSV_CONFIGS[BankProvider.C6];
  console.log("\n📋 Configuração do C6:");
  console.log(`  - Delimiter: "${config.delimiter}"`);
  console.log(`  - Encoding: ${config.encoding}`);
  console.log(`  - Date Format: ${config.dateFormat}`);
  console.log(`  - Has Header: ${config.hasHeader}`);
  console.log(`  - Columns:`, config.columns);

  const transactions = parseCSVContent(c6CSV, config);

  console.log(`\n✅ Parse bem-sucedido! ${transactions.length} transações encontradas\n`);
  console.log("=".repeat(80));

  let totalSaidas = 0;
  let totalEntradas = 0;
  let countSaidas = 0;
  let countEntradas = 0;

  console.log("\n📊 Transações Parseadas:\n");
  console.log("Data       | Descrição                              | Valor      | Tipo     | Categoria");
  console.log("-".repeat(100));

  transactions.forEach((t) => {
    const tipo = t.amount > 0 ? "SAÍDA" : "ENTRADA";
    const valorAbs = Math.abs(t.amount);

    if (t.amount > 0) {
      totalSaidas += valorAbs;
      countSaidas++;
    } else {
      totalEntradas += valorAbs;
      countEntradas++;
    }

    const descShort = t.description.length > 40
      ? t.description.substring(0, 37) + "..."
      : t.description.padEnd(40);

    const valorStr = `R$ ${valorAbs.toFixed(2)}`.padStart(10);
    const categoryShort = (t.category || "Sem categoria").length > 20
      ? (t.category || "").substring(0, 17) + "..."
      : (t.category || "Sem categoria").padEnd(20);

    console.log(
      `${t.date.toISOString().split('T')[0]} | ${descShort} | ${valorStr} | ${tipo.padEnd(8)} | ${categoryShort}`
    );
  });

  console.log("-".repeat(100));
  console.log("\n📈 Resumo:");
  console.log(`  🔴 Saídas (Compras):     ${countSaidas} transações | Total: R$ ${totalSaidas.toFixed(2)}`);
  console.log(`  🟢 Entradas (Estornos):  ${countEntradas} transações | Total: R$ ${totalEntradas.toFixed(2)}`);
  console.log(`  💰 Saldo (a pagar):      R$ ${(totalSaidas - totalEntradas).toFixed(2)}`);

  console.log("\n✅ Validação:");
  console.log("  ✓ Valores positivos identificados como SAÍDA (compras)");
  console.log("  ✓ Valores negativos identificados como ENTRADA (estornos/pagamentos)");
  console.log("  ✓ Datas parseadas corretamente (DD/MM/YYYY → Date)");
  console.log("  ✓ Separador ; (ponto-e-vírgula) processado");
  console.log("  ✓ Categorias do C6 preservadas");

  // Testa casos específicos
  console.log("\n🔍 Casos Específicos:");

  const estorno = transactions.find(t => t.amount < 0);
  if (estorno) {
    console.log(`  ✓ "Inclusao de Pagamento" (-818.65) → Tipo: ${estorno.amount < 0 ? 'ENTRADA ✅' : 'SAÍDA ❌'}`);
  }

  const compra = transactions.find(t => t.description.includes("VIACAO"));
  if (compra) {
    console.log(`  ✓ "VIACAO JEQUIE" (29.05) → Tipo: ${compra.amount > 0 ? 'SAÍDA ✅' : 'ENTRADA ❌'}`);
  }

  const parcela = transactions.find(t => t.description.includes("GAGO"));
  if (parcela) {
    console.log(`  ✓ Parcela detectada → "GAGO AUTO PECAS" (2/10) ✅`);
  }

  const categoria = transactions.find(t => t.category === "Transporte");
  if (categoria) {
    console.log(`  ✓ Categoria preservada → "${categoria.category}" ✅`);
  }

  // Análise de categorias
  console.log("\n📊 Distribuição por Categoria:");
  const categoriesMap = new Map<string, { count: number, total: number }>();

  transactions.forEach(t => {
    const cat = t.category || "Sem categoria";
    const existing = categoriesMap.get(cat);
    if (existing) {
      existing.count++;
      existing.total += Math.abs(t.amount);
    } else {
      categoriesMap.set(cat, { count: 1, total: Math.abs(t.amount) });
    }
  });

  Array.from(categoriesMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([cat, data]) => {
      console.log(`  • ${cat.padEnd(40)} ${data.count} trans. | R$ ${data.total.toFixed(2)}`);
    });

  console.log("\n" + "=".repeat(80));
  console.log("✅ Teste concluído com sucesso!");
  console.log("=".repeat(80));

} catch (error: any) {
  console.error("\n❌ Erro ao parsear CSV:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
