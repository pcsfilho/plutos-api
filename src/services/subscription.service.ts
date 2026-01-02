import { PrismaClient, SubscriptionFrequency } from "@prisma/client";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  differenceInDays,
} from "date-fns";
import {
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionWithStats,
  SubscriptionMatchResult,
} from "../types/subscription.types";

const prisma = new PrismaClient();

/**
 * Calcula a próxima data de vencimento baseado na frequência
 */
export const calculateNextDueDate = (
  currentDate: Date,
  frequency: SubscriptionFrequency,
  dayOfMonth?: number,
  dayOfWeek?: number,
  monthOfYear?: number
): Date => {
  let nextDate = new Date(currentDate);

  switch (frequency) {
    case "DAILY":
      nextDate = addDays(currentDate, 1);
      break;

    case "WEEKLY":
      nextDate = addWeeks(currentDate, 1);
      if (dayOfWeek) {
        // Ajusta para o dia da semana especificado
        const currentDayOfWeek = nextDate.getDay() || 7; // Domingo = 7
        const diff = dayOfWeek - currentDayOfWeek;
        if (diff !== 0) {
          nextDate = addDays(nextDate, diff);
        }
      }
      break;

    case "MONTHLY":
      nextDate = addMonths(currentDate, 1);
      if (dayOfMonth) {
        nextDate.setDate(Math.min(dayOfMonth, 28)); // Evita problemas com meses curtos
      }
      break;

    case "YEARLY":
      nextDate = addYears(currentDate, 1);
      if (monthOfYear) {
        nextDate.setMonth(monthOfYear - 1); // Mês é 0-indexed
      }
      if (dayOfMonth) {
        nextDate.setDate(Math.min(dayOfMonth, 28));
      }
      break;
  }

  return nextDate;
};

/**
 * Cria uma nova subscription
 */
export const createSubscriptionService = async (
  data: CreateSubscriptionData
) => {
  // Valida que a wallet existe
  const wallet = await prisma.wallet.findUnique({
    where: { id: data.walletId },
  });

  if (!wallet) {
    throw new Error("Wallet não encontrada");
  }

  // Valida campos obrigatórios por frequência
  if (data.frequency === "WEEKLY" && !data.dayOfWeek) {
    throw new Error("dayOfWeek é obrigatório para frequência WEEKLY");
  }

  if (data.frequency === "MONTHLY" && !data.dayOfMonth) {
    throw new Error("dayOfMonth é obrigatório para frequência MONTHLY");
  }

  if (data.frequency === "YEARLY") {
    if (!data.dayOfMonth || !data.monthOfYear) {
      throw new Error(
        "dayOfMonth e monthOfYear são obrigatórios para frequência YEARLY"
      );
    }
  }

  const subscription = await prisma.subscription.create({
    data: {
      walletId: data.walletId,
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      monthOfYear: data.monthOfYear,
      expectedAmount: data.expectedAmount,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
      matchPattern: data.matchPattern?.toLowerCase().trim(),
      nextDueDate: data.nextDueDate,
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return subscription;
};

/**
 * Lista subscriptions de uma wallet
 */
export const listSubscriptionsService = async (
  walletId: number,
  includeInactive: boolean = false
) => {
  const where: any = { walletId };

  if (!includeInactive) {
    where.isActive = true;
  }

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: [{ nextDueDate: "asc" }],
  });

  return subscriptions;
};

/**
 * Obtém uma subscription por ID com estatísticas
 */
export const getSubscriptionByIdService = async (
  subscriptionId: number,
  walletId: number
): Promise<SubscriptionWithStats | null> => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      walletId: walletId, // Garante que pertence à wallet
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
      transactions: {
        select: {
          id: true,
          amount: true,
          date: true,
          description: true,
        },
        orderBy: { date: "desc" },
        take: 12, // Últimos 12 pagamentos
      },
    },
  });

  if (!subscription) {
    return null;
  }

  // Calcula estatísticas
  const totalPaid = subscription.transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const transactionsCount = subscription.transactions.length;
  const averageAmount =
    transactionsCount > 0 ? totalPaid / transactionsCount : 0;

  return {
    id: subscription.id,
    walletId: subscription.walletId,
    title: subscription.title,
    description: subscription.description || undefined,
    frequency: subscription.frequency,
    dayOfMonth: subscription.dayOfMonth || undefined,
    dayOfWeek: subscription.dayOfWeek || undefined,
    monthOfYear: subscription.monthOfYear || undefined,
    expectedAmount: subscription.expectedAmount,
    minAmount: subscription.minAmount || undefined,
    maxAmount: subscription.maxAmount || undefined,
    matchPattern: subscription.matchPattern || undefined,
    isActive: subscription.isActive,
    nextDueDate: subscription.nextDueDate,
    lastPaidDate: subscription.lastPaidDate || undefined,
    lastPaidAmount: subscription.lastPaidAmount || undefined,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    wallet: subscription.wallet,
    stats: {
      totalPaid,
      transactionsCount,
      averageAmount,
      lastPayments: subscription.transactions.slice(0, 5).map(t => ({
        id: t.id,
        amount: t.amount,
        date: t.date,
        description: t.description || undefined,
      })),
    },
  };
};

/**
 * Atualiza uma subscription
 */
export const updateSubscriptionService = async (
  subscriptionId: number,
  walletId: number,
  data: UpdateSubscriptionData
) => {
  // Verifica se existe
  const existing = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      walletId: walletId,
    },
  });

  if (!existing) {
    throw new Error("Subscription não encontrada ou não pertence à wallet");
  }

  // Prepara dados de atualização
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth;
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
  if (data.monthOfYear !== undefined) updateData.monthOfYear = data.monthOfYear;
  if (data.expectedAmount !== undefined)
    updateData.expectedAmount = data.expectedAmount;
  if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
  if (data.maxAmount !== undefined) updateData.maxAmount = data.maxAmount;
  if (data.matchPattern !== undefined)
    updateData.matchPattern = data.matchPattern?.toLowerCase().trim();
  if (data.nextDueDate !== undefined) updateData.nextDueDate = data.nextDueDate;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: updateData,
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Deleta uma subscription
 */
export const deleteSubscriptionService = async (
  subscriptionId: number,
  walletId: number
) => {
  const existing = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      walletId: walletId,
    },
  });

  if (!existing) {
    throw new Error("Subscription não encontrada ou não pertence à wallet");
  }

  // Remove vinculação de transações antes de deletar
  await prisma.transaction.updateMany({
    where: { subscriptionId: subscriptionId },
    data: { subscriptionId: null },
  });

  await prisma.subscription.delete({
    where: { id: subscriptionId },
  });

  return { message: "Subscription deletada com sucesso" };
};

/**
 * Tenta fazer auto-matching de uma transação com subscriptions ativas
 * Retorna a subscription que melhor combina ou null
 */
export const matchTransactionToSubscriptionService = async (
  walletId: number,
  description: string,
  amount: number,
  date: Date
): Promise<SubscriptionMatchResult> => {
  // Busca subscriptions ativas da wallet
  const subscriptions = await prisma.subscription.findMany({
    where: {
      walletId: walletId,
      isActive: true,
    },
  });

  if (subscriptions.length === 0) {
    return {
      subscriptionId: null,
      subscription: null,
      confidence: 0,
      matchedBy: null,
    };
  }

  let bestMatch: any = null;
  let bestConfidence = 0;
  let matchedBy: "pattern" | "amount" | "date" | null = null;

  for (const sub of subscriptions) {
    let confidence = 0;

    // 1. Testa pattern (peso 50)
    if (sub.matchPattern) {
      const normalizedDescription = description.toLowerCase().trim();
      if (normalizedDescription.includes(sub.matchPattern)) {
        confidence += 50;
        if (!matchedBy) matchedBy = "pattern";
      }
    }

    // 2. Testa valor (peso 30)
    const minAmount = sub.minAmount || sub.expectedAmount * 0.9;
    const maxAmount = sub.maxAmount || sub.expectedAmount * 1.1;

    if (amount >= minAmount && amount <= maxAmount) {
      confidence += 30;
      if (!matchedBy) matchedBy = "amount";
    }

    // 3. Testa proximidade de data (peso 20)
    const daysDiff = Math.abs(differenceInDays(date, sub.nextDueDate));
    if (daysDiff <= 3) {
      // Dentro de 3 dias
      confidence += 20;
      if (!matchedBy) matchedBy = "date";
    } else if (daysDiff <= 7) {
      // Dentro de 7 dias
      confidence += 10;
    }

    // Atualiza best match
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestMatch = sub;
    }
  }

  // Só retorna match se confiança >= 50%
  if (bestConfidence >= 50 && bestMatch) {
    return {
      subscriptionId: bestMatch.id,
      subscription: {
        id: bestMatch.id,
        title: bestMatch.title,
        expectedAmount: bestMatch.expectedAmount,
      },
      confidence: bestConfidence,
      matchedBy,
    };
  }

  return {
    subscriptionId: null,
    subscription: null,
    confidence: 0,
    matchedBy: null,
  };
};

/**
 * Marca uma subscription como paga e atualiza nextDueDate
 */
export const markSubscriptionAsPaidService = async (
  subscriptionId: number,
  walletId: number,
  paidAmount: number,
  paidDate: Date
) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      walletId: walletId,
    },
  });

  if (!subscription) {
    throw new Error("Subscription não encontrada");
  }

  // Calcula próxima data de vencimento
  const nextDueDate = calculateNextDueDate(
    paidDate,
    subscription.frequency,
    subscription.dayOfMonth || undefined,
    subscription.dayOfWeek || undefined,
    subscription.monthOfYear || undefined
  );

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      lastPaidDate: paidDate,
      lastPaidAmount: paidAmount,
      nextDueDate: nextDueDate,
    },
  });

  return updated;
};

/**
 * Lista subscriptions pendentes (vencendo em breve ou atrasadas)
 */
export const getUpcomingSubscriptionsService = async (
  walletId: number,
  daysAhead: number = 7
) => {
  const today = new Date();
  const futureDate = addDays(today, daysAhead);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      walletId: walletId,
      isActive: true,
      nextDueDate: {
        lte: futureDate, // Vence até a data futura
      },
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
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
