import express from 'express';
import { getExchangeRates } from '../controllers/exchangeRateController.js';
const router = express.Router();

router.get('/', getExchangeRates);

export default router;
