require('custom-env').env('staging');
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

async function connectToDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Database Connection Successful!");
    } catch (error) {
        console.error(error);
    }
}

module.exports = connectToDB;