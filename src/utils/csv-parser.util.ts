import {
  BankProvider,
  ParsedTransaction,
  BankCSVMapping,
} from "../types/import.types";

/**
 * Configurações de parsing de CSV para cada banco suportado
 */
export const BANK_CSV_CONFIGS: Record<BankProvider, BankCSVMapping> = {
  /**
   * Configuração para Nubank
   * Formato esperado: date,category,title,amount
   * Exemplo: 2025-01-15,transport,Uber - Viagem,-25.50
   */
  [BankProvider.NUBANK]: {
    provider: BankProvider.NUBANK,
    delimiter: ",",
    encoding: "utf-8",
    hasHeader: true,
    columns: {
      date: "date",
      description: "title",
      amount: "amount",
      category: "category",
    },
    dateFormat: "YYYY-MM-DD",
    amountParser: (value: string): number => {
      // Nubank usa formato: "-123.45" (negativo para despesas)
      const cleaned = value.trim().replace(",", ".");
      return parseFloat(cleaned);
    },
  },

  /**
   * Configuração para Inter
   * Formato esperado: Data;Descrição;Valor
   * Exemplo: 15/01/2025;UBER *TRIP;-R$ 25,50
   */
  [BankProvider.INTER]: {
    provider: BankProvider.INTER,
    delimiter: ";",
    encoding: "latin1",
    hasHeader: true,
    columns: {
      date: "Data",
      description: "Descrição",
      amount: "Valor",
    },
    dateFormat: "DD/MM/YYYY",
    amountParser: (value: string): number => {
      // Inter usa formato brasileiro: "R$ 1.234,56" ou "-R$ 1.234,56"
      const cleaned = value
        .replace("R$", "")
        .replace(/\s/g, "") // Remove espaços
        .replace(/\./g, "") // Remove separador de milhar
        .replace(",", "."); // Troca vírgula por ponto decimal

      return parseFloat(cleaned);
    },
  },

  /**
   * Configuração para C6 Bank
   * Formato esperado: Data da transação,Categoria,Descrição,Valor
   * Exemplo: 15/01/2025,Transporte,Uber - Viagem,-25.50
   */
  [BankProvider.C6]: {
    provider: BankProvider.C6,
    delimiter: ",",
    encoding: "utf-8",
    hasHeader: true,
    columns: {
      date: "Data da transação",
      description: "Descrição",
      amount: "Valor",
      category: "Categoria",
    },
    dateFormat: "DD/MM/YYYY",
    amountParser: (value: string): number => {
      // C6 usa formato: "1234.56" ou "-1234.56"
      const cleaned = value.trim().replace(",", ".");
      return parseFloat(cleaned);
    },
  },

  /**
   * Configuração genérica para CSVs customizados
   * Usa índices de colunas ao invés de nomes
   */
  [BankProvider.GENERIC]: {
    provider: BankProvider.GENERIC,
    delimiter: ",",
    encoding: "utf-8",
    hasHeader: true,
    columns: {
      date: 0, // Primeira coluna
      description: 1, // Segunda coluna
      amount: 2, // Terceira coluna
    },
    dateFormat: "YYYY-MM-DD",
    amountParser: (value: string): number => {
      const cleaned = value.trim().replace(",", ".");
      return parseFloat(cleaned);
    },
  },
};

/**
 * Parse uma data de string para Date object de acordo com o formato
 */
function parseDate(dateStr: string, format: string): Date {
  const cleaned = dateStr.trim();

  // Formato: DD/MM/YYYY
  if (format === "DD/MM/YYYY") {
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length !== 3) {
      throw new Error(`Data inválida: ${dateStr}`);
    }
    const [day, month, year] = parts.map((p) => parseInt(p, 10));
    return new Date(year, month - 1, day);
  }

  // Formato: YYYY-MM-DD
  if (format === "YYYY-MM-DD") {
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length !== 3) {
      throw new Error(`Data inválida: ${dateStr}`);
    }
    const [year, month, day] = parts.map((p) => parseInt(p, 10));
    return new Date(year, month - 1, day);
  }

  // Formato: MM/DD/YYYY (formato americano)
  if (format === "MM/DD/YYYY") {
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length !== 3) {
      throw new Error(`Data inválida: ${dateStr}`);
    }
    const [month, day, year] = parts.map((p) => parseInt(p, 10));
    return new Date(year, month - 1, day);
  }

  throw new Error(`Formato de data não suportado: ${format}`);
}

/**
 * Obtém o valor de uma coluna baseado em nome ou índice
 */
function getColumnValue(
  line: string[],
  column: string | number,
  headers?: string[]
): string {
  // Se é número, usa como índice direto
  if (typeof column === "number") {
    return line[column] || "";
  }

  // Se é string, procura pelo nome no header
  if (headers) {
    const index = headers.findIndex(
      (h) => h.toLowerCase().trim() === column.toLowerCase().trim()
    );
    return index >= 0 ? line[index] || "" : "";
  }

  return "";
}

/**
 * Parse uma linha do CSV de acordo com a configuração do banco
 */
export function parseCSVLine(
  line: string[],
  config: BankCSVMapping,
  headers?: string[]
): ParsedTransaction | null {
  try {
    // Obtém valores das colunas
    const dateStr = getColumnValue(line, config.columns.date, headers);
    const description = getColumnValue(
      line,
      config.columns.description,
      headers
    );
    const amountStr = getColumnValue(line, config.columns.amount, headers);
    const categoryStr = config.columns.category
      ? getColumnValue(line, config.columns.category, headers)
      : undefined;

    // Validações básicas
    if (!dateStr || !description || !amountStr) {
      return null; // Linha inválida, pula
    }

    // Parse dos valores
    const date = parseDate(dateStr, config.dateFormat);
    const amount = config.amountParser(amountStr);

    // Valida se o valor é numérico
    if (isNaN(amount) || !isFinite(amount)) {
      throw new Error(`Valor inválido: ${amountStr}`);
    }

    return {
      date,
      description: description.trim(),
      amount,
      category: categoryStr?.trim(),
      originalData: {
        raw: line,
        headers: headers,
      },
    };
  } catch (error: any) {
    console.error("Erro ao parsear linha CSV:", error.message, { line });
    return null;
  }
}

/**
 * Parse o conteúdo completo de um CSV
 */
export function parseCSVContent(
  content: string,
  config: BankCSVMapping
): ParsedTransaction[] {
  // Divide o conteúdo em linhas
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  let startIndex = 0;
  let headers: string[] | undefined;

  // Se tem header, processa a primeira linha como cabeçalho
  if (config.hasHeader) {
    const headerLine = lines[0].split(config.delimiter);
    headers = headerLine.map((h) => h.trim());
    startIndex = 1;
  }

  const transactions: ParsedTransaction[] = [];

  // Processa cada linha de dados
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].split(config.delimiter);
    const parsed = parseCSVLine(line, config, headers);

    if (parsed) {
      transactions.push(parsed);
    }
  }

  return transactions;
}

/**
 * Valida se um arquivo CSV é válido
 */
export function validateCSVFile(
  fileBuffer: Buffer,
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB padrão
): { valid: boolean; error?: string } {
  // Verifica tamanho do arquivo
  if (fileBuffer.length === 0) {
    return { valid: false, error: "Arquivo vazio" };
  }

  if (fileBuffer.length > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
    };
  }

  // Tenta ler como texto para verificar se é válido
  try {
    const content = fileBuffer.toString("utf-8", 0, Math.min(1000, fileBuffer.length));
    if (!content || content.trim().length === 0) {
      return { valid: false, error: "Arquivo vazio ou corrompido" };
    }
  } catch (error) {
    return { valid: false, error: "Erro ao ler arquivo. Verifique o encoding." };
  }

  return { valid: true };
}

/**
 * Detecta automaticamente o banco baseado no conteúdo do CSV
 * (Funcionalidade futura - por enquanto retorna null)
 */
export function detectBankProvider(content: string): BankProvider | null {
  // TODO: Implementar lógica de detecção automática
  // Pode analisar os headers ou padrões de dados
  return null;
}
