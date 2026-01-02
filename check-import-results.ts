import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script para verificar resultados de importação
 * Uso: npx tsx check-import-results.ts
 */

async function checkImportResults() {
  console.log("🔍 Verificando Resultados da Importação\n");
  console.log("=" .repeat(80));

  // ==========================================
  // 1. VERIFICAR ACCOUNT E WALLET
  // ==========================================
  console.log("\n📋 1. VERIFICANDO ACCOUNT E WALLET\n");

  const account = await prisma.account.findUnique({
    where: { id: 3 },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!account) {
    console.log("❌ Account ID 3 não encontrada!");
    return;
  }

  console.log("✅ Account encontrada:");
  console.log(`   ID: ${account.id}`);
  console.log(`   Tipo: ${account.type} (${account.type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"})`);
  console.log(`   Nome: ${account.name}`);
  console.log(`   Documento: ${account.document || "Não informado"}`);
  console.log(`   Ativa: ${account.isActive ? "Sim" : "Não"}`);
  console.log(`   Usuário: ${account.user.name} (${account.user.email})`);

  const wallet = await prisma.wallet.findUnique({
    where: { id: 6 },
    include: {
      account: true,
      currency: true,
    },
  });

  if (!wallet) {
    console.log("\n❌ Wallet ID 6 não encontrada!");
    return;
  }

  console.log("\n✅ Wallet encontrada:");
  console.log(`   ID: ${wallet.id}`);
  console.log(`   Nome: ${wallet.name}`);
  console.log(`   Tipo: ${wallet.type}`);
  console.log(`   Moeda: ${wallet.currency.code} (${wallet.currency.symbol})`);
  console.log(`   Account: ${wallet.account.name} (${wallet.account.type})`);

  // Valida ownership
  if (wallet.accountId !== account.id) {
    console.log("\n❌ ERRO: Wallet 6 NÃO pertence à Account 3!");
    console.log(`   Wallet pertence à Account ${wallet.accountId}`);
    return;
  }

  console.log("\n✅ Validação de ownership: Wallet 6 pertence à Account 3");

  // ==========================================
  // 2. HISTÓRICO DE IMPORTAÇÕES
  // ==========================================
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 2. HISTÓRICO DE IMPORTAÇÕES\n");

  const importHistory = await prisma.importHistory.findMany({
    where: {
      accountId: 3,
      walletId: 6,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (importHistory.length === 0) {
    console.log("⚠️  Nenhuma importação encontrada para Account 3, Wallet 6");
  } else {
    console.log(`✅ ${importHistory.length} importação(ões) encontrada(s):\n`);

    importHistory.forEach((history, index) => {
      console.log(`${index + 1}. Importação ID ${history.id}`);
      console.log(`   Banco: ${history.bankProvider}`);
      console.log(`   Arquivo: ${history.fileName}`);
      console.log(`   Status: ${history.status}`);
      console.log(`   Total de linhas: ${history.totalRows}`);
      console.log(`   Importadas: ${history.importedRows}`);
      console.log(`   Duplicadas: ${history.duplicatedRows}`);
      console.log(`   Erros: ${history.errorRows}`);
      console.log(`   Data: ${history.createdAt.toLocaleString("pt-BR")}`);
      console.log("");
    });
  }

  const lastImport = importHistory[0];
  if (!lastImport) {
    console.log("\n⚠️  Nenhuma importação para analisar. Finalizando.");
    return;
  }

  console.log(`🔎 Analisando última importação: ${lastImport.fileName}\n`);

  // ==========================================
  // 3. TRANSAÇÕES IMPORTADAS
  // ==========================================
  console.log("=".repeat(80));
  console.log("\n💰 3. TRANSAÇÕES IMPORTADAS\n");

  const transactions = await prisma.transaction.findMany({
    where: {
      walletId: 6,
      importedFrom: lastImport.fileName,
    },
    include: {
      type: true,
      category: true,
      subscription: true,
    },
    orderBy: { date: "desc" },
  });

  console.log(`✅ Total de transações importadas: ${transactions.length}\n`);

  if (transactions.length === 0) {
    console.log("⚠️  Nenhuma transação encontrada com este importedFrom");
  } else {
    console.log("ID   | Data       | Tipo    | Categoria           | Valor      | Descrição");
    console.log("-".repeat(100));

    transactions.forEach((t) => {
      const id = String(t.id).padEnd(4);
      const date = t.date.toISOString().split("T")[0];
      const type = t.type.name.padEnd(7);
      const category = (t.category.name.substring(0, 19)).padEnd(19);
      const amount = `R$ ${t.amount.toFixed(2)}`.padStart(10);
      const desc = t.description?.substring(0, 35) || "";

      console.log(`${id} | ${date} | ${type} | ${category} | ${amount} | ${desc}`);
    });

    // ==========================================
    // 4. RESUMO POR TIPO
    // ==========================================
    console.log("\n" + "=".repeat(80));
    console.log("\n📈 4. RESUMO POR TIPO\n");

    const byType = transactions.reduce((acc, t) => {
      const typeName = t.type.name;
      if (!acc[typeName]) {
        acc[typeName] = { count: 0, total: 0 };
      }
      acc[typeName].count++;
      acc[typeName].total += t.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    Object.entries(byType).forEach(([type, data]) => {
      const icon = type === "Entrada" ? "🟢" : "🔴";
      console.log(`${icon} ${type}:`);
      console.log(`   Quantidade: ${data.count} transações`);
      console.log(`   Total: R$ ${data.total.toFixed(2)}`);
      console.log("");
    });

    const totalEntradas = byType["Entrada"]?.total || 0;
    const totalSaidas = byType["Saída"]?.total || 0;
    const saldo = totalEntradas - totalSaidas;

    console.log("💰 Balanço:");
    console.log(`   Entradas: R$ ${totalEntradas.toFixed(2)}`);
    console.log(`   Saídas: R$ ${totalSaidas.toFixed(2)}`);
    console.log(`   Saldo: R$ ${saldo.toFixed(2)} ${saldo >= 0 ? "✅" : "⚠️"}`);

    // ==========================================
    // 5. RESUMO POR CATEGORIA
    // ==========================================
    console.log("\n" + "=".repeat(80));
    console.log("\n🏷️  5. RESUMO POR CATEGORIA\n");

    const byCategory = transactions.reduce((acc, t) => {
      const categoryName = t.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, total: 0 };
      }
      acc[categoryName].count++;
      acc[categoryName].total += t.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const sortedCategories = Object.entries(byCategory).sort(
      ([, a], [, b]) => b.total - a.total
    );

    sortedCategories.forEach(([category, data]) => {
      console.log(`📌 ${category}:`);
      console.log(`   ${data.count} transações | R$ ${data.total.toFixed(2)}`);
    });

    // ==========================================
    // 6. SUBSCRIPTIONS VINCULADAS
    // ==========================================
    console.log("\n" + "=".repeat(80));
    console.log("\n🔄 6. SUBSCRIPTIONS VINCULADAS\n");

    const withSubscription = transactions.filter((t) => t.subscriptionId);

    if (withSubscription.length === 0) {
      console.log("⚠️  Nenhuma transação vinculada a subscription");
    } else {
      console.log(`✅ ${withSubscription.length} transação(ões) vinculada(s):\n`);

      withSubscription.forEach((t) => {
        console.log(`💳 ${t.subscription?.title || "Desconhecida"}`);
        console.log(`   Transação: ${t.description}`);
        console.log(`   Valor: R$ ${t.amount.toFixed(2)}`);
        console.log(`   Data: ${t.date.toISOString().split("T")[0]}`);
        console.log("");
      });
    }

    // ==========================================
    // 7. VALIDAÇÕES
    // ==========================================
    console.log("=".repeat(80));
    console.log("\n✅ 7. VALIDAÇÕES\n");

    // Valida valores negativos
    const negativeAmounts = transactions.filter((t) => t.amount < 0);
    if (negativeAmounts.length > 0) {
      console.log(`❌ ERRO: ${negativeAmounts.length} transações com valor NEGATIVO!`);
      negativeAmounts.forEach((t) => {
        console.log(`   ID ${t.id}: R$ ${t.amount} - ${t.description}`);
      });
    } else {
      console.log("✅ Todos os valores são positivos (normalização OK)");
    }

    // Valida tipos
    const validTypes = ["Entrada", "Saída"];
    const invalidTypes = transactions.filter(
      (t) => !validTypes.includes(t.type.name)
    );
    if (invalidTypes.length > 0) {
      console.log(`\n❌ ERRO: ${invalidTypes.length} transações com tipo inválido!`);
    } else {
      console.log("✅ Todos os tipos são válidos (Entrada ou Saída)");
    }

    // Valida ownership
    const allWallet = await prisma.wallet.findUnique({
      where: { id: 6 },
      select: { accountId: true },
    });

    if (allWallet?.accountId === 3) {
      console.log("✅ Todas as transações pertencem à Account 3");
    } else {
      console.log(`❌ ERRO: Wallet pertence à Account ${allWallet?.accountId}, não Account 3!`);
    }

    // ==========================================
    // 8. PERÍODO DAS TRANSAÇÕES
    // ==========================================
    console.log("\n" + "=".repeat(80));
    console.log("\n📅 8. PERÍODO DAS TRANSAÇÕES\n");

    const dates = transactions.map((t) => t.date);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    console.log(`📆 Data inicial: ${minDate.toISOString().split("T")[0]}`);
    console.log(`📆 Data final: ${maxDate.toISOString().split("T")[0]}`);

    const diffDays = Math.ceil(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(`📊 Período: ${diffDays} dias`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Verificação concluída!\n");
}

checkImportResults()
  .catch((error) => {
    console.error("\n❌ Erro ao verificar importações:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
