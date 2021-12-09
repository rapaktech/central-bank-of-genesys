const express = require('express');
const router = express.Router();
const checkIfAdmin = require('./../middleware/admin');
const controllers = require('./../controllers/admin');

router.post('/auth/admin', controllers.adminLogin);

router.post('/users', checkIfAdmin(), controllers.createUser);

router.put('/users/deactivate', checkIfAdmin(), controllers.deactivateUser);

router.put('/users/reactivate', checkIfAdmin(), controllers.reactivateUser);

router.delete('/users/delete', checkIfAdmin(), controllers.deleteUser);

router.post('/users/reverse', checkIfAdmin(), controllers.reverseTransaction);

module.exports = router;