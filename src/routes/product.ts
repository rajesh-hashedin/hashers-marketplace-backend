import { Router } from "express";
import { getProducts } from "../controllers/product";

const productRoutes: Router = Router();

productRoutes.get("/", getProducts);

export default productRoutes;
