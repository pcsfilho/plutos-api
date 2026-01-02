import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script para gerar transações ao longo de 2025
 * Mantém os dados existentes e adiciona mais transações
 */
async function main() {
  console.log("🌱 Gerando transações para 2025...\n");

  // Buscar dados existentes
  const accounts = await prisma.account.findMany();
  const wallets = await prisma.wallet.findMany({ include: { account: true } });
  const categories = await prisma.category.findMany({ include: { type: true } });
  const types = await prisma.transactionType.findMany();
  const subscriptions = await prisma.subscription.findMany();

  if (wallets.length === 0) {
    console.log("❌ Nenhuma wallet encontrada. Execute o seed principal primeiro.");
    return;
  }

  console.log(`📊 Dados encontrados:`);
  console.log(`   - ${accounts.length} contas`);
  console.log(`   - ${wallets.length} wallets`);
  console.log(`   - ${categories.length} categorias`);
  console.log(`   - ${subscriptions.length} subscriptions\n`);

  const typeIncome = types.find((t) => t.name === "Entrada")!;
  const typeExpense = types.find((t) => t.name === "Saída")!;

  // Categorias de entrada e saída
  const incomeCategories = categories.filter((c) => c.typeId === typeIncome.id);
  const expenseCategories = categories.filter((c) => c.typeId === typeExpense.id);

  // Separar wallets PF e PJ
  const walletsPF = wallets.filter((w) => w.account.type === "PF");
  const walletsPJ = wallets.filter((w) => w.account.type === "PJ");

  console.log("🗑️  Removendo transações antigas...");
  await prisma.transaction.deleteMany();
  console.log("   ✅ Transações removidas\n");

  let totalTransactions = 0;

  // ===== GERAR TRANSAÇÕES PARA 2025 =====
  console.log("💳 Gerando transações mensais para 2025...\n");

  for (let month = 0; month < 12; month++) {
    const monthName = new Date(2025, month, 1).toLocaleString("pt-BR", {
      month: "long",
    });
    console.log(`📅 ${monthName.toUpperCase()}`);

    // ===== TRANSAÇÕES PF =====
    for (const wallet of walletsPF) {
      // Salário (todo mês dia 5)
      const salarioCategory = incomeCategories.find((c) =>
        c.name.includes("Salário")
      )!;
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          typeId: typeIncome.id,
          categoryId: salarioCategory.id,
          amount: 5000 + Math.random() * 1000, // R$ 5.000 - 6.000
          description: "Salário mensal",
          date: new Date(2025, month, 5),
        },
      });
      totalTransactions++;

      // Freelance (alguns meses, dia 15)
      if (Math.random() > 0.4) {
        const freelanceCategory = incomeCategories.find((c) =>
          c.name.includes("Freelance")
        )!;
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            typeId: typeIncome.id,
            categoryId: freelanceCategory.id,
            amount: 500 + Math.random() * 1500, // R$ 500 - 2.000
            description: "Projeto freelance",
            date: new Date(2025, month, 15),
          },
        });
        totalTransactions++;
      }

      // Despesas variadas ao longo do mês
      const numExpenses = 15 + Math.floor(Math.random() * 20); // 15-35 transações
      for (let i = 0; i < numExpenses; i++) {
        const day = 1 + Math.floor(Math.random() * 28);
        const category =
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ];

        let amount = 0;
        let description = "";

        // Valores mais realistas por categoria
        if (category.name.includes("Alimentação")) {
          amount = 20 + Math.random() * 150;
          description = [
            "Supermercado",
            "Restaurante",
            "Delivery",
            "Padaria",
          ][Math.floor(Math.random() * 4)];
        } else if (category.name.includes("Transporte")) {
          amount = 5 + Math.random() * 100;
          description = ["Uber", "Combustível", "Estacionamento"][
            Math.floor(Math.random() * 3)
          ];
        } else if (category.name.includes("Lazer")) {
          amount = 30 + Math.random() * 200;
          description = ["Cinema", "Show", "Bar", "Viagem"][
            Math.floor(Math.random() * 4)
          ];
        } else if (category.name.includes("Saúde")) {
          amount = 50 + Math.random() * 300;
          description = ["Farmácia", "Consulta", "Exames"][
            Math.floor(Math.random() * 3)
          ];
        } else if (category.name.includes("Educação")) {
          amount = 100 + Math.random() * 500;
          description = ["Curso", "Livros", "Material"][
            Math.floor(Math.random() * 3)
          ];
        } else {
          amount = 20 + Math.random() * 200;
          description = category.name;
        }

        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            typeId: typeExpense.id,
            categoryId: category.id,
            amount,
            description,
            date: new Date(2025, month, day),
          },
        });
        totalTransactions++;
      }
    }

    // ===== TRANSAÇÕES PJ =====
    for (const wallet of walletsPJ) {
      // Receitas de clientes (2-5 por mês)
      const numInvoices = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numInvoices; i++) {
        const day = 5 + Math.floor(Math.random() * 20);
        const receitaCategory =
          incomeCategories.find(
            (c) =>
              c.name.includes("Receita") ||
              c.name.includes("Venda") ||
              c.name.includes("Serviço")
          ) || incomeCategories[0]; // Fallback para primeira categoria de entrada

        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            typeId: typeIncome.id,
            categoryId: receitaCategory.id,
            amount: 2000 + Math.random() * 10000, // R$ 2.000 - 12.000
            description: `Fatura cliente ${i + 1}`,
            date: new Date(2025, month, day),
          },
        });
        totalTransactions++;
      }

      // Despesas empresariais
      const numExpensesPJ = 10 + Math.floor(Math.random() * 15);
      for (let i = 0; i < numExpensesPJ; i++) {
        const day = 1 + Math.floor(Math.random() * 28);
        const category =
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ];

        let amount = 0;
        let description = "";

        if (category.name.includes("Escritório")) {
          amount = 50 + Math.random() * 500;
          description = [
            "Material escritório",
            "Equipamentos",
            "Mobília",
          ][Math.floor(Math.random() * 3)];
        } else if (category.name.includes("Marketing")) {
          amount = 100 + Math.random() * 2000;
          description = ["Google Ads", "Facebook Ads", "Instagram Ads"][
            Math.floor(Math.random() * 3)
          ];
        } else if (category.name.includes("Salário")) {
          amount = 2000 + Math.random() * 5000;
          description = "Folha de pagamento";
        } else {
          amount = 50 + Math.random() * 1000;
          description = category.name;
        }

        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            typeId: typeExpense.id,
            categoryId: category.id,
            amount,
            description,
            date: new Date(2025, month, day),
          },
        });
        totalTransactions++;
      }
    }

    console.log(`   ✅ ${monthName}: transações geradas`);
  }

  // ===== VINCULAR SUBSCRIPTIONS ÀS TRANSAÇÕES =====
  console.log("\n🔗 Vinculando subscriptions às transações...");

  for (const sub of subscriptions) {
    // Buscar transações que podem ser dessa subscription
    const pattern = sub.matchPattern?.toLowerCase();
    if (!pattern) continue;

    const matchedTransactions = await prisma.transaction.findMany({
      where: {
        walletId: sub.walletId,
        description: {
          contains: pattern,
          mode: "insensitive",
        },
        subscriptionId: null,
      },
    });

    // Vincular
    await prisma.transaction.updateMany({
      where: {
        id: {
          in: matchedTransactions.map((t) => t.id),
        },
      },
      data: {
        subscriptionId: sub.id,
      },
    });

    if (matchedTransactions.length > 0) {
      console.log(
        `   ✅ ${sub.title}: ${matchedTransactions.length} transações vinculadas`
      );
    }
  }

  console.log(`\n✅ Seed concluído!`);
  console.log(`   📊 Total de transações geradas: ${totalTransactions}`);
  console.log(
    `   📅 Período: Janeiro/2025 - Dezembro/2025`
  );
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
