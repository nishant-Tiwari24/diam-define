import mongoose from "mongoose";

const outRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    upi:{
        type: String,
    },
    metamask:{
        type: String,
    },
    requests:[
        {
            amount: {type: String, required: true},
            sender: {type: String, required: true},
            // name: {type: String, require: true},
            reason: {type: String, require: true}
        }
    ]
},
{timestamps: true});

const outRequestMoney = mongoose.model("outrequestMoney", outRequestSchema);
export default outRequestMoney; 