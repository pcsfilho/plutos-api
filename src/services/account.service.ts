import { PrismaClient, AccountType } from "@prisma/client";
import { addDays, isBefore, isAfter } from "date-fns";

const prisma = new PrismaClient();

/**
 * Interface para criar uma nova conta (PF ou PJ)
 */
export interface CreateAccountData {
  userId: number;
  type: AccountType;
  name: string;
  document?: string; // CPF ou CNPJ
}

/**
 * Interface para atualizar uma conta existente
 */
export interface UpdateAccountData {
  name?: string;
  document?: string;
  isActive?: boolean;
}

/**
 * Cria uma nova conta (PF ou PJ) para um usuário
 */
export const createAccountService = async (data: CreateAccountData) => {
  // Valida se usuário existe
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Cria a conta
  const account = await prisma.account.create({
    data: {
      userId: data.userId,
      type: data.type,
      name: data.name,
      document: data.document,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return account;
};

/**
 * Lista todas as contas de um usuário
 */
export const listAccountsService = async (
  userId: number,
  type?: AccountType
) => {
  const where: any = { userId };

  // Filtrar por tipo se especificado
  if (type) {
    where.type = type;
  }

  const accounts = await prisma.account.findMany({
    where,
    include: {
      _count: {
        select: {
          wallets: true,
          categoryRules: true,
          importHistory: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts;
};

/**
 * Obtém uma conta específica por ID
 */
export const getAccountByIdService = async (
  accountId: number,
  userId: number
) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: userId, // Garante que a conta pertence ao usuário
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      wallets: {
        include: {
          currency: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      },
      _count: {
        select: {
          wallets: true,
          categoryRules: true,
          importHistory: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Conta não encontrada ou não pertence ao usuário");
  }

  return account;
};

/**
 * Atualiza uma conta existente
 */
export const updateAccountService = async (
  accountId: number,
  userId: number,
  data: UpdateAccountData
) => {
  // Verifica se a conta pertence ao usuário
  const existing = await getAccountByIdService(accountId, userId);

  if (!existing) {
    throw new Error("Conta não encontrada ou não pertence ao usuário");
  }

  // Atualiza a conta
  const updated = await prisma.account.update({
    where: { id: accountId },
    data: {
      name: data.name,
      document: data.document,
      isActive: data.isActive,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Deleta uma conta
 * ATENÇÃO: Isso irá deletar em cascata todas as wallets, transações, etc.
 */
export const deleteAccountService = async (
  accountId: number,
  userId: number
) => {
  // Verifica se a conta pertence ao usuário
  const existing = await getAccountByIdService(accountId, userId);

  if (!existing) {
    throw new Error("Conta não encontrada ou não pertence ao usuário");
  }

  // TODO: Verificar se há transações antes de deletar
  // Por segurança, pode ser melhor apenas desativar (isActive = false)

  await prisma.account.delete({
    where: { id: accountId },
  });

  return { message: "Conta deletada com sucesso" };
};

/**
 * Desativa uma conta (soft delete)
 */
export const deactivateAccountService = async (
  accountId: number,
  userId: number
) => {
  return updateAccountService(accountId, userId, { isActive: false });
};

/**
 * Ativa uma conta previamente desativada
 */
export const activateAccountService = async (
  accountId: number,
  userId: number
) => {
  return updateAccountService(accountId, userId, { isActive: true });
};

/**
 * Lista subscriptions pendentes de todas as wallets da conta
 */
export const getUpcomingSubscriptionsByAccountService = async (
  accountId: number,
  userId: number,
  daysAhead: number = 7
) => {
  // Verifica se a conta pertence ao usuário
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: userId,
    },
  });

  if (!account) {
    throw new Error("Conta não encontrada ou não pertence ao usuário");
  }

  const today = new Date();
  const futureDate = addDays(today, daysAhead);

  // Busca todas as subscriptions ativas de todas as wallets da conta
  const subscriptions = await prisma.subscription.findMany({
    where: {
      wallet: {
        accountId: accountId,
      },
      isActive: true,
      nextDueDate: {
        lte: futureDate,
      },
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: { nextDueDate: "asc" },
  });

  // Separa em atrasadas e próximas
  const overdue = subscriptions.filter((s) => isBefore(s.nextDueDate, today));
  const upcoming = subscriptions.filter(
    (s) => !isBefore(s.nextDueDate, today) && !isAfter(s.nextDueDate, futureDate)
  );

  return {
    overdue,
    upcoming,
    total: subscriptions.length,
  };
};
