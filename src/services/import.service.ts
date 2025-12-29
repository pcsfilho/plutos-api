import { PrismaClient, BankProvider } from "@prisma/client";
import {
  ParsedTransaction,
  PreviewTransaction,
  ImportPreviewResponse,
  ImportConfirmResponse,
  ImportStatus,
} from "../types/import.types";
import {
  BANK_CSV_CONFIGS,
  parseCSVContent,
  validateCSVFile,
} from "../utils/csv-parser.util";
import { applyCategoryRulesService } from "./category-rule.service";

const prisma = new PrismaClient();

/**
 * Detecta se uma transação é duplicata
 * Critérios: mesma wallet, mesma data, mesmo valor absoluto, descrição similar
 */
export const detectDuplicateService = async (
  walletId: number,
  transaction: ParsedTransaction
): Promise<{
  isDuplicate: boolean;
  existingTransactionId?: number;
}> => {
  // Busca transações similares (mesma data, mesmo valor)
  const existing = await prisma.transaction.findFirst({
    where: {
      walletId: walletId,
      date: transaction.date,
      amount: Math.abs(transaction.amount), // Compara valor absoluto
      description: {
        // Primeiros 20 caracteres da descrição
        contains: transaction.description.substring(0, 20),
      },
    },
  });

  return {
    isDuplicate: !!existing,
    existingTransactionId: existing?.id,
  };
};

/**
 * Gera preview das transações a serem importadas
 * Não salva nada no banco, apenas analisa e retorna metadados
 */
export const generateImportPreviewService = async (
  accountId: number,
  walletId: number,
  csvContent: string,
  bankProvider: BankProvider
): Promise<ImportPreviewResponse> => {
  // Valida que a wallet pertence à conta
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      accountId: accountId,
    },
  });

  if (!wallet) {
    throw new Error("Wallet não encontrada ou não pertence à conta");
  }

  // Obtém configuração do banco
  const config = BANK_CSV_CONFIGS[bankProvider];
  if (!config) {
    throw new Error(`Banco não suportado: ${bankProvider}`);
  }

  // Parse do CSV
  const parsedTransactions = parseCSVContent(csvContent, config);

  if (parsedTransactions.length === 0) {
    throw new Error("Nenhuma transação válida encontrada no CSV");
  }

  // Processa cada transação
  const previewTransactions: PreviewTransaction[] = [];
  let duplicateCount = 0;
  let errorCount = 0;

  for (const transaction of parsedTransactions) {
    try {
      // Detecta duplicata
      const duplicateCheck = await detectDuplicateService(
        walletId,
        transaction
      );

      if (duplicateCheck.isDuplicate) {
        duplicateCount++;
      }

      // Aplica regras de categorização
      const categoryMatch = await applyCategoryRulesService(
        transaction.description,
        accountId,
        walletId
      );

      previewTransactions.push({
        ...transaction,
        isDuplicate: duplicateCheck.isDuplicate,
        duplicateTransactionId: duplicateCheck.existingTransactionId,
        suggestedCategoryId: categoryMatch.categoryId,
        suggestedCategoryName: categoryMatch.categoryName,
        matchedRule: categoryMatch.matchedRule,
      });
    } catch (error: any) {
      errorCount++;
      previewTransactions.push({
        ...transaction,
        isDuplicate: false,
        suggestedCategoryId: null,
        suggestedCategoryName: null,
        errors: [error.message],
      });
    }
  }

  // Gera resumo
  const validTransactions = previewTransactions.filter((t) => !t.errors);
  const totalAmount = validTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const dates = validTransactions.map((t) => t.date);
  const dateRange = {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };

  // Agrupa por categoria para o breakdown
  const categoriesMap = new Map<
    number,
    {
      categoryId: number;
      categoryName: string;
      count: number;
      totalAmount: number;
    }
  >();

  for (const transaction of validTransactions) {
    if (transaction.suggestedCategoryId) {
      const existing = categoriesMap.get(transaction.suggestedCategoryId);
      if (existing) {
        existing.count++;
        existing.totalAmount += transaction.amount;
      } else {
        categoriesMap.set(transaction.suggestedCategoryId, {
          categoryId: transaction.suggestedCategoryId,
          categoryName:
            transaction.suggestedCategoryName || "Sem categoria",
          count: 1,
          totalAmount: transaction.amount,
        });
      }
    }
  }

  return {
    totalTransactions: parsedTransactions.length,
    validTransactions: validTransactions.length,
    duplicates: duplicateCount,
    errors: errorCount,
    transactions: previewTransactions,
    summary: {
      totalAmount,
      dateRange,
      categoriesBreakdown: Array.from(categoriesMap.values()),
    },
  };
};

/**
 * Confirma e executa a importação das transações
 */
export const confirmImportService = async (
  accountId: number,
  walletId: number,
  bankProvider: BankProvider,
  transactions: PreviewTransaction[],
  overrideDuplicates: boolean = false
): Promise<ImportConfirmResponse> => {
  // Valida que a wallet pertence à conta
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      accountId: accountId,
    },
  });

  if (!wallet) {
    throw new Error("Wallet não encontrada ou não pertence à conta");
  }

  // Filtra transações válidas (sem erros)
  let transactionsToImport = transactions.filter((t) => !t.errors || t.errors.length === 0);

  // Remove duplicatas se não for override
  if (!overrideDuplicates) {
    transactionsToImport = transactionsToImport.filter(
      (t) => !t.isDuplicate
    );
  }

  const importId = `import_${Date.now()}`;
  const errors: string[] = [];
  let importedCount = 0;
  const skippedCount =
    transactions.length - transactionsToImport.length;

  // Busca tipos de transação (Entrada/Saída)
  const [typeIncome, typeExpense] = await Promise.all([
    prisma.transactionType.findFirst({ where: { name: "Entrada" } }),
    prisma.transactionType.findFirst({ where: { name: "Saída" } }),
  ]);

  if (!typeIncome || !typeExpense) {
    throw new Error(
      "Tipos de transação não encontrados. Execute o seed do banco."
    );
  }

  // Busca categoria padrão "Outros" ou cria se não existir
  let defaultCategory = await prisma.category.findFirst({
    where: { name: "Outros" },
  });

  if (!defaultCategory) {
    // Cria categoria padrão (assumindo tipo Saída)
    defaultCategory = await prisma.category.create({
      data: {
        name: "Outros",
        typeId: typeExpense.id,
      },
    });
  }

  // Usa transação do Prisma para atomicidade
  let historyId = 0;

  try {
    await prisma.$transaction(async (tx) => {
      // Importa cada transação
      for (const transaction of transactionsToImport) {
        try {
          // Determina tipo baseado no valor (negativo = saída, positivo = entrada)
          const typeId =
            transaction.amount < 0 ? typeExpense.id : typeIncome.id;
          const categoryId =
            transaction.suggestedCategoryId || defaultCategory!.id;

          await tx.transaction.create({
            data: {
              walletId: walletId,
              typeId: typeId,
              categoryId: categoryId,
              amount: Math.abs(transaction.amount), // Sempre positivo no banco
              description: transaction.description.substring(0, 255), // Limita tamanho
              date: transaction.date,
              importedFrom: importId,
              isRecurring: false,
            },
          });

          importedCount++;
        } catch (error: any) {
          const errorMsg = `Erro ao importar "${transaction.description}": ${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Registra histórico de importação
      const history = await tx.importHistory.create({
        data: {
          accountId: accountId,
          walletId: walletId,
          fileName: `import_${bankProvider}_${new Date().toISOString()}`,
          bankProvider: bankProvider,
          totalRows: transactions.length,
          importedRows: importedCount,
          duplicatedRows: transactions.filter((t) => t.isDuplicate).length,
          errorRows: errors.length,
          status:
            errors.length > 0
              ? ImportStatus.PARTIAL
              : ImportStatus.SUCCESS,
        },
      });

      historyId = history.id;
    });
  } catch (error: any) {
    throw new Error(
      `Erro na transação de importação: ${error.message}`
    );
  }

  return {
    success: errors.length === 0,
    importedCount,
    skippedCount,
    importHistoryId: historyId,
    errors,
  };
};

/**
 * Lista o histórico de importações
 */
export const getImportHistoryService = async (
  accountId: number,
  walletId?: number
) => {
  const where: any = { accountId };

  if (walletId) {
    where.walletId = walletId;
  }

  const history = await prisma.importHistory.findMany({
    where,
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Últimas 50 importações
  });

  return history;
};
