const Router = require('express')
const router = new Router()
const typeController = require('../controllers/typeController')
const checkRole= require('../middleware/checkRoleMiddleware')

router.delete('/:id', checkRole('ADMIN'), typeController.delete);
router.patch('/:id', checkRole('ADMIN'), typeController.change);
router.post('/', checkRole('ADMIN'), typeController.create)
router.get('/', typeController.getAll)

module.exports = router