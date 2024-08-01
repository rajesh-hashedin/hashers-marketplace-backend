import express, {
  ErrorRequestHandler,
  Express,
  NextFunction,
  Request,
  Response,
} from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { jwtVerification } from "./middlewares/jwtVerification";

const app: Express = express();

app.use(express.json());

app.use(jwtVerification);

app.use("/api", rootRouter);

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  if (!err) {
    return next();
  }

  res.status(500);
  res.send("500: Internal server error");
});
export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.listen(PORT, () => console.log("App working"));
