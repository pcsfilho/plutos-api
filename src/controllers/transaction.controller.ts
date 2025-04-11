import { Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
} from "../services/transaction.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      walletId,
      typeId,
      categoryId,
      amount,
      date,
      description,
      isRecurring,
    } = req.body;
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
    const walletId = parseInt(req.params.walletId);

    const transactions = await getAllTransactionsService(walletId);
    res.json(transactions);
  } catch (err) {
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
