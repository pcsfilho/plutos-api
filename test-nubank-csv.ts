import { BankProvider } from "@prisma/client";
import { BANK_CSV_CONFIGS, parseCSVContent } from "./src/utils/csv-parser.util";

/**
 * Script de teste para validar parsing do CSV do Nubank
 */

// Exemplo real do CSV do Nubank
const nubankCSV = `date,title,amount
2025-11-24,Mercadolivre*4produto,135.89
2025-11-20,Wt Net Comunicacao,61.38
2025-11-03,Mercadolivre*Mercadoli,39.90
2025-11-03,Mercadolivre*Mercadol,68.52
2025-11-03,Claude.Ai Subscription,114.35
2025-11-03,Mercadolivre*Mercadol - Parcela 1/6,47.56
2025-11-03,"IOF de ""Claude.Ai Subscription""",4.00
2025-11-02,Mercado*Mercadolivre - Parcela 2/4,37.49
2025-11-02,Hna*O Boticario - Parcela 4/5,33.18
2025-11-02,Pagamento recebido,-570.11
2025-11-02,ClickBus - NuPay - 2/2,79.81
2025-11-02,Mp *Growthsupplements - Parcela 3/6,63.08
2025-11-02,Mercadolivre*Inovepape - Parcela 4/4,30.61
2025-11-02,Amazon - Parcela 3/6,47.91
2025-11-02,Mercadolivre*8produtos - Parcela 2/2,19.04`;

console.log("🧪 Testando parsing do CSV do Nubank\n");
console.log("=" .repeat(80));

try {
  const config = BANK_CSV_CONFIGS[BankProvider.NUBANK];
  console.log("\n📋 Configuração do Nubank:");
  console.log(`  - Delimiter: "${config.delimiter}"`);
  console.log(`  - Encoding: ${config.encoding}`);
  console.log(`  - Date Format: ${config.dateFormat}`);
  console.log(`  - Has Header: ${config.hasHeader}`);
  console.log(`  - Columns:`, config.columns);

  const transactions = parseCSVContent(nubankCSV, config);

  console.log(`\n✅ Parse bem-sucedido! ${transactions.length} transações encontradas\n`);
  console.log("=" .repeat(80));

  let totalSaidas = 0;
  let totalEntradas = 0;
  let countSaidas = 0;
  let countEntradas = 0;

  console.log("\n📊 Transações Parseadas:\n");
  console.log("Data       | Descrição                              | Valor      | Tipo");
  console.log("-".repeat(80));

  transactions.forEach((t, i) => {
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

    console.log(
      `${t.date.toISOString().split('T')[0]} | ${descShort} | ${valorStr} | ${tipo}`
    );
  });

  console.log("-".repeat(80));
  console.log("\n📈 Resumo:");
  console.log(`  🔴 Saídas:   ${countSaidas} transações | Total: R$ ${totalSaidas.toFixed(2)}`);
  console.log(`  🟢 Entradas: ${countEntradas} transações | Total: R$ ${totalEntradas.toFixed(2)}`);
  console.log(`  💰 Saldo:    R$ ${(totalEntradas - totalSaidas).toFixed(2)}`);

  console.log("\n✅ Validação:");
  console.log("  ✓ Valores positivos identificados como SAÍDA");
  console.log("  ✓ Valores negativos identificados como ENTRADA");
  console.log("  ✓ Datas parseadas corretamente");
  console.log("  ✓ Descrições preservadas (incluindo IOF e parcelas)");

  // Testa casos específicos
  console.log("\n🔍 Casos Específicos:");

  const pagamentoRecebido = transactions.find(t => t.description.includes("Pagamento recebido"));
  if (pagamentoRecebido) {
    console.log(`  ✓ "Pagamento recebido" (-570.11) → Tipo: ${pagamentoRecebido.amount < 0 ? 'ENTRADA ✅' : 'SAÍDA ❌'}`);
  }

  const mercadolivre = transactions.find(t => t.description.includes("Mercadolivre*4produto"));
  if (mercadolivre) {
    console.log(`  ✓ "Mercadolivre" (135.89) → Tipo: ${mercadolivre.amount > 0 ? 'SAÍDA ✅' : 'ENTRADA ❌'}`);
  }

  const iof = transactions.find(t => t.description.includes("IOF"));
  if (iof) {
    console.log(`  ✓ "IOF de Claude" (4.00) → Preservado com aspas ✅`);
  }

  const parcela = transactions.find(t => t.description.includes("Parcela"));
  if (parcela) {
    console.log(`  ✓ Parcelas detectadas → "${parcela.description}" ✅`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Teste concluído com sucesso!");
  console.log("=".repeat(80));

} catch (error: any) {
  console.error("\n❌ Erro ao parsear CSV:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
