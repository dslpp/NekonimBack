const Router = require('express');
const router = new Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.get('/auth', authMiddleware, UserController.check);
router.get('/account', authMiddleware, UserController.getUserInfo);
router.put('/account', authMiddleware, UserController.updateUserInfo);
router.put('/account/password', authMiddleware, UserController.updatePassword);
router.put('/account/email', authMiddleware, UserController.updateEmail);

module.exports = router;
