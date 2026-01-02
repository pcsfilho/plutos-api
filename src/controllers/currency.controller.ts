import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Listar todas as moedas
 * GET /currencies
 */
export const listCurrencies = async (req: Request, res: Response) => {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: {
        code: "asc",
      },
    });

    res.json(currencies);
  } catch (error) {
    console.error("Erro ao listar moedas:", error);
    res.status(500).json({ error: "Erro ao listar moedas" });
  }
};

/**
 * Buscar moeda por ID
 * GET /currencies/:id
 */
export const getCurrencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const currency = await prisma.currency.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currency) {
      return res.status(404).json({ error: "Moeda não encontrada" });
    }

    res.json(currency);
  } catch (error) {
    console.error("Erro ao buscar moeda:", error);
    res.status(500).json({ error: "Erro ao buscar moeda" });
  }
};

/**
 * Criar nova moeda (admin)
 * POST /currencies
 */
export const createCurrency = async (req: Request, res: Response) => {
  try {
    const { name, code, symbol, exchangeRate } = req.body;

    // Validações básicas
    if (!name || !code || !symbol) {
      return res.status(400).json({
        error: "Campos obrigatórios: name, code, symbol",
      });
    }

    // Verificar se código já existe
    const existing = await prisma.currency.findFirst({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({
        error: `Moeda com código ${code} já existe`,
      });
    }

    const currency = await prisma.currency.create({
      data: {
        name,
        code: code.toUpperCase(),
        symbol,
        exchangeRate: exchangeRate || 1.0,
      },
    });

    res.status(201).json(currency);
  } catch (error) {
    console.error("Erro ao criar moeda:", error);
    res.status(500).json({ error: "Erro ao criar moeda" });
  }
};

/**
 * Atualizar moeda (principalmente taxa de câmbio)
 * PUT /currencies/:id
 */
export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, symbol, exchangeRate } = req.body;

    const currency = await prisma.currency.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currency) {
      return res.status(404).json({ error: "Moeda não encontrada" });
    }

    const updated = await prisma.currency.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(symbol && { symbol }),
        ...(exchangeRate !== undefined && { exchangeRate }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar moeda:", error);
    res.status(500).json({ error: "Erro ao atualizar moeda" });
  }
};

/**
 * Deletar moeda
 * DELETE /currencies/:id
 * Nota: Só permite deletar se não houver wallets usando a moeda
 */
export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const currency = await prisma.currency.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { wallets: true },
        },
      },
    });

    if (!currency) {
      return res.status(404).json({ error: "Moeda não encontrada" });
    }

    // Verificar se há wallets usando esta moeda
    if (currency._count.wallets > 0) {
      return res.status(400).json({
        error: `Não é possível deletar. Existem ${currency._count.wallets} carteira(s) usando esta moeda`,
      });
    }

    await prisma.currency.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Moeda deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar moeda:", error);
    res.status(500).json({ error: "Erro ao deletar moeda" });
  }
};
