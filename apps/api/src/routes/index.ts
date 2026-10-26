import { Router } from "express";
import { healthRouter } from "./health.route";
import { authRouter } from "./auth.route";
import { categoryRouter } from "./category.route";
import { productRouter } from "./product.route";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);

