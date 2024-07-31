import { Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

export const signup = async (req: Request, res: Response) => {
  const { name, email, mobile, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });
  if (user) {
    res.status(401).send({ message: "Email already exist" });
    return;
  }
  user = await prismaClient.user.findFirst({ where: { mobile } });
  if (user) {
    res.status(401).send({ message: "Mobile number already exist" });
    return;
  }
  user = await prismaClient.user.create({
    data: {
      name,
      email,
      mobile,
      password: hashSync(password, 10),
    },
  });
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    res.status(401).send({ message: "Email not found" });
    return;
  }
  if (!compareSync(password, user.password)) {
    res.status(401).send({ message: "Incorrect password" });
    return;
  }
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );
  res.json({ user, token });
};
