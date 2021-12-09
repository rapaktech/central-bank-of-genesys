const express = require('express');
const router = express.Router();
const checkIfUser = require('./../middleware/user');
const controllers = require('./../controllers/user');

router.post('/auth/users', controllers.userLogin);

router.get('/dashboard', checkIfUser(), controllers.userDashboard);

router.post('/dashboard/deposit', checkIfUser(), controllers.userDeposit);

router.post('/dashboard/withdraw', checkIfUser(), controllers.userWithdrawal);

router.post('/dashboard/transfer', checkIfUser(), controllers.userTransfer);

module.exports = router;