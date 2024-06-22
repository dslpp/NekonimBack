const Router = require('express');
const router = new Router();
const productsController = require('../controllers/productsController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole('ADMIN'), productsController.create);
router.patch('/:id', checkRole('ADMIN'), productsController.update);
router.delete('/:id', checkRole('ADMIN'), productsController.delete);
router.get('/', productsController.getAll);
router.get('/:id', productsController.getOne);
router.post('/search', productsController.search);
router.patch('/info/:id', checkRole('ADMIN'), productsController.updateInfo);
router.post('/info', checkRole('ADMIN'), productsController.createInfo);
router.delete('/info/:id', checkRole('ADMIN'), productsController.deleteInfo);
router.get('/:productId/info', productsController.getInfo);     


module.exports = router;
