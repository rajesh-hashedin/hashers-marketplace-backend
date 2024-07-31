import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
export const jwtVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};
