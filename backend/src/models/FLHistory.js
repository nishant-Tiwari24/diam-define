import mongoose from "mongoose";

const FLHistorySchema = mongoose.Schema({
    address : { type: String, required: true },
    date : { type: Date, required: true, },
    token : { type: String, required: true },
    loan : { type: String, required: true},
    pl : { type: String, required: true},
})

const FLHistory = mongoose.model('FLHistory',FLHistorySchema);

export default FLHistory;