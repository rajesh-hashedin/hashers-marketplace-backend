import express, { Express, Request, Response } from "express";
import { JWT_SECRET, PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { jwtVerification } from "./middlewares/jwtVerification";

const app: Express = express();

app.use(express.json());

app.use(jwtVerification);

app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.listen(PORT, () => console.log("App working"));
