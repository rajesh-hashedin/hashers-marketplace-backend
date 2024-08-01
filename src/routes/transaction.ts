import { Router } from "express";
import {
  addTransaction,
  getReceivedTransaction,
  getSentTransaction,
  updateTransaction,
} from "../controllers/transaction";

const transactionRoutes: Router = Router();

transactionRoutes.post("/", addTransaction);
transactionRoutes.patch("/", updateTransaction);
transactionRoutes.get("/sent", getSentTransaction);
transactionRoutes.get("/received", getReceivedTransaction);

export default transactionRoutes;
