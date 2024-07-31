import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";

const app = express();

app.use("/api", rootRouter);

app.listen(PORT, () => console.log("App working"));
