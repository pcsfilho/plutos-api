import { SubscriptionFrequency } from "@prisma/client";

/**
 * Interface para criar uma subscription
 */
export interface CreateSubscriptionData {
  walletId: number;
  title: string;
  description?: string;
  frequency: SubscriptionFrequency;
  dayOfMonth?: number; // 1-31 (para MONTHLY/YEARLY)
  dayOfWeek?: number; // 1-7 (para WEEKLY)
  monthOfYear?: number; // 1-12 (para YEARLY)
  expectedAmount: number;
  minAmount?: number;
  maxAmount?: number;
  matchPattern?: string;
  nextDueDate: Date;
}

/**
 * Interface para atualizar uma subscription
 */
export interface UpdateSubscriptionData {
  title?: string;
  description?: string;
  frequency?: SubscriptionFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  monthOfYear?: number;
  expectedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  matchPattern?: string;
  nextDueDate?: Date;
  isActive?: boolean;
}

/**
 * Interface de resposta de subscription com estatísticas
 */
export interface SubscriptionWithStats {
  id: number;
  walletId: number;
  title: string;
  description?: string;
  frequency: SubscriptionFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  monthOfYear?: number;
  expectedAmount: number;
  minAmount?: number;
  maxAmount?: number;
  matchPattern?: string;
  isActive: boolean;
  nextDueDate: Date;
  lastPaidDate?: Date;
  lastPaidAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  wallet: {
    id: number;
    name: string;
  };
  stats: {
    totalPaid: number; // Total pago nos últimos 12 meses
    transactionsCount: number; // Quantidade de transações vinculadas
    averageAmount: number; // Média de valor pago
    lastPayments: Array<{
      id: number;
      amount: number;
      date: Date;
      description?: string;
    }>;
  };
}

/**
 * Interface para resultado de auto-matching
 */
export interface SubscriptionMatchResult {
  subscriptionId: number | null;
  subscription: {
    id: number;
    title: string;
    expectedAmount: number;
  } | null;
  confidence: number; // 0-100 (% de confiança no match)
  matchedBy: "pattern" | "amount" | "date" | null;
}
