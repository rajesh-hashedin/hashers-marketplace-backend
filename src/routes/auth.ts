import { Router } from "express";
import { login, me, signup } from "../controllers/auth";

const authRoutes: Router = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/me", me);

export default authRoutes;
