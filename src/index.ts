import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";

const app = express();

app.get("/", (req, res) => {
  res.send("working");
});

app.listen(PORT, () => console.log("App working"));
