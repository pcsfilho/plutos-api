import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Interface para criar uma regra de categorização
 */
export interface CreateCategoryRuleData {
  accountId: number;
  walletId?: number; // Opcional: regra específica para uma wallet
  pattern: string;
  categoryId: number;
  priority?: number;
}

/**
 * Interface para atualizar uma regra
 */
export interface UpdateCategoryRuleData {
  pattern?: string;
  categoryId?: number;
  priority?: number;
  isActive?: boolean;
}

/**
 * Cria uma nova regra de categorização
 */
export const createCategoryRuleService = async (
  data: CreateCategoryRuleData
) => {
  // Normaliza o padrão (lowercase, trim) para melhor matching
  const normalizedPattern = data.pattern.toLowerCase().trim();

  // Valida se a categoria existe
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error("Categoria não encontrada");
  }

  // Se walletId foi fornecido, valida se pertence à account
  if (data.walletId) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: data.walletId,
        accountId: data.accountId,
      },
    });

    if (!wallet) {
      throw new Error("Wallet não encontrada ou não pertence à conta");
    }
  }

  // Cria a regra
  const rule = await prisma.categoryRule.create({
    data: {
      accountId: data.accountId,
      walletId: data.walletId,
      pattern: normalizedPattern,
      categoryId: data.categoryId,
      priority: data.priority || 0,
    },
    include: {
      category: true,
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return rule;
};

/**
 * Lista todas as regras de uma conta
 */
export const listCategoryRulesService = async (
  accountId: number,
  walletId?: number
) => {
  const where: any = {
    accountId,
    isActive: true,
  };

  // Se walletId foi especificado, filtra por regras globais + regras da wallet
  if (walletId) {
    where.OR = [{ walletId: walletId }, { walletId: null }];
  }

  const rules = await prisma.categoryRule.findMany({
    where,
    include: {
      category: true,
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return rules;
};

/**
 * Obtém uma regra específica por ID
 */
export const getCategoryRuleByIdService = async (
  ruleId: number,
  accountId: number
) => {
  const rule = await prisma.categoryRule.findFirst({
    where: {
      id: ruleId,
      accountId: accountId, // Garante que a regra pertence à conta
    },
    include: {
      category: true,
      wallet: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return rule;
};

/**
 * Atualiza uma regra existente
 */
export const updateCategoryRuleService = async (
  ruleId: number,
  accountId: number,
  data: UpdateCategoryRuleData
) => {
  // Verifica se a regra pertence à conta
  const existing = await getCategoryRuleByIdService(ruleId, accountId);

  if (!existing) {
    throw new Error("Regra não encontrada ou não pertence à conta");
  }

  // Prepara dados de atualização
  const updateData: any = {};

  if (data.pattern) {
    updateData.pattern = data.pattern.toLowerCase().trim();
  }

  if (data.categoryId !== undefined) {
    // Valida se categoria existe
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Categoria não encontrada");
    }

    updateData.categoryId = data.categoryId;
  }

  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  // Atualiza a regra
  const updated = await prisma.categoryRule.update({
    where: { id: ruleId },
    data: updateData,
    include: {
      category: true,
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
 * Deleta uma regra
 */
export const deleteCategoryRuleService = async (
  ruleId: number,
  accountId: number
) => {
  // Verifica se a regra pertence à conta
  const existing = await getCategoryRuleByIdService(ruleId, accountId);

  if (!existing) {
    throw new Error("Regra não encontrada ou não pertence à conta");
  }

  await prisma.categoryRule.delete({
    where: { id: ruleId },
  });

  return { message: "Regra deletada com sucesso" };
};

/**
 * Aplica as regras de categorização a uma descrição
 * Retorna a primeira regra que combinar (baseado em prioridade)
 */
export const applyCategoryRulesService = async (
  description: string,
  accountId: number,
  walletId?: number
): Promise<{
  categoryId: number | null;
  categoryName: string | null;
  matchedRule?: {
    ruleId: number;
    pattern: string;
  };
}> => {
  // Busca regras aplicáveis (já ordenadas por prioridade)
  const rules = await listCategoryRulesService(accountId, walletId);

  // Normaliza a descrição
  const normalizedDescription = description.toLowerCase().trim();

  // Testa cada regra na ordem de prioridade
  for (const rule of rules) {
    // Verifica se o padrão está contido na descrição
    if (normalizedDescription.includes(rule.pattern)) {
      return {
        categoryId: rule.categoryId,
        categoryName: rule.category.name,
        matchedRule: {
          ruleId: rule.id,
          pattern: rule.pattern,
        },
      };
    }
  }

  // Nenhuma regra combinou
  return {
    categoryId: null,
    categoryName: null,
  };
};

/**
 * Aplica regras em lote para múltiplas descrições
 * Útil para processar lotes de transações
 */
export const batchApplyCategoryRulesService = async (
  descriptions: string[],
  accountId: number,
  walletId?: number
) => {
  const results = [];

  for (const description of descriptions) {
    const result = await applyCategoryRulesService(
      description,
      accountId,
      walletId
    );
    results.push(result);
  }

  return results;
};
