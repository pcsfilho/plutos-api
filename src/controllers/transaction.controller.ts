import { Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
} from "../services/transaction.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const validIntervals = ["daily", "weekly", "monthly", "yearly"];
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      walletId,
      typeId,
      categoryId,
      amount,
      date,
      description,
      isRecurring = false,
      recurrenceInterval = null,
    } = req.body;
    if (isRecurring && !validIntervals.includes(recurrenceInterval)) {
      return res.status(400).json({
        error:
          "Intervalo de recorrência inválido. Use: daily, weekly, monthly ou yearly.",
      });
    }
    const transaction = await createTransactionService(
      walletId,
      typeId,
      categoryId,
      amount,
      description,
      date,
      isRecurring
    );
    res.status(201).json(transaction);
  } catch (err) {
    console.error("Erro ao criar transação:", err);
    res.status(500).json({ error: "Erro ao criar transação" });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const {
      walletId,
      accountId,
      startDate,
      endDate,
      typeId,
      categoryId,
      subscriptionId,
      importedFrom,
      isImported,
      hasSubscription,
      description,
      page,
      limit,
    } = req.query;

    // Converter para número se fornecido
    const walletIdNum = walletId ? parseInt(walletId as string) : undefined;
    const accountIdNum = accountId ? parseInt(accountId as string) : undefined;
    const typeIdNum = typeId ? parseInt(typeId as string) : undefined;
    const categoryIdNum = categoryId
      ? parseInt(categoryId as string)
      : undefined;
    const subscriptionIdNum = subscriptionId
      ? parseInt(subscriptionId as string)
      : undefined;

    // Converter para boolean
    const isImportedBool =
      isImported === "true"
        ? true
        : isImported === "false"
        ? false
        : undefined;
    const hasSubscriptionBool =
      hasSubscription === "true"
        ? true
        : hasSubscription === "false"
        ? false
        : undefined;

    // Parâmetros de paginação
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50;

    // Validar paginação
    if (pageNum < 1) {
      return res.status(400).json({ error: "page deve ser >= 1" });
    }
    if (limitNum < 1 || limitNum > 100) {
      return res
        .status(400)
        .json({ error: "limit deve ser entre 1 e 100" });
    }

    const result = await getAllTransactionsService(
      walletIdNum,
      accountIdNum,
      startDate as string | undefined,
      endDate as string | undefined,
      typeIdNum,
      categoryIdNum,
      subscriptionIdNum,
      importedFrom as string | undefined,
      isImportedBool,
      hasSubscriptionBool,
      description as string | undefined,
      pageNum,
      limitNum
    );

    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar transações:", err);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = await getTransactionByIdService(id);
    if (!transaction) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar transação" });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateTransactionService(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar transação" });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await deleteTransactionService(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar transação" });
  }
};
