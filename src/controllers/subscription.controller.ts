import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { SubscriptionFrequency } from "@prisma/client";
import {
  createSubscriptionService,
  listSubscriptionsService,
  getSubscriptionByIdService,
  updateSubscriptionService,
  deleteSubscriptionService,
  markSubscriptionAsPaidService,
  getUpcomingSubscriptionsService,
} from "../services/subscription.service";

/**
 * POST /wallets/:walletId/subscriptions
 * Cria uma nova subscription
 */
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const walletId = Number(req.params.walletId);
    const {
      title,
      description,
      frequency,
      dayOfMonth,
      dayOfWeek,
      monthOfYear,
      expectedAmount,
      minAmount,
      maxAmount,
      matchPattern,
      nextDueDate,
    } = req.body;

    // Validações básicas
    if (!title || !frequency || !expectedAmount || !nextDueDate) {
      return res.status(400).json({
        error:
          "Campos obrigatórios: title, frequency, expectedAmount, nextDueDate",
      });
    }

    // Valida frequency
    const validFrequencies = Object.values(SubscriptionFrequency);
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        error: `Frequência inválida. Use: ${validFrequencies.join(", ")}`,
      });
    }

    // TODO: Validar que walletId pertence ao usuário autenticado

    const subscription = await createSubscriptionService({
      walletId,
      title,
      description,
      frequency,
      dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
      dayOfWeek: dayOfWeek ? Number(dayOfWeek) : undefined,
      monthOfYear: monthOfYear ? Number(monthOfYear) : undefined,
      expectedAmount: Number(expectedAmount),
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      matchPattern,
      nextDueDate: new Date(nextDueDate),
    });

    return res.status(201).json(subscription);
  } catch (error: any) {
    console.error("Erro ao criar subscription:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /wallets/:walletId/subscriptions
 * Lista subscriptions de uma wallet
 */
export const listSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const walletId = Number(req.params.walletId);
    const includeInactive = req.query.includeInactive === "true";

    const subscriptions = await listSubscriptionsService(
      walletId,
      includeInactive
    );
    return res.json(subscriptions);
  } catch (error: any) {
    console.error("Erro ao listar subscriptions:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /wallets/:walletId/subscriptions/:id
 * Obtém uma subscription específica com estatísticas
 */
export const getSubscriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const walletId = Number(req.params.walletId);
    const subscriptionId = Number(req.params.id);

    const subscription = await getSubscriptionByIdService(
      subscriptionId,
      walletId
    );

    if (!subscription) {
      return res.status(404).json({ error: "Subscription não encontrada" });
    }

    return res.json(subscription);
  } catch (error: any) {
    console.error("Erro ao buscar subscription:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /wallets/:walletId/subscriptions/:id
 * Atualiza uma subscription
 */
export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const walletId = Number(req.params.walletId);
    const subscriptionId = Number(req.params.id);
    const {
      title,
      description,
      frequency,
      dayOfMonth,
      dayOfWeek,
      monthOfYear,
      expectedAmount,
      minAmount,
      maxAmount,
      matchPattern,
      nextDueDate,
      isActive,
    } = req.body;

    const subscription = await updateSubscriptionService(
      subscriptionId,
      walletId,
      {
        title,
        description,
        frequency,
        dayOfMonth: dayOfMonth !== undefined ? Number(dayOfMonth) : undefined,
        dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
        monthOfYear:
          monthOfYear !== undefined ? Number(monthOfYear) : undefined,
        expectedAmount:
          expectedAmount !== undefined ? Number(expectedAmount) : undefined,
        minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
        matchPattern,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        isActive,
      }
    );

    return res.json(subscription);
  } catch (error: any) {
    console.error("Erro ao atualizar subscription:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /wallets/:walletId/subscriptions/:id
 * Deleta uma subscription
 */
export const deleteSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const walletId = Number(req.params.walletId);
    const subscriptionId = Number(req.params.id);

    await deleteSubscriptionService(subscriptionId, walletId);
    return res.json({ message: "Subscription deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar subscription:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /wallets/:walletId/subscriptions/:id/mark-paid
 * Marca uma subscription como paga e atualiza nextDueDate
 */
export const markSubscriptionAsPaid = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const walletId = Number(req.params.walletId);
    const subscriptionId = Number(req.params.id);
    const { paidAmount, paidDate } = req.body;

    if (!paidAmount || !paidDate) {
      return res.status(400).json({
        error: "Campos obrigatórios: paidAmount, paidDate",
      });
    }

    const subscription = await markSubscriptionAsPaidService(
      subscriptionId,
      walletId,
      Number(paidAmount),
      new Date(paidDate)
    );

    return res.json(subscription);
  } catch (error: any) {
    console.error("Erro ao marcar subscription como paga:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /wallets/:walletId/subscriptions/upcoming
 * Lista subscriptions pendentes (vencendo em breve ou atrasadas)
 */
export const getUpcomingSubscriptions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const walletId = Number(req.params.walletId);
    const daysAhead = req.query.daysAhead
      ? Number(req.query.daysAhead)
      : 7;

    const upcoming = await getUpcomingSubscriptionsService(
      walletId,
      daysAhead
    );
    return res.json(upcoming);
  } catch (error: any) {
    console.error("Erro ao buscar subscriptions pendentes:", error);
    return res.status(500).json({ error: error.message });
  }
};
