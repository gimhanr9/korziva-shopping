import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "./docs/openapi.json";

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // General rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests from this IP, please try again later.",
      },
    },
  });
  app.use(limiter);

  // Logging
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  }

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Documentation (Swagger / OpenAPI)
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // Mount API router
  app.use("/api", apiRouter);

  // 404 Handler for unknown routes
  app.use(notFoundHandler);

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}
