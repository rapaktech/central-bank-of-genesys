require('dotenv').config();
const Admin = require('./../models/admin');
const { hashPassword } = require('../services/bcrypt');
const firstName = process.env.ADMIN_FIRSTNAME;
const lastName = process.env.ADMIN_LASTNAME;
const email = process.env.ADMIN_EMAIL;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

async function seedAdmin () {
    try {
        const AdminExists = await Admin.findOne({ username: username, email: email });
        if (AdminExists) {
            return console.log("Admin Already Exists!");
        }

        const hash = await hashPassword(password);
        const newAdmin = await new Admin({
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: hash
        }).save();
        return console.log('Admin Created Successfully!');
    } catch (error) {
        console.log(error);
    }
}

module.exports = seedAdmin;