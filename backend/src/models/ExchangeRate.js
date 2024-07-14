import mongoose from 'mongoose';

const ExchangeRateSchema = new mongoose.Schema({
  currencyPair: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ExchangeRate = mongoose.model('ExchangeRate', ExchangeRateSchema);

export default ExchangeRate;
