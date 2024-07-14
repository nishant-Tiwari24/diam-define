import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  preferredCurrency: { type: String, default: 'USD' },
  age:{type: Number},
  dob: {type: Date},
  address: {type: String},
  status: {type: String},
  mobile:{type: String},
  metamaskId: {type: String, default:""},
  upiId: {type: String, default:""},
  requests: {type: mongoose.Schema.Types.ObjectId, ref: "MoneyRequest"},
  orequests: {type: mongoose.Schema.Types.ObjectId, ref: "outrequestMoney"},
  kyc: {type: Boolean, default:false},
  diamPublic: {type: String, default: ""},
  diamPrivate: {type: String, default: ""},
},{
  timestamps: true
});

const User = model('User', UserSchema);

export default User;
