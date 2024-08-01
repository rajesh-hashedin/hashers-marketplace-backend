import { Request, Response } from "express";
import { prismaClient } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

interface JwtPayload {
  userId: string;
}

export const getProducts = async (req: Request, res: Response) => {
  const products = await await prismaClient.product.findMany();
  res.status(200).send(products);
};

export const addProduct = async (req: Request, res: Response) => {
  const { name, price, description, ownerId } = req.body;
  try {
    if (!ownerId) {
      res.status(400).send({ message: "Owner id is required" });
      return;
    }
    if (!name || !price) {
      res.status(400).send({ message: "Name and price is required" });
      return;
    }
    const product = await prismaClient.product.create({
      data: {
        name,
        description,
        price,
        ownerId,
      },
    });
    res.status(200).send(product);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

export const updateProduct = async (req: Request, res: Response) => {
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
      .send({ message: "You not authorized to update this product" });
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
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
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
      .send({ message: "You not authorized to delete this product" });
    return;
  }
  product = await prismaClient.product.delete({ where: { id } });
  res.status(200).send(product);
};

export const getProduct = async (req: Request, res: Response) => {
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
  res.status(200).send(product);
};

export const searchProductByNameAndDescription = async (
  req: Request,
  res: Response
) => {
  const { key } = req.params;
  if (!key) {
    res.status(400).send({ message: "Key string is required" });
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
};

export const sortProduct = async (req: Request, res: Response) => {
  let { key, type } = req.body;
  if (!type) type = "asc";
  try {
    if (!key) {
      res.status(400).send({ message: "Sorting key required" });
      return;
    }
    if (key !== "price" && key !== "name") {
      res.status(400).send({ message: "Only price and name allowed" });
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
