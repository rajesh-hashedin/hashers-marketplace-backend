import { Request, Response } from "express";
import { prismaClient } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { TransactionStatus } from "@prisma/client";

interface JwtPayload {
  userId: string;
}

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).send({ message: "Product id is required" });
      return;
    }
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const product = await prismaClient.product.findFirst({
      where: {
        AND: [
          {
            ownerId: decoded.userId,
          },
          { id: productId },
        ],
      },
    });
    if (!product) {
      res.status(400).send({ message: "You can not purchase own product" });
      return;
    }
    const transaction = await prismaClient.transaction.create({
      data: {
        buyerId: decoded.userId,
        productId,
      },
    });
    res.status(200).send(transaction);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const getSentTransaction = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const transaction = await prismaClient.transaction.findMany({
      where: {
        buyerId: decoded.userId,
      },
    });
    res.status(200).send(transaction);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const getRequestedTransaction = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const products = await prismaClient.product.findMany({
      where: {
        ownerId: decoded.userId,
      },
      select: {
        id: true,
      },
    });

    const transactions = await prismaClient.transaction.findMany({
      where: {
        productId: { in: products.map((product) => product.id) },
      },
    });
    const requestedTransaction = [];
    for (const transaction of transactions) {
      const user = await prismaClient.user.findFirst({
        where: {
          id: transaction.buyerId,
        },
        select: {
          name: true,
          mobile: true,
          id: true,
        },
      });
      const product = await prismaClient.product.findFirst({
        where: {
          id: transaction.productId,
        },
        select: {
          name: true,
          price: true,
          description: true,
          id: true,
        },
      });
      const trans = {
        transactionId: transaction.id,
        transactionStatus: transaction.status,
        user,
        product,
      };
      requestedTransaction.push(trans);
    }
    res.status(200).send(requestedTransaction);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res
        .status(400)
        .send({ message: "Transaction id and status is required" });
      return;
    }
    if (
      status !== TransactionStatus.ACCEPTED &&
      status !== TransactionStatus.REJECTED &&
      status !== TransactionStatus.PENDING
    ) {
      res.status(400).send({ message: "Invalid transaction status" });
      return;
    }

    const transaction = await prismaClient.transaction.update({
      where: { id },
      data: {
        status,
      },
    });
    res.status(200).send(transaction);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};
