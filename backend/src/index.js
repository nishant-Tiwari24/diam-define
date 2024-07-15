import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import exchangeRateRoutes from './routes/exchangeRates.js';
import FLRoutes from './routes/flashLoan.js';
import { connectDB } from './database/config.js'; 
import bankRoutes from './routes/BankRoutes.js';
import moneyTransferRoutes from './routes/moneyTransferRoutes.js';
import payRoutes from './routes/paymentRoute.js';
import { config } from 'dotenv';
import bodyParser from 'body-parser';

import { Networks, Asset, Keypair, Operation, TransactionBuilder } from 'diamante-base';
import { Horizon } from 'diamante-sdk-js';
import User from './models/User.js';


config({
  path:'./.env',
})
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/money-transfer', moneyTransferRoutes);
app.use('/loan', FLRoutes);
app.use('/pay',payRoutes);

// diamanate routes
app.post('/create-keypair', async(req, res) => {
  try {
      const {email} = req.body;
      console.log('Received request to create keypair');
      const keypair = Keypair.random();
      console.log(keypair);
      const user = await User.findOne({email});
      if(!user){
        res.json({
            message: "User not found."
        })
      }

      await user.updateOne({
        $set:{
            diamPublic: keypair.publicKey(),
            diamPrivate: keypair.secret()
        }
      })
      console.log('Keypair created:', keypair.publicKey(), keypair.secret());
      res.json({
          publicKey: keypair.publicKey(),
          secret: keypair.secret()
      });
  } catch (error) {
      console.error('Error in create-keypair:', error);
      res.status(500).json({ error: error.message });
  }
});

app.post('/fund-account', async (req, res) => {
  try {
      const { publicKey } = req.body;
      console.log(`Received request to fund account ${publicKey}`);
      const fetch = await import('node-fetch').then(mod => mod.default);
      const response = await fetch(`https://friendbot.diamcircle.io/?addr=${publicKey}`);
      if (!response.ok) {
          throw new Error(`Failed to activate account ${publicKey}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`Account ${publicKey} activated`, result);
      res.json({ message: `Account ${publicKey} funded successfully` });
  } catch (error) {
      console.error('Error in fund-account:', error);
      res.status(500).json({ error: error.message });
  }
});

app.post('/make-payment', async (req, res) => {
  try {
      const { senderSecret, receiverPublicKey, amount } = req.body;
      console.log(`Received request to make payment from ${senderSecret} to ${receiverPublicKey} with amount ${amount}`);

      const server = new Horizon.Server('https://diamtestnet.diamcircle.io/');
      const senderKeypair = Keypair.fromSecret(senderSecret);
      const senderPublicKey = senderKeypair.publicKey();

      const account = await server.loadAccount(senderPublicKey);
      const transaction = new TransactionBuilder(account, {
          fee: await server.fetchBaseFee(),
          networkPassphrase: Networks.TESTNET,
      })
          .addOperation(Operation.payment({
              destination: receiverPublicKey,
              asset: Asset.native(),
              amount: amount,
          }))
          .setTimeout(30)
          .build();

      transaction.sign(senderKeypair);
      const result = await server.submitTransaction(transaction);
      console.log(`Payment made from ${senderPublicKey} to ${receiverPublicKey} with amount ${amount}`, result);
      res.json({ message: `Payment of ${amount} DIAM made to ${receiverPublicKey} successfully` });
  } catch (error) {
      console.error('Error in make-payment:', error);
      res.status(500).json({ error: error.message });
  }
});

const PORT = 5550;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
