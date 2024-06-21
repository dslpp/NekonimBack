const Router = require ('express')
const router = new Router()
const ordersController= require('../controllers/ordersController')
const auth = require('../middleware/authMiddleware')

router.post('/create', auth, ordersController.create)
router.get('/', auth, ordersController.getOrders)


module.exports= router