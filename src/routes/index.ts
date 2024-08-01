import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import transactionRoutes from "./transaction";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/product", productRoutes);
rootRouter.use("/transaction", transactionRoutes);

export default rootRouter;
