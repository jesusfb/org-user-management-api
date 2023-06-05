const { Router } = require('express');

const userController = require('../controllers/user');

const router = Router();

router.get('/', userController.getUsers);
router.post('/', userController.registerUser);
router.post('/authenticate', userController.authenticateUser);

module.exports = router;
