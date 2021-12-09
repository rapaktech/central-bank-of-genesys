const Admin = require('./../models/admin');
const { decodeToken } = require('./../services/jwt');

module.exports = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(400).json({ message: "Token Missing. Please Sign In Again To Access This Page. "});

            const admin = decodeToken(token);
            if (!admin) return res.status(400).json({ message: "Token Expired. Please Sign In Again To Access This Page. "});

            Admin.findOne({ _id: admin.id, email: admin.email }, (err, foundAdmin) => {
                if (err) throw err;
                if (!foundAdmin) return res.status(400).json({ message: "Unauthorized!"});
            });

            req.admin = admin;
            next();
        } catch (error) {
            next(error);
        }
    }
}