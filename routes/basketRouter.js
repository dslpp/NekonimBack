const Router = require('express')
const router = new Router()
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', authMiddleware, basketController.getBasketUser)
router.post('/', authMiddleware, basketController.addToBasket)
router.put('/increment/:id', authMiddleware, basketController.incrementQuantity)
router.put('/decrement/:id', authMiddleware, basketController.decrementQuantity)
router.delete('/:id', authMiddleware, basketController.deleteFromBasket)

module.exports = router
