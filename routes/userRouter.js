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
router.get('/activate/:id', UserController.activate);
router.post('/reset-password-request', UserController.resetPasswordRequest);
router.put('/reset-password', UserController.resetPassword);



module.exports = router;
