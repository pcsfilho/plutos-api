const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Verificando transações do accountId 4 ===\n');

  const transactions = await prisma.transaction.findMany({
    where: {
      wallet: {
        accountId: 4
      }
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          accountId: true
        }
      }
    },
    orderBy: { date: 'desc' },
    take: 10
  });

  if (transactions.length > 0) {
    console.log(`Total de transações: ${transactions.length}\n`);

    transactions.forEach((t, i) => {
      console.log(`${i + 1}. ID: ${t.id} | Data: ${t.date} | Valor: ${t.amount} | Wallet: ${t.wallet.name}`);
    });

    const lastIndex = transactions.length - 1;
    console.log('\n=== RESUMO DE DATAS ===');
    console.log('Primeira data:', transactions[lastIndex].date);
    console.log('Última data:', transactions[0].date);
  } else {
    console.log('❌ Nenhuma transação encontrada para accountId 4');

    // Verificar se existem wallets para esse account
    const wallets = await prisma.wallet.findMany({
      where: { accountId: 4 }
    });

    console.log(`\nWallets do accountId 4: ${wallets.length}`);
    if (wallets.length > 0) {
      wallets.forEach(w => console.log(`  - Wallet ID ${w.id}: ${w.name}`));
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
