import { Router } from "express";
import { healthRouter } from "./health.route";
import { authRouter } from "./auth.route";
import { categoryRouter } from "./category.route";
import { productRouter } from "./product.route";
import { cartRouter } from "./cart.route";
import { orderRouter } from "./order.route";
import { adminRouter } from "./admin.route";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin", adminRouter);



