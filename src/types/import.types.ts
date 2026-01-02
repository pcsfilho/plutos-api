// Tipos e interfaces para o sistema de importação de cartões de crédito

/**
 * Enum para os bancos suportados na importação
 */
export enum BankProvider {
  NUBANK = "NUBANK",
  INTER = "INTER",
  C6 = "C6",
  GENERIC = "GENERIC",
}

/**
 * Enum para os tipos de wallet (carteira)
 */
export enum WalletType {
  CHECKING_ACCOUNT = "CHECKING_ACCOUNT",
  SAVINGS = "SAVINGS",
  CREDIT_CARD = "CREDIT_CARD",
  CASH = "CASH",
}

/**
 * Enum para tipo de conta (PF ou PJ)
 */
export enum AccountType {
  PF = "PF", // Pessoa Física
  PJ = "PJ", // Pessoa Jurídica
}

/**
 * Estrutura de uma transação parseada do CSV
 */
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  category?: string; // Categoria original do CSV (se houver)
  originalData: Record<string, any>; // Dados brutos da linha do CSV
}

/**
 * Resultado da verificação de duplicatas
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingTransactionId?: number;
  matchScore: number; // 0-100, quão similar é a transação
}

/**
 * Transação no preview com metadados adicionais
 */
export interface PreviewTransaction extends ParsedTransaction {
  isDuplicate: boolean;
  duplicateTransactionId?: number;
  suggestedCategoryId: number | null;
  suggestedCategoryName: string | null;
  matchedRule?: {
    ruleId: number;
    pattern: string;
  };
  // Auto-matching com subscriptions
  suggestedSubscriptionId?: number | null;
  suggestedSubscriptionName?: string | null;
  subscriptionMatchConfidence?: number; // 0-100
  errors?: string[]; // Erros de validação, se houver
}

/**
 * Resposta do endpoint de preview de importação
 */
export interface ImportPreviewResponse {
  totalTransactions: number;
  validTransactions: number;
  duplicates: number;
  errors: number;
  transactions: PreviewTransaction[];
  summary: {
    totalAmount: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    categoriesBreakdown: Array<{
      categoryId: number;
      categoryName: string;
      count: number;
      totalAmount: number;
    }>;
  };
}

/**
 * Dados para confirmar a importação
 */
export interface ConfirmImportData {
  transactions: PreviewTransaction[]; // Transações a serem importadas
  overrideDuplicates: boolean; // Se true, importa mesmo transações duplicadas
}

/**
 * Resposta da confirmação de importação
 */
export interface ImportConfirmResponse {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  importHistoryId: number;
  errors: string[];
}

/**
 * Configuração de mapeamento de colunas CSV por banco
 */
export interface BankCSVMapping {
  provider: BankProvider;
  delimiter: string; // Delimitador: "," ou ";"
  encoding: BufferEncoding; // Encoding: "utf-8" ou "latin1"
  hasHeader: boolean; // Se o CSV possui linha de cabeçalho
  columns: {
    date: string | number; // Nome ou índice da coluna de data
    description: string | number; // Nome ou índice da coluna de descrição
    amount: string | number; // Nome ou índice da coluna de valor
    category?: string | number; // Nome ou índice da coluna de categoria (opcional)
  };
  dateFormat: string; // Formato da data: "DD/MM/YYYY", "YYYY-MM-DD", etc
  amountParser: (value: string) => number; // Função para parsear o valor monetário
}

/**
 * Status de uma importação
 */
export enum ImportStatus {
  SUCCESS = "SUCCESS",
  PARTIAL = "PARTIAL",
  FAILED = "FAILED",
}
