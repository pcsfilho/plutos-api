import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createAccountService,
  listAccountsService,
  getAccountByIdService,
  updateAccountService,
  deleteAccountService,
  deactivateAccountService,
  activateAccountService,
  getUpcomingSubscriptionsByAccountService,
} from "../services/account.service";
import { AccountType } from "@prisma/client";

/**
 * POST /accounts
 * Cria uma nova conta (PF ou PJ)
 */
export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, document } = req.body;
    const userId = req.user.userId;

    // Validações
    if (!type || !name) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: type, name" });
    }

    if (type !== "PF" && type !== "PJ") {
      return res
        .status(400)
        .json({ error: "Tipo deve ser PF ou PJ" });
    }

    const account = await createAccountService({
      userId,
      type: type as AccountType,
      name,
      document,
    });

    return res.status(201).json(account);
  } catch (error: any) {
    console.error("Erro ao criar conta:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts
 * Lista todas as contas do usuário
 */
export const listAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const type = req.query.type as AccountType | undefined;

    const accounts = await listAccountsService(userId, type);
    return res.json(accounts);
  } catch (error: any) {
    console.error("Erro ao listar contas:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts/:id
 * Obtém uma conta específica
 */
export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;

    const account = await getAccountByIdService(accountId, userId);
    return res.json(account);
  } catch (error: any) {
    console.error("Erro ao buscar conta:", error);
    return res.status(404).json({ error: error.message });
  }
};

/**
 * PUT /accounts/:id
 * Atualiza uma conta
 */
export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;
    const { name, document, isActive } = req.body;

    const account = await updateAccountService(accountId, userId, {
      name,
      document,
      isActive,
    });

    return res.json(account);
  } catch (error: any) {
    console.error("Erro ao atualizar conta:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /accounts/:id
 * Deleta uma conta
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;

    await deleteAccountService(accountId, userId);
    return res.json({ message: "Conta deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar conta:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /accounts/:id/deactivate
 * Desativa uma conta (soft delete)
 */
export const deactivateAccount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;

    const account = await deactivateAccountService(accountId, userId);
    return res.json(account);
  } catch (error: any) {
    console.error("Erro ao desativar conta:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /accounts/:id/activate
 * Ativa uma conta previamente desativada
 */
export const activateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;

    const account = await activateAccountService(accountId, userId);
    return res.json(account);
  } catch (error: any) {
    console.error("Erro ao ativar conta:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts/:id/subscriptions/upcoming
 * Lista subscriptions pendentes de todas as wallets da conta
 */
export const getUpcomingSubscriptionsByAccount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user.userId;
    const daysAhead = req.query.daysAhead ? Number(req.query.daysAhead) : 7;

    const result = await getUpcomingSubscriptionsByAccountService(
      accountId,
      userId,
      daysAhead
    );
    return res.json(result);
  } catch (error: any) {
    console.error("Erro ao buscar subscriptions pendentes da conta:", error);
    return res.status(500).json({ error: error.message });
  }
};
