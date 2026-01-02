const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== RESUMO GERAL - TRANSAÇÕES 2025 ===\n");

  const accounts = await prisma.account.findMany({
    include: {
      wallets: true,
    },
  });

  for (const account of accounts) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `📊 CONTA: ${account.name} (${account.type}) - ID: ${account.id}`
    );
    console.log("=".repeat(80));

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: {
          accountId: account.id,
        },
        date: {
          gte: new Date(2025, 0, 1),
          lte: new Date(2025, 11, 31),
        },
      },
      include: {
        type: true,
      },
    });

    const income = transactions
      .filter((t) => t.type.name === "Entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type.name === "Saída")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    console.log(`\nWallets: ${account.wallets.length}`);
    account.wallets.forEach((w) => console.log(`  - ${w.name}`));

    console.log(`\nTransações: ${transactions.length}`);
    console.log(`Entrada total: R$ ${income.toFixed(2)}`);
    console.log(`Saída total: R$ ${expense.toFixed(2)}`);
    console.log(`Saldo do ano: R$ ${(income - expense).toFixed(2)}`);
  }

  // Total geral
  console.log(`\n\n${"=".repeat(80)}`);
  console.log("📈 TOTAL GERAL (TODAS AS CONTAS)");
  console.log("=".repeat(80));

  const allTransactions = await prisma.transaction.count({
    where: {
      date: {
        gte: new Date(2025, 0, 1),
        lte: new Date(2025, 11, 31),
      },
    },
  });

  console.log(`\nTotal de transações geradas em 2025: ${allTransactions}`);
  console.log("Período completo: Janeiro a Dezembro de 2025");
  console.log("\n✅ Banco de dados populado com sucesso para testes do frontend!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
