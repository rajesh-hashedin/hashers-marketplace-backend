import { Router } from "express";
import {
  addTransaction,
  getRequestedTransaction,
  getSentTransaction,
  updateTransaction,
} from "../controllers/transaction";

const transactionRoutes: Router = Router();

transactionRoutes.post("/", addTransaction);
transactionRoutes.patch("/", updateTransaction);
transactionRoutes.get("/sent", getSentTransaction);
transactionRoutes.get("/requested", getRequestedTransaction);

export default transactionRoutes;
