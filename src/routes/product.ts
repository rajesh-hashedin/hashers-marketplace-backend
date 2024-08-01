import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getProduct,
  getProducts,
  searchProductByNameAndDescription,
  sortProduct,
  updateProduct,
} from "../controllers/product";

const productRoutes: Router = Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProduct);
productRoutes.get("/search/:key", searchProductByNameAndDescription);
productRoutes.post("/", addProduct);
productRoutes.post("/sort", sortProduct);
productRoutes.patch("/", updateProduct);
productRoutes.delete("/:id", deleteProduct);

export default productRoutes;
