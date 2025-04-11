import { Request, Response } from "express";
import {
  createWalletService,
  listWalletsService,
  getWalletByIdService,
  updateWalletService,
  deleteWalletService,
} from "../services/wallet.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createWallet = async (req: AuthRequest, res: Response) => {
  const { name, currency, balance } = req.body;

  try {
    const wallet = await createWalletService({
      name,
      currency,
      balance: balance ?? 0,
      userId: req.user.userId,
    });

    return res.status(201).json(wallet);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const listWallets = async (req: AuthRequest, res: Response) => {
  try {
    const wallets = await listWalletsService(req.user.userId);
    return res.json(wallets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWalletById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const wallet = await getWalletByIdService(Number(id));
    if (!wallet) {
      return res.status(404).json({ error: "Carteira não encontrada" });
    }

    return res.json(wallet);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateWallet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, currencyId } = req.body;

  try {
    const wallet = await updateWalletService(Number(id), name, currencyId);

    if (!wallet?.count) {
      return res
        .status(404)
        .json({ error: "Carteira não encontrada ou não pertence ao usuário" });
    }

    return res.json({ message: "Carteira atualizada com sucesso" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteWallet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const wallet = await deleteWalletService(Number(id));
    if (!wallet?.count) {
      return res
        .status(404)
        .json({ error: "Carteira não encontrada ou não pertence ao usuário" });
    }

    return res.json({ message: "Carteira deletada com sucesso" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
