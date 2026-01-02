const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Testando transações geradas para 2025 ===\n");

  // Contar transações por mês para accountId 4
  console.log("📊 Transações por mês (AccountId 4):\n");

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  let totalYear = 0;
  let totalIncomeYear = 0;
  let totalExpenseYear = 0;

  for (let month = 0; month < 12; month++) {
    const startDate = new Date(2025, month, 1);
    const endDate = new Date(2025, month + 1, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: {
          accountId: 4,
        },
        date: {
          gte: startDate,
          lte: endDate,
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

    const balance = income - expense;

    totalYear += transactions.length;
    totalIncomeYear += income;
    totalExpenseYear += expense;

    console.log(
      `${months[month].padEnd(12)} | ` +
        `Qtd: ${String(transactions.length).padStart(3)} | ` +
        `Entrada: R$ ${income.toFixed(2).padStart(12)} | ` +
        `Saída: R$ ${expense.toFixed(2).padStart(12)} | ` +
        `Saldo: R$ ${balance.toFixed(2).padStart(12)}`
    );
  }

  console.log("\n" + "=".repeat(90));
  console.log(
    `TOTAL ANO    | ` +
      `Qtd: ${String(totalYear).padStart(3)} | ` +
      `Entrada: R$ ${totalIncomeYear.toFixed(2).padStart(12)} | ` +
      `Saída: R$ ${totalExpenseYear.toFixed(2).padStart(12)} | ` +
      `Saldo: R$ ${(totalIncomeYear - totalExpenseYear).toFixed(2).padStart(12)}`
  );

  // Teste com diferentes filtros
  console.log("\n\n=== Testando filtros ===\n");

  // Todas transações do ano
  const allYear = await prisma.transaction.count({
    where: {
      wallet: {
        accountId: 4,
      },
      date: {
        gte: new Date(2025, 0, 1),
        lte: new Date(2025, 11, 31),
      },
    },
  });
  console.log(
    `✅ accountId=4 & startDate=2025-01-01 & endDate=2025-12-31: ${allYear} transações`
  );

  // Apenas julho
  const july = await prisma.transaction.count({
    where: {
      wallet: {
        accountId: 4,
      },
      date: {
        gte: new Date(2025, 6, 1),
        lte: new Date(2025, 6, 31),
      },
    },
  });
  console.log(
    `✅ accountId=4 & startDate=2025-07-01 & endDate=2025-07-31: ${july} transações`
  );

  // Primeiro semestre
  const firstHalf = await prisma.transaction.count({
    where: {
      wallet: {
        accountId: 4,
      },
      date: {
        gte: new Date(2025, 0, 1),
        lte: new Date(2025, 5, 30),
      },
    },
  });
  console.log(
    `✅ accountId=4 & startDate=2025-01-01 & endDate=2025-06-30: ${firstHalf} transações`
  );

  // Subscriptions vinculadas
  console.log("\n\n=== Subscriptions vinculadas ===\n");
  const subsWithTransactions = await prisma.subscription.findMany({
    where: {
      wallet: {
        accountId: 4,
      },
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  subsWithTransactions.forEach((sub) => {
    console.log(
      `${sub.title.padEnd(20)} | ${sub._count.transactions} transações vinculadas`
    );
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
