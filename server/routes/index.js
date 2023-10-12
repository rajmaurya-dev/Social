import express from "express";
import auth from "./auth.js";
import userRoutes from "./userRoutes.js";
const router = express.Router();
router.use(`/auth`, auth);
router.use("/users", userRoutes);

export default router;
