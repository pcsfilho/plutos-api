import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BankProvider } from "@prisma/client";
import {
  generateImportPreviewService,
  confirmImportService,
  getImportHistoryService,
} from "../services/import.service";
import { validateCSVFile } from "../utils/csv-parser.util";

/**
 * POST /accounts/:accountId/wallets/:walletId/import-preview
 * Gera preview da importação sem salvar no banco
 */
export const generateImportPreview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const accountId = Number(req.params.accountId);
    const walletId = Number(req.params.walletId);
    const { csvContent, bankProvider } = req.body;

    // Validações básicas
    if (!csvContent || !bankProvider) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: csvContent, bankProvider" });
    }

    // Valida provider
    const validProviders = Object.values(BankProvider);
    if (!validProviders.includes(bankProvider as BankProvider)) {
      return res.status(400).json({
        error: `Banco não suportado. Use: ${validProviders.join(", ")}`,
      });
    }

    // Valida CSV
    const csvBuffer = Buffer.from(csvContent, "utf-8");
    const validation = validateCSVFile(csvBuffer);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Gera preview
    const preview = await generateImportPreviewService(
      accountId,
      walletId,
      csvContent,
      bankProvider as BankProvider
    );

    return res.json(preview);
  } catch (error: any) {
    console.error("Erro ao gerar preview:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /accounts/:accountId/wallets/:walletId/import-confirm
 * Confirma e executa a importação
 */
export const confirmImport = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const walletId = Number(req.params.walletId);
    const { bankProvider, transactions, overrideDuplicates } = req.body;

    // Validações
    if (!bankProvider || !transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        error: "Campos obrigatórios: bankProvider, transactions (array)",
      });
    }

    if (transactions.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhuma transação para importar" });
    }

    // Executa importação
    const result = await confirmImportService(
      accountId,
      walletId,
      bankProvider as BankProvider,
      transactions,
      overrideDuplicates || false
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Erro ao confirmar importação:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts/:accountId/import-history
 * Lista histórico de importações
 */
export const getImportHistory = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const walletId = req.query.walletId
      ? Number(req.query.walletId)
      : undefined;

    const history = await getImportHistoryService(accountId, walletId);
    return res.json(history);
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return res.status(500).json({ error: error.message });
  }
};
