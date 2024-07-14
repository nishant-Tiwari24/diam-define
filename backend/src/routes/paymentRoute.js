import express from "express";
import { paymentsWrite, paymentsRead } from "../controllers/paymentsController.js";

const router = express.Router();

router.post('/paymentWrite', paymentsWrite);
router.post('/paymentRead', paymentsRead);

export default router;