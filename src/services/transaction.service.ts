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
  isRecurring?: boolean
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
    },
  });

  return transaction;
};

export const getAllTransactionsService = async (walletId: number) => {
  return prisma.transaction.findMany({
    where: { walletId },
    orderBy: { date: "desc" },
    include: {
      type: true,
      category: true,
    },
  });
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
