const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
            required: true
        },
        transactions: [{
            type: Schema.Types.ObjectId,
            ref: "transaction",
        }],
        isActive: {
            type: Boolean,
            default: true,
            required: true,
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('user', userSchema);

module.exports = User;