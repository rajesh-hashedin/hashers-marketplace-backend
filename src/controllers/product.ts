import { Request, Response } from "express";
import { prismaClient } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

interface JwtPayload {
  userId: string;
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prismaClient.product.findMany();
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const newProducts = [];
    for (const product of products) {
      const transaction = await prismaClient.transaction.findFirst({
        where: {
          buyerId: decoded.userId,
          productId: product.id,
        },
      });
      newProducts.push({
        ...product,
        ownProduct: product.ownerId === decoded.userId,
        alreadySent: !!transaction,
      });
    }

    res.status(200).send(newProducts);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, imageLink } = req.body;
    if (!name || !price || !imageLink) {
      res
        .status(400)
        .send({ message: "Name, price and image link is required" });
      return;
    }
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prismaClient.user.findFirst({
      where: { id: decoded.userId },
    });
    if (!user) {
      res.status(401).send({
        message: "User doesn't exist, please register or check bearer token",
      });
      return;
    }
    const product = await prismaClient.product.create({
      data: {
        name,
        description,
        price,
        ownerId: decoded.userId,
        imageLink,
      },
    });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id, name, price, description } = req.body;
    if (!id) {
      res.status(400).send({ message: "Product id is required" });
      return;
    }
    if (!name && !price && !description) {
      res
        .status(400)
        .send({ message: "Atleast one field is required to update product" });
      return;
    }
    let product = await prismaClient.product.findFirst({ where: { id } });
    if (!product) {
      res.status(400).send({ message: "Product not found" });
      return;
    }
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    product = await prismaClient.product.findFirst({
      where: { id, ownerId: decoded.userId },
    });
    if (!product) {
      res
        .status(401)
        .send({ message: "You are not authorized to update this product" });
      return;
    }
    product = await prismaClient.product.update({
      where: { id, ownerId: decoded.userId },
      data: {
        name,
        price,
        description,
      },
    });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).send({ message: "Product id is required" });
      return;
    }
    let product = await prismaClient.product.findFirst({ where: { id } });
    if (!product) {
      res.status(400).send({ message: "Product not found" });
      return;
    }
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    product = await prismaClient.product.findFirst({
      where: { id, ownerId: decoded.userId },
    });
    if (!product) {
      res
        .status(401)
        .send({ message: "You are not authorized to delete this product" });
      return;
    }
    product = await prismaClient.product.delete({ where: { id } });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).send({ message: "Product id is required" });
      return;
    }
    let product = await prismaClient.product.findFirst({ where: { id } });
    if (!product) {
      res.status(400).send({ message: "Product not found1" });
      return;
    }
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const searchProductByNameAndDescription = async (
  req: Request,
  res: Response
) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).send({ message: "Search key is required" });
      return;
    }
    let product = await prismaClient.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: key,
              mode: "insensitive",
            },
          },
          { description: { contains: key, mode: "insensitive" } },
        ],
      },
    });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const sortProduct = async (req: Request, res: Response) => {
  try {
    let { key, type } = req.body;
    if (!type) type = "asc";
    if (!key) {
      res.status(400).send({ message: "Sorting key required" });
      return;
    }
    if (key !== "price" && key !== "name") {
      res.status(400).send({ message: "Only price and name sorting allowed" });
      return;
    }
    if (type !== "desc" && type !== "asc") {
      res.status(400).send({ message: "Invalid sorting type" });
      return;
    }
    const product = await prismaClient.product.findMany({
      orderBy: [{ [key]: type }],
    });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};
