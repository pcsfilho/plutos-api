import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createCategoryRuleService,
  listCategoryRulesService,
  getCategoryRuleByIdService,
  updateCategoryRuleService,
  deleteCategoryRuleService,
} from "../services/category-rule.service";

/**
 * POST /accounts/:accountId/category-rules
 * Cria uma nova regra de categorização
 */
export const createCategoryRule = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const { pattern, categoryId, walletId, priority } = req.body;
    const userId = req.user.userId;

    // Validações básicas
    if (!pattern || !categoryId) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: pattern, categoryId" });
    }

    if (pattern.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Padrão deve ter no mínimo 2 caracteres" });
    }

    // TODO: Validar que accountId pertence ao userId

    const rule = await createCategoryRuleService({
      accountId,
      pattern,
      categoryId: Number(categoryId),
      walletId: walletId ? Number(walletId) : undefined,
      priority: priority ? Number(priority) : 0,
    });

    return res.status(201).json(rule);
  } catch (error: any) {
    console.error("Erro ao criar regra:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts/:accountId/category-rules
 * Lista todas as regras de uma conta
 */
export const listCategoryRules = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const walletId = req.query.walletId
      ? Number(req.query.walletId)
      : undefined;

    const rules = await listCategoryRulesService(accountId, walletId);
    return res.json(rules);
  } catch (error: any) {
    console.error("Erro ao listar regras:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /accounts/:accountId/category-rules/:id
 * Obtém uma regra específica
 */
export const getCategoryRuleById = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const ruleId = Number(req.params.id);

    const rule = await getCategoryRuleByIdService(ruleId, accountId);

    if (!rule) {
      return res.status(404).json({ error: "Regra não encontrada" });
    }

    return res.json(rule);
  } catch (error: any) {
    console.error("Erro ao buscar regra:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /accounts/:accountId/category-rules/:id
 * Atualiza uma regra
 */
export const updateCategoryRule = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const ruleId = Number(req.params.id);
    const { pattern, categoryId, priority, isActive } = req.body;

    const rule = await updateCategoryRuleService(ruleId, accountId, {
      pattern,
      categoryId: categoryId ? Number(categoryId) : undefined,
      priority: priority !== undefined ? Number(priority) : undefined,
      isActive,
    });

    return res.json(rule);
  } catch (error: any) {
    console.error("Erro ao atualizar regra:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /accounts/:accountId/category-rules/:id
 * Deleta uma regra
 */
export const deleteCategoryRule = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    const ruleId = Number(req.params.id);

    await deleteCategoryRuleService(ruleId, accountId);
    return res.json({ message: "Regra deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar regra:", error);
    return res.status(500).json({ error: error.message });
  }
};
