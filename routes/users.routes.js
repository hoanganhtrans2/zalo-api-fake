var express = require('express');
var router = express.Router();
var userController = require('../controller/users.controller');

router.get('/:userid', userController.getUser);
router.post('/updateinfo', userController.updateInfo);
router.post('/register', userController.register);

module.exports = router;
