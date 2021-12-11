const User = require('./../models/user');
const Transaction = require('./../models/transaction');
const { verifyPassword } = require('../services/bcrypt');
const { signToken } = require('../services/jwt');

exports.userLogin = async (req, res) => {
    const data = req.body;
    try {
        const user = await User.findOne({ email: data.email });
        const isValidPassword = await verifyPassword(data.password, user.password);
        if (!user || !isValidPassword) return res.status(400).json({ message: "Invalid Email Or Password" });
        const token = signToken({ id: user._id, email: user.email });
        user.password = null;
        return res.status(201).json({ message: "User Logged In Successfully!", token, user });
    } catch (error) {
        console.log(error);
    } 
}

exports.userDashboard = async (req, res, next) => {
    const user = req.user;
    try {
        const foundUser = await User.findOne({ _id: user.id, email: user.email }).populate({ path: 'transactions' });
        return res.status(201).json({ message: "Here's Your Dashboard: ", foundUser });
    } catch (error) {
        next(error);
    }
}

exports.userDeposit = async (req, res, next) => {
    const data = req.body;
    const user = req.user;
    try {
        User.findOne({ _id: user.id, email: user.email }, async function (err, foundUser) {
            if (err) throw err;
            if (!foundUser) return res.status(400).json({ message: "Invalid User" });
            if (foundUser.isActive === false) return res.status(400)
            .json({ message: "Your Account Has Been Deactivated. Please Contact Support To Reactivate." });

            const amount = data.amount;
            if (amount <= 0) return res.status(400)
            .json({ message: "Deposit Is Too Small. Please Try A Bigger Amount." });

            const newDeposit = await new Transaction({
                amount: data.amount,
                description: data.description,
                senderId: foundUser._id,
                receiverId: foundUser._id,
                isDeposit: true
            }).save();

            foundUser.balance = foundUser.balance + amount;
            foundUser.transactions.push(newDeposit._id);
            const newBalance = foundUser.balance;
            foundUser.save((err, saved) => {
                if (err)
                    throw err;
                if (saved) {
                    return res.status(200).json({ message: `Deposit Successful! Your new balance is ₦${newBalance}` });
                }
            });
        });
    } catch (error) {
        next(error);
    }
}

exports.userWithdrawal = async (req, res, next) => {
    const data = req.body;
    const user = req.user;
    try {
        User.findOne({ _id: user.id, email: user.email }, async function (err, foundUser) {
            if (err) throw err;
            if (!foundUser) return res.status(400).json({ message: "Invalid User" });
            if (foundUser.isActive === false) return res.status(400)
            .json({ message: "Your Account Has Been Deactivated. Please Contact Support To Reactivate." });
            const balance = foundUser.balance;
            const amount = data.amount;
            if (balance - amount < 0) return res.status(400)
            .json({ message: `Insufficient Funds! Please Try A Smaller Amount. Your available balance is ₦${balance}` });

            const newWithdrawal = await new Transaction({ 
                amount: data.amount, 
                description: data.description, 
                senderId: foundUser._id, 
                receiverId: foundUser._id,
                isWithdrawal: true
            }).save();

            foundUser.balance = foundUser.balance - amount;
            foundUser.transactions.push(newWithdrawal._id);
            const newBalance = foundUser.balance;
            foundUser.save((err, saved) => {
                if (err) throw err;
                if (saved) {
                    newWithdrawal.save();
                    return res.status(200).json({ message: `Deposit Successful! Your new balance is ₦${newBalance}`});
                }
            });
        });
    } catch (error) {
        next(error);
    }
}

exports.userTransfer = async (req, res, next) => {
    const data = req.body;
    const user = req.user;
    try {
        User.findOne({ _id: user.id, email: user.email }, async function (err, foundUser) {
            if (err) throw err;
            if (!foundUser) return res.status(400).json({ message: "Invalid User" });
            if (foundUser.isActive === false) return res.status(400)
            .json({ message: "Your Account Has Been Deactivated. Please Contact Support To Reactivate." });

            const recipient = await User.findOne({ accountNumber: data.recipientAccountNumber });
            if (!recipient) return res.status(400)
            .json({ message: "The Recipient's Account Number Is Invalid. Please Check And Try Again!" });

            const balance = foundUser.balance;
            const amount = data.amount;
            if (balance - amount < 0) return res.status(400)
            .json({ message: `Insufficient Funds! Please Try A Smaller Amount. Your available balance is ₦${balance}` });

            const newTransfer = await new Transaction({ 
                amount: data.amount, 
                description: data.description, 
                senderId: foundUser._id, 
                receiverId: recipient._id,
                isTransfer: true
            }).save();

            foundUser.balance = foundUser.balance - amount;
            foundUser.transactions.push(newTransfer._id);

            const recipientId = recipient._id;
            const newBalance = foundUser.balance;

            User.findById(recipientId, (err, foundRecipient) => {
                if (err) throw err;
                foundRecipient.balance = foundRecipient.balance + amount;
                foundRecipient.transactions.push(newTransfer._id);
                foundRecipient.save((err, saved) => {
                    if (err) throw err;
                    if (saved) foundUser.save((err, saved) => {
                        if (err) throw err;
                        if (saved) return res.status(200).json({ message: `Transfer Successful! Your new balance is ₦${newBalance}`});
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
}