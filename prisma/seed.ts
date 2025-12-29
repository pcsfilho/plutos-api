import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Limpa o banco (cuidado em produção!)
  console.log("🗑️  Limpando banco de dados...");
  await prisma.importHistory.deleteMany();
  await prisma.categoryRule.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.transactionType.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.user.deleteMany();

  // ===== 1. CRIAR MOEDAS =====
  console.log("\n💰 Criando moedas...");
  const brl = await prisma.currency.create({
    data: {
      name: "Real Brasileiro",
      code: "BRL",
      symbol: "R$",
      exchangeRate: 1.0,
    },
  });
  console.log(`   ✅ Moeda criada: ${brl.code}`);

  // ===== 2. CRIAR TIPOS DE TRANSAÇÃO =====
  console.log("\n📊 Criando tipos de transação...");
  const typeIncome = await prisma.transactionType.create({
    data: { name: "Entrada" },
  });
  const typeExpense = await prisma.transactionType.create({
    data: { name: "Saída" },
  });
  console.log(`   ✅ Tipos criados: ${typeIncome.name}, ${typeExpense.name}`);

  // ===== 3. CRIAR CATEGORIAS =====
  console.log("\n🏷️  Criando categorias...");

  // Categorias de Entrada
  const categoriesIncome = await Promise.all([
    prisma.category.create({ data: { name: "Salário", typeId: typeIncome.id } }),
    prisma.category.create({ data: { name: "Freelance", typeId: typeIncome.id } }),
    prisma.category.create({ data: { name: "Investimentos", typeId: typeIncome.id } }),
    prisma.category.create({ data: { name: "Outros Recebimentos", typeId: typeIncome.id } }),
  ]);

  // Categorias de Saída
  const categoriesExpense = await Promise.all([
    prisma.category.create({ data: { name: "Alimentação", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Transporte", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Moradia", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Saúde", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Educação", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Lazer", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Compras", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Assinaturas", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Infraestrutura", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Marketing", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Impostos", typeId: typeExpense.id } }),
    prisma.category.create({ data: { name: "Outros", typeId: typeExpense.id } }),
  ]);

  const [salario, freelance, investimentos] = categoriesIncome;
  const [
    alimentacao,
    transporte,
    moradia,
    saude,
    educacao,
    lazer,
    compras,
    assinaturas,
    infraestrutura,
    marketing,
    impostos,
    outros,
  ] = categoriesExpense;

  console.log(`   ✅ ${categoriesIncome.length + categoriesExpense.length} categorias criadas`);

  // ===== 4. CRIAR USUÁRIO =====
  console.log("\n👤 Criando usuário...");
  const hashedPassword = await bcrypt.hash("senha123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Paulo Filho",
      email: "paulo.ecomp@gmail.com",
      password: hashedPassword,
    },
  });
  console.log(`   ✅ Usuário criado: ${user.name} (${user.email})`);
  console.log(`   🔑 Senha: senha123`);

  // ===== 5. CRIAR CONTAS (PF e PJ) =====
  console.log("\n🏦 Criando contas...");

  // Conta Pessoa Física
  const accountPF = await prisma.account.create({
    data: {
      userId: user.id,
      type: "PF",
      name: "Pessoal",
      document: "123.456.789-00",
    },
  });
  console.log(`   ✅ Conta PF criada: ${accountPF.name}`);

  // Conta Pessoa Jurídica
  const accountPJ = await prisma.account.create({
    data: {
      userId: user.id,
      type: "PJ",
      name: "PCS Informática LTDA",
      document: "12.345.678/0001-90",
    },
  });
  console.log(`   ✅ Conta PJ criada: ${accountPJ.name}`);

  // ===== 6. CRIAR WALLETS DA CONTA PF =====
  console.log("\n💳 Criando carteiras da conta PF...");

  const walletNubankPF = await prisma.wallet.create({
    data: {
      accountId: accountPF.id,
      name: "Nubank Pessoal",
      currencyId: brl.id,
      initialBalance: 0,
      type: "CREDIT_CARD",
      creditLimit: 8000,
      dueDay: 15,
      closingDay: 8,
    },
  });

  const walletContaCorrente = await prisma.wallet.create({
    data: {
      accountId: accountPF.id,
      name: "Conta Corrente Bradesco",
      currencyId: brl.id,
      initialBalance: 3500,
      type: "CHECKING_ACCOUNT",
    },
  });

  const walletPoupanca = await prisma.wallet.create({
    data: {
      accountId: accountPF.id,
      name: "Poupança",
      currencyId: brl.id,
      initialBalance: 15000,
      type: "SAVINGS",
    },
  });

  console.log(`   ✅ ${walletNubankPF.name}`);
  console.log(`   ✅ ${walletContaCorrente.name}`);
  console.log(`   ✅ ${walletPoupanca.name}`);

  // ===== 7. CRIAR WALLETS DA CONTA PJ =====
  console.log("\n💼 Criando carteiras da conta PJ...");

  const walletC6Empresarial = await prisma.wallet.create({
    data: {
      accountId: accountPJ.id,
      name: "C6 Empresarial",
      currencyId: brl.id,
      initialBalance: 0,
      type: "CREDIT_CARD",
      creditLimit: 15000,
      dueDay: 10,
      closingDay: 3,
    },
  });

  const walletInterPJ = await prisma.wallet.create({
    data: {
      accountId: accountPJ.id,
      name: "Conta Inter PJ",
      currencyId: brl.id,
      initialBalance: 25000,
      type: "CHECKING_ACCOUNT",
    },
  });

  console.log(`   ✅ ${walletC6Empresarial.name}`);
  console.log(`   ✅ ${walletInterPJ.name}`);

  // ===== 8. CRIAR REGRAS DE CATEGORIZAÇÃO - CONTA PF =====
  console.log("\n📏 Criando regras de categorização (PF)...");

  const rulesPF = await Promise.all([
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "uber",
        categoryId: transporte.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "99",
        categoryId: transporte.id,
        priority: 9,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "ifood",
        categoryId: alimentacao.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "rappi",
        categoryId: alimentacao.id,
        priority: 9,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "netflix",
        categoryId: assinaturas.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "spotify",
        categoryId: assinaturas.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPF.id,
        pattern: "amazon prime",
        categoryId: assinaturas.id,
        priority: 8,
      },
    }),
  ]);

  console.log(`   ✅ ${rulesPF.length} regras criadas`);

  // ===== 9. CRIAR REGRAS DE CATEGORIZAÇÃO - CONTA PJ =====
  console.log("\n📏 Criando regras de categorização (PJ)...");

  const rulesPJ = await Promise.all([
    prisma.categoryRule.create({
      data: {
        accountId: accountPJ.id,
        pattern: "aws",
        categoryId: infraestrutura.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPJ.id,
        pattern: "google cloud",
        categoryId: infraestrutura.id,
        priority: 9,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPJ.id,
        pattern: "vercel",
        categoryId: infraestrutura.id,
        priority: 8,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPJ.id,
        pattern: "meta ads",
        categoryId: marketing.id,
        priority: 10,
      },
    }),
    prisma.categoryRule.create({
      data: {
        accountId: accountPJ.id,
        pattern: "google ads",
        categoryId: marketing.id,
        priority: 10,
      },
    }),
  ]);

  console.log(`   ✅ ${rulesPJ.length} regras criadas`);

  // ===== 10. CRIAR TRANSAÇÕES - CONTA PF =====
  console.log("\n💸 Criando transações da conta PF...");

  // Salário mensal
  await prisma.transaction.create({
    data: {
      walletId: walletContaCorrente.id,
      typeId: typeIncome.id,
      categoryId: salario.id,
      amount: 8000,
      description: "Salário - Janeiro 2025",
      date: new Date("2025-01-05"),
    },
  });

  // Transações Nubank PF (Cartão de Crédito)
  const transactionsPF = [
    { description: "Uber - Viagem para trabalho", amount: 25.50, categoryId: transporte.id, date: "2025-01-15" },
    { description: "99 - Volta do trabalho", amount: 32.00, categoryId: transporte.id, date: "2025-01-16" },
    { description: "iFood - Almoço", amount: 45.00, categoryId: alimentacao.id, date: "2025-01-14" },
    { description: "Rappi - Jantar", amount: 52.90, categoryId: alimentacao.id, date: "2025-01-18" },
    { description: "Netflix - Assinatura Mensal", amount: 55.90, categoryId: assinaturas.id, date: "2025-01-10" },
    { description: "Spotify Premium", amount: 21.90, categoryId: assinaturas.id, date: "2025-01-12" },
    { description: "Amazon Prime", amount: 14.90, categoryId: assinaturas.id, date: "2025-01-08" },
    { description: "Supermercado Extra", amount: 385.50, categoryId: alimentacao.id, date: "2025-01-20" },
    { description: "Farmácia - Remédios", amount: 127.80, categoryId: saude.id, date: "2025-01-22" },
    { description: "Shopping - Roupas", amount: 250.00, categoryId: compras.id, date: "2025-01-25" },
    { description: "Cinema Cinemark", amount: 68.00, categoryId: lazer.id, date: "2025-01-26" },
    { description: "Livros na Amazon", amount: 89.90, categoryId: educacao.id, date: "2025-01-23" },
    { description: "Aluguel", amount: 1500.00, categoryId: moradia.id, date: "2025-01-10" },
    { description: "Energia Elétrica - Cemig", amount: 210.50, categoryId: moradia.id, date: "2025-01-12" },
    { description: "Água - Copasa", amount: 85.00, categoryId: moradia.id, date: "2025-01-13" },
  ];

  for (const tx of transactionsPF) {
    await prisma.transaction.create({
      data: {
        walletId: walletNubankPF.id,
        typeId: typeExpense.id,
        categoryId: tx.categoryId,
        amount: tx.amount,
        description: tx.description,
        date: new Date(tx.date),
      },
    });
  }

  console.log(`   ✅ ${transactionsPF.length + 1} transações criadas (PF)`);

  // ===== 11. CRIAR TRANSAÇÕES - CONTA PJ =====
  console.log("\n💼 Criando transações da conta PJ...");

  // Receita de prestação de serviços
  await prisma.transaction.create({
    data: {
      walletId: walletInterPJ.id,
      typeId: typeIncome.id,
      categoryId: freelance.id,
      amount: 15000,
      description: "Projeto de Desenvolvimento Web - Cliente A",
      date: new Date("2025-01-15"),
    },
  });

  await prisma.transaction.create({
    data: {
      walletId: walletInterPJ.id,
      typeId: typeIncome.id,
      categoryId: freelance.id,
      amount: 8500,
      description: "Consultoria TI - Cliente B",
      date: new Date("2025-01-20"),
    },
  });

  // Transações C6 Empresarial (Cartão de Crédito PJ)
  const transactionsPJ = [
    { description: "AWS - Hospedagem Cloud", amount: 450.00, categoryId: infraestrutura.id, date: "2025-01-10" },
    { description: "Vercel Pro Plan", amount: 120.00, categoryId: infraestrutura.id, date: "2025-01-12" },
    { description: "Google Cloud Platform", amount: 280.00, categoryId: infraestrutura.id, date: "2025-01-15" },
    { description: "Meta Ads - Campanha Janeiro", amount: 1500.00, categoryId: marketing.id, date: "2025-01-18" },
    { description: "Google Ads - Anúncios", amount: 2200.00, categoryId: marketing.id, date: "2025-01-20" },
    { description: "Canva Pro - Design", amount: 54.90, categoryId: assinaturas.id, date: "2025-01-08" },
    { description: "Adobe Creative Cloud", amount: 239.90, categoryId: assinaturas.id, date: "2025-01-09" },
    { description: "Material de Escritório", amount: 320.00, categoryId: outros.id, date: "2025-01-22" },
    { description: "Internet Fibra Empresarial", amount: 299.90, categoryId: infraestrutura.id, date: "2025-01-05" },
  ];

  for (const tx of transactionsPJ) {
    await prisma.transaction.create({
      data: {
        walletId: walletC6Empresarial.id,
        typeId: typeExpense.id,
        categoryId: tx.categoryId,
        amount: tx.amount,
        description: tx.description,
        date: new Date(tx.date),
      },
    });
  }

  console.log(`   ✅ ${transactionsPJ.length + 2} transações criadas (PJ)`);

  // ===== 12. CRIAR LEMBRETES =====
  console.log("\n🔔 Criando lembretes...");

  await prisma.reminder.create({
    data: {
      walletId: walletNubankPF.id,
      title: "Fatura Nubank - Vencimento",
      description: "Pagar fatura do cartão Nubank",
      dueDate: new Date("2025-02-15"),
      isPaid: false,
    },
  });

  await prisma.reminder.create({
    data: {
      walletId: walletC6Empresarial.id,
      title: "Fatura C6 Empresarial",
      description: "Pagar fatura do cartão empresarial",
      dueDate: new Date("2025-02-10"),
      isPaid: false,
    },
  });

  await prisma.reminder.create({
    data: {
      walletId: walletContaCorrente.id,
      title: "Aluguel Fevereiro",
      description: "Transferir aluguel para imobiliária",
      dueDate: new Date("2025-02-10"),
      isPaid: false,
    },
  });

  console.log("   ✅ 3 lembretes criados");

  // ===== 13. CRIAR HISTÓRICO DE IMPORTAÇÃO FICTÍCIO =====
  console.log("\n📂 Criando histórico de importação...");

  await prisma.importHistory.create({
    data: {
      accountId: accountPF.id,
      walletId: walletNubankPF.id,
      fileName: "nubank_janeiro_2025.csv",
      bankProvider: "NUBANK",
      totalRows: 15,
      importedRows: 15,
      duplicatedRows: 0,
      errorRows: 0,
      status: "SUCCESS",
    },
  });

  await prisma.importHistory.create({
    data: {
      accountId: accountPJ.id,
      walletId: walletC6Empresarial.id,
      fileName: "c6_empresarial_janeiro_2025.csv",
      bankProvider: "C6",
      totalRows: 10,
      importedRows: 9,
      duplicatedRows: 1,
      errorRows: 0,
      status: "SUCCESS",
    },
  });

  console.log("   ✅ 2 registros de histórico criados");

  // ===== RESUMO FINAL =====
  console.log("\n" + "=".repeat(50));
  console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
  console.log("=".repeat(50));
  console.log("\n📊 Resumo dos dados criados:\n");
  console.log(`   👤 Usuário: ${user.name}`);
  console.log(`   📧 Email: ${user.email}`);
  console.log(`   🔑 Senha: senha123`);
  console.log(`\n   🏦 Contas:`);
  console.log(`      • ${accountPF.name} (PF) - ${accountPF.document}`);
  console.log(`      • ${accountPJ.name} (PJ) - ${accountPJ.document}`);
  console.log(`\n   💳 Carteiras PF:`);
  console.log(`      • ${walletNubankPF.name} (Cartão)`);
  console.log(`      • ${walletContaCorrente.name}`);
  console.log(`      • ${walletPoupanca.name}`);
  console.log(`\n   💼 Carteiras PJ:`);
  console.log(`      • ${walletC6Empresarial.name} (Cartão)`);
  console.log(`      • ${walletInterPJ.name}`);
  console.log(`\n   📏 Regras de Categorização:`);
  console.log(`      • ${rulesPF.length} regras (PF)`);
  console.log(`      • ${rulesPJ.length} regras (PJ)`);
  console.log(`\n   💸 Transações:`);
  console.log(`      • ${transactionsPF.length + 1} transações (PF)`);
  console.log(`      • ${transactionsPJ.length + 2} transações (PJ)`);
  console.log(`\n   🏷️  Categorias: ${categoriesIncome.length + categoriesExpense.length}`);
  console.log(`   💰 Moedas: 1 (${brl.code})`);
  console.log(`   🔔 Lembretes: 3`);
  console.log(`\n${"=".repeat(50)}\n`);
  console.log("🚀 Você pode fazer login com:");
  console.log(`   Email: ${user.email}`);
  console.log(`   Senha: senha123\n`);
}

main()
  .catch((e) => {
    console.error("\n❌ Erro durante o seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
