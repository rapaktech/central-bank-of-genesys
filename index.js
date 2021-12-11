require('dotenv').config();
const port = process.env.PORT;
const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// listen for live routes
app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Welcome To The Central Bank of Genesys!' });
});
app.use(userRoutes);
app.use(adminRoutes);


// listen for invalid or dead links
app.use('**', (req, res) => {
    return res.status(404).json({ message: 'Page Not Found!'});
});


// listen for terminal errors
app.use((error, req, res, next)=> {
    console.log(error);
    return res.status(500).json({ message: 'Some Error Occured. Please Try Again Later!' });
});

module.exports = app;