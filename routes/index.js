const Router = require ('express')
const router = new Router()
const productsRouter = require ('./productsRouter')
const userRouter =require ('./userRouter')
const typeRouter =require ('./typeRouter')
const basketRouter =require ('./basketRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/products', productsRouter)
router.use('/basket', basketRouter)


module.exports= router