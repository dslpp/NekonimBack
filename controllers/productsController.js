const fs = require('fs');
const path = require('path');
const { Op } = require("sequelize");
const { Products, ProductsInfo } = require('../models/models');
const ApiError = require('../error/ApiError');

class ProductsController {
  
  async create(req, res, next) {
    try {
      let { name, shortdescription, price, typeId, info } = req.body;
      const { img } = req.files;
  
      const buffer = fs.readFileSync(img.tempFilePath);
      
      let fileType;
      (async () => {
        const module = await import('file-type');
        fileType = module.default;
      })();
      
      while (!fileType) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
  
      const fileInfo = await fileType.fromBuffer(buffer);
  
      if (!fileInfo || !fileInfo.mime.startsWith('image')) {
        fs.unlinkSync(img.tempFilePath);
        throw new Error('Файл не является изображением.');
      }
  
      let fileName = uuid.v4() + ".jpg";
      img.mv(path.resolve(__dirname, '..', 'statics', fileName));
  
      const product = await Products.create({ name, shortdescription, price, typeId, img: fileName });
  
      if (info) {
        info = JSON.parse(info);
        info.forEach(index =>
          ProductsInfo.create({
            title: index.title,
            description: index.description,
            productId: product.id
          })
        );
      }
  
      return res.json(product);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  
  async getAll(req, res) {
    let { typeId, limit, page, sortByPrice } = req.query;
    page = page || 1;
    limit = limit || 12;
    let offset = page * limit - limit;
    let products;
  
    const sortOptions = {
      asc: 'ASC',
      desc: 'DESC',
    };
  
    const sortDirection = sortOptions[sortByPrice] || null;
  
    const sortQuery = sortDirection ? [['price', sortDirection]] : null;
  
    if (!typeId) {
      products = await Products.findAndCountAll({ limit, offset, order: sortQuery });
    }
  
    if (typeId) {
      products = await Products.findAndCountAll({ where: { typeId }, limit, offset, order: sortQuery });
    }
  
    return res.json(products);
  }
  
  async getOne(req, res) {
    const { id } = req.params;
    const product = await Products.findOne({
      where: { id },
      include: [{ model: ProductsInfo, as: 'info' }]
    });
    return res.json(product);
  }
  
  async update(req, res, next) {
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
  
  async search(req, res, next) {
    try {
      const { searchQuery } = req.body;
      const products = await Products.findAll({
        where: {
          name: {
            [Op.iLike]: `%${searchQuery}%`,
          },
        },
      });
  
      if (products.length === 0) {
        return res.json({ message: 'По запросу "' + `${searchQuery}` + '" ничего не найдено :(' });
      }
  
      return res.json(products);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
}

module.exports = new ProductsController();
