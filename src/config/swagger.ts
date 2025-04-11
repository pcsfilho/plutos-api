// src/config/swagger.ts
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";

export const setupSwagger = (app: any) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
