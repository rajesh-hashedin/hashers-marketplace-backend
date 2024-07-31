import express, { Express, Request, Response } from "express";
import { JWT_SECRET, PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const app: Express = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.url);
  if (!req.url.includes("login") && !req.url.includes("signup")) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      res.status(401).send({
        message: "token is required",
      });
    } else {
      jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
          res.status(401).send({
            message: "Invlid user",
          });
        } else next();
      });
    }
  } else next();
});

app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.listen(PORT, () => console.log("App working"));
