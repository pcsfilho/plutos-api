import multer from "multer";
import { Request, Response, NextFunction } from "express";

/**
 * Configuração do Multer para upload de arquivos CSV
 * Armazena em memória (buffer) para processamento direto
 */
const storage = multer.memoryStorage();

/**
 * Filtro para aceitar apenas arquivos CSV
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Aceita .csv e text/csv
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos CSV são permitidos"));
  }
};

/**
 * Configuração do upload
 * - Limite: 5MB
 * - Armazenamento: memória (buffer)
 * - Filtro: apenas CSV
 */
const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Middleware que torna o upload OPCIONAL
 * Aceita tanto multipart/form-data quanto application/json
 */
export const uploadCSV = {
  single: (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Se não for multipart/form-data, pula o upload
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("multipart/form-data")) {
        return next();
      }

      // Se for multipart, processa o upload
      multerUpload.single(fieldName)(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: `Erro no upload: ${err.message}` });
        } else if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    };
  },
};
