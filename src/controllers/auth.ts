import { Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password } = req.body;

    let user = await prismaClient.user.findFirst({ where: { email } });
    if (user) {
      res.status(400).send({ message: "Email already exist" });
      return;
    }
    user = await prismaClient.user.findFirst({ where: { mobile } });
    if (user) {
      res.status(400).send({ message: "Mobile number already exist" });
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
    res.json({
      message: "User registration successful",
      data: {
        name: user.name,
        id: user.id,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
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
      // {
      //   expiresIn: "20s",
      // }
    );
    res.json({
      message: "User login successful",
      data: { email: user.email, token },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};
