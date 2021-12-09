const User = require('./../models/user');
const { decodeToken } = require('./../services/jwt');

module.exports = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(400).json({ message: "Token Missing. Please Sign In Again To Access This Page. "});

            const user = decodeToken(token);
            if (!user) return res.status(400).json({ message: "Token Expired. Please Sign In Again To Access This Page. "});

            User.findOne({ _id: user.id, email: user.email }, (err, foundUser) => {
                if (err) throw err;
                if (!foundUser) return res.status(400).json({ message: "Unauthorized!"});
            });

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    }
}