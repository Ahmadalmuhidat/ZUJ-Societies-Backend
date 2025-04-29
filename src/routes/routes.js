const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/user');
const auth_mdiddleware = require('../middlewares/auth');

// users routes
router.get('/get_users', auth_mdiddleware, user_controller.get_users);

router.post('/create_user', auth_mdiddleware, user_controller.create_user);

module.exports = router;
