import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lista todas as categorias
 * Opcionalmente filtra por tipo (Entrada/Saída)
 */
export const listCategoriesService = async (typeId?: number) => {
  const where = typeId ? { typeId } : {};

  return await prisma.category.findMany({
    where,
    include: {
      type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ typeId: "asc" }, { name: "asc" }],
  });
};

/**
 * Busca categoria por ID
 */
export const getCategoryByIdService = async (id: number) => {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Cria nova categoria
 */
export const createCategoryService = async (data: {
  name: string;
  typeId: number;
}) => {
  // Valida se o tipo existe
  const type = await prisma.transactionType.findUnique({
    where: { id: data.typeId },
  });

  if (!type) {
    throw new Error(
      `Tipo de transação ID ${data.typeId} não encontrado. Use 1 (Entrada) ou 2 (Saída).`
    );
  }

  // Verifica se já existe categoria com mesmo nome e tipo
  const existing = await prisma.category.findFirst({
    where: {
      name: data.name,
      typeId: data.typeId,
    },
  });

  if (existing) {
    throw new Error(
      `Categoria "${data.name}" já existe para o tipo "${type.name}"`
    );
  }

  return await prisma.category.create({
    data: {
      name: data.name,
      typeId: data.typeId,
    },
    include: {
      type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Atualiza categoria
 */
export const updateCategoryService = async (
  id: number,
  data: {
    name?: string;
    typeId?: number;
  }
) => {
  // Valida se a categoria existe
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error(`Categoria ID ${id} não encontrada`);
  }

  // Se está mudando o typeId, valida se existe
  if (data.typeId && data.typeId !== category.typeId) {
    const type = await prisma.transactionType.findUnique({
      where: { id: data.typeId },
    });

    if (!type) {
      throw new Error(
        `Tipo de transação ID ${data.typeId} não encontrado. Use 1 (Entrada) ou 2 (Saída).`
      );
    }
  }

  // Verifica duplicata (se está mudando o nome)
  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: {
        name: data.name,
        typeId: data.typeId || category.typeId,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error(`Categoria "${data.name}" já existe`);
    }
  }

  return await prisma.category.update({
    where: { id },
    data,
    include: {
      type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Deleta categoria
 * Verifica se há transações vinculadas antes
 */
export const deleteCategoryService = async (id: number) => {
  // Valida se a categoria existe
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!category) {
    throw new Error(`Categoria ID ${id} não encontrada`);
  }

  // Verifica se há transações vinculadas
  if (category._count.transactions > 0) {
    throw new Error(
      `Não é possível deletar a categoria "${category.name}" pois há ${category._count.transactions} transação(ões) vinculada(s). ` +
        `Reatribua essas transações para outra categoria antes de deletar.`
    );
  }

  // Verifica se há regras de categorização usando esta categoria
  const rules = await prisma.categoryRule.count({
    where: { categoryId: id },
  });

  if (rules > 0) {
    throw new Error(
      `Não é possível deletar a categoria "${category.name}" pois há ${rules} regra(s) de categorização vinculada(s). ` +
        `Delete ou reatribua essas regras antes.`
    );
  }

  return await prisma.category.delete({
    where: { id },
  });
};

/**
 * Lista tipos de transação disponíveis
 */
export const listTransactionTypesService = async () => {
  return await prisma.transactionType.findMany({
    orderBy: { id: "asc" },
  });
};
