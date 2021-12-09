const Admin = require('./../models/admin');
const User = require('./../models/user');
const Transaction = require('./../models/transaction');
const { hashPassword } = require('../services/bcrypt');
const { verifyPassword } = require('../services/bcrypt');
const { signToken } = require('../services/jwt');
const uniqid = require('../services/uniqid');

exports.adminLogin = async (req, res, next) => {
    const data = req.body;
    try {
        const admin = await Admin.findOne({ email: data.email });
        const isValidPassword = await verifyPassword(data.password, admin.password);
        if (!admin || !isValidPassword) return res.status(400).json({ message: "Invalid Email Or Password" });
        const token = signToken({ id: admin._id, email: admin.email });
        admin.password = null;
        return res.status(201).json({ message: "Admin Logged In Successfully!", token, admin });
    } catch (error) {
        next(error);
    } 
}

exports.createUser = async (req, res, next) => {
    const data = req.body;
    try {
        let accountNumber = uniqid();

        let user = await User.findOne({ email: data.email });
        if (user) return res.status(400).json({ message: "Email Has Been Used. Please Try Another." });
        
        user = await User.findOne({ accountNumber: accountNumber });

        while (user) {
            accountNumber = uniqid();
            user = await User.findOne({ accountNumber: accountNumber });
        }

        const hash = await hashPassword(data.password);

        const newUser = await new User({
            email: data.email,
            accountNumber: accountNumber,
            password: hash,
            firstName: data.firstName,
            lastName: data.lastName,
            balance: data.startDeposit,

        }).save();

        const plainPassword = data.password;
        return res.status(200).json({ message: "User Created Successfully!", newUser, plainPassword: plainPassword });
    } catch(error) {
        next(error);
    }
}

exports.deactivateUser = async (req, res, next) => {
    const userId = req.body.userId;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                isActive: false,
            }
        },
        {
            new: true
        });

        if (updatedUser) return res.status(200).json({ message: "User Deactivated Successfully!", updatedUser });
        else return res.status(400).json({ message: "User Not Found. Please Check ID and try again "});
    } catch (error) {
        next(error);
    }
}

exports.reactivateUser = async (req, res, next) => {
    const userId = req.body.userId;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                isActive: true,
            }
        },
        {
            new: true
        });

        if (updatedUser) return res.status(200).json({ message: "User Reactivated Successfully!", updatedUser });
        else return res.status(400).json({ message: "User Not Found. Please Check ID and try again "});
    } catch (error) {
        next(error);
    }
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.body.userId;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (deletedUser) return res.status(200).json({ message: "User Deleted Successfully!", deletedUser });
        else return res.status(400).json({ message: "User Not Found. Please Check ID and try again "});
    } catch (error) {
        next(error);
    }
}

exports.reverseTransaction = async (req, res, next) => {
    const transactionId = req.body.transactionId;
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(400).json({ message: "Transaction Not Found. Please Check ID and try again "});

        const senderId = transaction.receiverId;
        const receiverId = transaction.senderId;

        User.findById(senderId, async function (err, foundUser) {
            if (err) throw err;
            if (!foundUser) return res.status(400).json({ message: "Invalid User" });

            const recipient = await User.findById(receiverId);
            if (!recipient) return res.status(400)
            .json({ message: "The Recipient's Account Number Is Invalid. Please Check And Try Again!" });

            const balance = foundUser.balance;
            const amount = transaction.amount;
            if (balance - amount < 0) return res.status(400)
            .json({ message: `Insufficient Funds! Available balance is ₦${balance}` });

            const description = transaction.description;

            const newReversal = await new Transaction({ 
                amount: amount, 
                description: `Reversal - ${description}`, 
                senderId: foundUser._id, 
                receiverId: recipient._id,
                isReversal: true
            }).save();

            foundUser.balance = foundUser.balance - amount;
            foundUser.transactions.push(newReversal._id);

            const recipientId = recipient._id;

            User.findById(recipientId, (err, foundRecipient) => {
                if (err) throw err;
                foundRecipient.balance = foundRecipient.balance + amount;
                foundRecipient.transactions.push(newReversal._id);
                foundRecipient.save((err, saved) => {
                    if (err) throw err;
                    if (saved) foundUser.save((err, saved) => {
                        if (err) throw err;
                        if (saved) return res.status(200).json({ message: `Reversal Successful!`});
                    });
                });
            });
        });

    } catch (error) {
        next(error);
    }
}