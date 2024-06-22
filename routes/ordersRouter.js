const Router = require('express');
const router = new Router();
const ordersController = require('../controllers/ordersController');
const checkRole = require('../middleware/checkRoleMiddleware');
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', ordersController.create);
router.get('/', authMiddleware,ordersController.getOrders); // Для пользователя
router.get('/all', checkRole('ADMIN'), ordersController.getAllOrders); // Только для админов
router.put('/:orderId/status', checkRole('ADMIN'), ordersController.updateOrderStatus); // Только для админов

module.exports = router;
