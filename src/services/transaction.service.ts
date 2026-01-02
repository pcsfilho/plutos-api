import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateTransactionInput {
  walletId: number;
  typeId: number;
  categoryId: number;
  amount: number;
  description?: string;
  date: string;
  isRecurring?: boolean;
}

export const createTransactionService = async (
  walletId: number,
  typeId: number,
  categoryId: number,
  amount: number,
  date: string,
  description?: string,
  isRecurring?: boolean,
  recurrenceInterval?: string
) => {
  const transaction = await prisma.transaction.create({
    data: {
      walletId: walletId,
      typeId: typeId,
      categoryId: categoryId,
      amount: amount,
      description: description,
      date: new Date(date),
      isRecurring: isRecurring || false,
      recurrenceInterval: isRecurring ? recurrenceInterval || "monthly" : "",
    },
  });

  return transaction;
};

export const getAllTransactionsService = async (
  walletId?: number,
  accountId?: number,
  startDate?: string,
  endDate?: string,
  typeId?: number,
  categoryId?: number,
  subscriptionId?: number,
  importedFrom?: string,
  isImported?: boolean,
  hasSubscription?: boolean,
  description?: string,
  page: number = 1,
  limit: number = 50
) => {
  // Construir filtro dinâmico
  const where: any = {};

  // Filtrar por walletId se fornecido
  if (walletId) {
    where.walletId = walletId;
  }

  // Filtrar por accountId (buscar wallets da conta)
  if (accountId && !walletId) {
    where.wallet = {
      accountId: accountId,
    };
  }

  // Filtrar por range de datas
  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  // Filtrar por tipo (Entrada/Saída)
  if (typeId) {
    where.typeId = typeId;
  }

  // Filtrar por categoria
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Filtrar por subscription vinculada
  if (subscriptionId) {
    where.subscriptionId = subscriptionId;
  }

  // Filtrar por importação específica
  if (importedFrom) {
    where.importedFrom = importedFrom;
  }

  // Filtrar apenas transações importadas (ou não importadas)
  if (isImported !== undefined) {
    if (isImported) {
      where.importedFrom = { not: null };
    } else {
      where.importedFrom = null;
    }
  }

  // Filtrar apenas transações com subscription vinculada (ou sem)
  if (hasSubscription !== undefined) {
    if (hasSubscription) {
      where.subscriptionId = { not: null };
    } else {
      where.subscriptionId = null;
    }
  }

  // Buscar por descrição (like)
  if (description) {
    where.description = {
      contains: description,
      mode: "insensitive", // Case-insensitive
    };
  }

  // Calcular skip e take para paginação
  const skip = (page - 1) * limit;
  const take = limit;

  // Buscar transações com paginação
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy: { date: "desc" },
      include: {
        type: true,
        category: true,
        wallet: {
          select: {
            id: true,
            name: true,
            type: true,
            accountId: true,
          },
        },
        subscription: {
          select: {
            id: true,
            title: true,
            frequency: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Calcular metadados de paginação
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

export const getTransactionByIdService = async (id: number) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      type: true,
      category: true,
      wallet: true,
    },
  });
};

export const updateTransactionService = async (
  id: number,
  data: Partial<CreateTransactionInput>
) => {
  return prisma.transaction.update({
    where: { id },
    data: {
      walletId: data.walletId,
      typeId: data.typeId,
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      isRecurring: data.isRecurring,
    },
  });
};

export const deleteTransactionService = async (id: number) => {
  return prisma.transaction.delete({ where: { id } });
};
