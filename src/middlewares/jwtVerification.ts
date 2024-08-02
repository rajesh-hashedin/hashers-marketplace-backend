import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { prismaClient } from "..";
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
      jwt.verify(token, JWT_SECRET, async (err, data: any) => {
        if (err) {
          res.status(401).send({
            message: "Invlid user",
          });
        } else {
          let user = await prismaClient.user.findFirst({
            where: { id: data.userId },
          });
          if (!user) {
            res.status(401).send({
              message: "Invalid token or user doesn't exist",
            });
            return;
          }
          next();
        }
      });
    }
  } else next();
};
