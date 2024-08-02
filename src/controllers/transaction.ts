import { Request, Response } from "express";
import { prismaClient } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { Transaction, TransactionStatus } from "@prisma/client";

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

    let product = await prismaClient.product.findFirst({
      where: { id: productId },
    });

    if (!product) {
      res.status(400).send({ message: "Product not found" });
      return;
    }

    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    product = await prismaClient.product.findFirst({
      where: {
        AND: [
          {
            ownerId: decoded.userId,
          },
          { id: productId },
        ],
      },
    });
    if (product) {
      res.status(400).send({ message: "You can not purchase own product" });
      return;
    }

    let transaction = await prismaClient.transaction.findFirst({
      where: { buyerId: decoded.userId, productId },
    });

    if (transaction) {
      res
        .status(400)
        .send({ message: "You already sent request to buy this product" });
      return;
    }

    transaction = await prismaClient.transaction.create({
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
    const transactions = await prismaClient.transaction.findMany({
      where: {
        buyerId: decoded.userId,
      },
    });

    const sentTransaction = [];
    for (const transaction of transactions) {
      const product = await prismaClient.product.findFirst({
        where: {
          id: transaction.productId,
        },
        select: {
          name: true,
          price: true,
          description: true,
          id: true,
          ownerId: true,
        },
      });
      const user = await prismaClient.user.findFirst({
        where: {
          id: product?.ownerId,
        },
        select: {
          name: true,
          mobile: true,
          id: true,
          email: true,
        },
      });
      const trans = {
        transactionId: transaction.id,
        transactionStatus: transaction.status,
        transactionType: "Sent",
        user,
        product,
      };
      sentTransaction.push(trans);
    }
    res.status(200).send(sentTransaction);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const getReceivedTransaction = async (req: Request, res: Response) => {
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
          email: true,
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
        transactionType: "Received",
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

    let transaction = await prismaClient.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      res.status(400).send({ message: "Transaction not found" });
      return;
    }

    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const product = await prismaClient.product.findFirst({
      where: { id: transaction.productId, ownerId: decoded.userId },
    });

    if (!product) {
      res
        .status(401)
        .send({ message: "You are not authorized to update this transaction" });
      return;
    }

    transaction = await prismaClient.transaction.update({
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
