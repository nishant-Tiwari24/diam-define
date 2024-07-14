import axios from 'axios';
import ExchangeRate from '../models/ExchangeRate.js';
import { currencyApiKey, cryptoApiKey } from '../config.js';

export const getExchangeRates = async (req, res) => {
  try {
    const exchangeRates = await ExchangeRate.find();
    res.json(exchangeRates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
