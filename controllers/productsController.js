const uuid = require('uuid')
const path = require('path');
const {Products, ProductsInfo} = require('../models/models')
const ApiError = require('../error/ApiError');

class ProductsController  {
   
    async create(req, res,next){
        try {
            let {name, shortdescription, price, typeId, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const product = await Products.create({name, shortdescription,price,  typeId, img: fileName});

            if (info) { 
                info = JSON.parse(info)
                info.forEach(index =>
                    ProductsInfo.create({
                        title: index.title,
                        description: index.description,
                        productId: product.id
                    })
                )
            }

            return res.json(product)
        } catch (e) {
          next(ApiError.badRequest(e.message))
        }
    }
    async getAll(req, res){
        let {typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 20
        let offset = page * limit - limit
        let products;
        if (!typeId) {
            products = await Products.findAndCountAll({limit, offset})
        }
        
        if (typeId) {
            products = await Products.findAndCountAll({where:{typeId}, limit, offset})
        }
        
        return res.json(products)
    }
    async getOne(req, res){
        const {id} = req.params
        const product = await Products.findOne(
            {
                where: {id},
                include: [{model: ProductsInfo, as: 'info'}]
            },
        )
        return res.json(product)
    
    }
    async update(req, res, next){
    try {
        const { id } = req.params;
        const { name, shortdescription, price } = req.body;
       

        const updatedProduct = await Products.update(
            { name, shortdescription, price },
            { where: { id }, returning: true }
        );
       

        return res.json(updatedProduct[1][0]);
    } catch (e) {
        next(ApiError.badRequest(e.message));
    }
}
async delete(req, res, next) {
    try {
      const { id } = req.params;
  

      const product = await Products.findByPk(id);
  

      if (!product) {
        return next(ApiError.notFound(`Товар не найден`));
      }

      await product.destroy();
  
      
      return res.json({ message: `Товар успешно удалён` });
    } catch (e) {
   
      next(ApiError.internal(e.message));
    }
  }
  

 
}
module.exports = new ProductsController



