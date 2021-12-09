const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        amount: {
            type: Number,
            default: 0,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        isDeposit: {
            type: Boolean,
            default: false,
            required: true,
        },
        isWithdrawal: {
            type: Boolean,
            default: false,
            required: true,
        },
        isTransfer: {
            type: Boolean,
            default: false,
            required: true,
        },
        isReversal: {
            type: Boolean,
            default: false,
            required: true,
        }
    },
    {
        timestamps: true
    }
);

const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;