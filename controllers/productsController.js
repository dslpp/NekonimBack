const uuid = require('uuid');
const path = require('path');
const { Op } = require("sequelize");
const { Products, ProductsInfo } = require('../models/models');
const ApiError = require('../error/ApiError');

class ProductsController {

  async create(req, res, next) {
    try {
      let { name, shortdescription, price, typeId, info } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + path.extname(img.name);
      img.mv(path.resolve(__dirname, '..', 'statics', fileName));
      const product = await Products.create({ name, shortdescription, price, typeId, img: fileName });

      if (info) {
        info = JSON.parse(info);
        await Promise.all(info.map(index =>
          ProductsInfo.create({
            title: index.title,
            description: index.description,
            productId: product.id
          })
        ));
      }

      return res.json(product);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res, next) {
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

    try {
      if (!typeId) {
        products = await Products.findAndCountAll({ limit, offset, order: sortQuery });
      } else {
        products = await Products.findAndCountAll({ where: { typeId }, limit, offset, order: sortQuery });
      }

      return res.json(products);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const product = await Products.findOne({
        where: { id },
        include: [{ model: ProductsInfo, as: 'info' }]
      });

      if (!product) {
        return next(ApiError.notFound(`Товар с id ${id} не найден`));
      }

      return res.json(product);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, shortdescription, price, typeId, info } = req.body;
      const { img } = req.files || {};

      // Найдем продукт по ID
      const product = await Products.findByPk(id);
      if (!product) {
        return next(ApiError.notFound('Продукт не найден'));
      }

      // Если цена не указана, оставим прежнюю
      const updatedPrice = price ? parseFloat(price).toFixed(2) : product.price;

      // Если изображение не загружено, оставим прежнее
      let fileName = product.img;
      if (img) {
        fileName = uuid.v4() + path.extname(img.name);
        img.mv(path.resolve(__dirname, '..', 'statics', fileName));
      }

      // Обновим продукт
      product.name = name || product.name;
      product.shortdescription = shortdescription || product.shortdescription;
      product.price = updatedPrice;
      product.typeId = typeId || product.typeId;
      product.img = fileName;

      await product.save();

      // Обновление информации о продукте
      if (info) {
        const parsedInfo = JSON.parse(info);
        await Promise.all(parsedInfo.map(async (item) => {
          if (item.id) {
            // Если информация уже существует, обновим её
            const existingInfo = await ProductsInfo.findByPk(item.id);
            if (existingInfo) {
              existingInfo.title = item.title;
              existingInfo.description = item.description;
              await existingInfo.save();
            }
          } else {
            // Если информация новая, создадим её
            await ProductsInfo.create({
              title: item.title,
              description: item.description,
              productId: product.id,
            });
          }
        }));
      }

      return res.json(product);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }


  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Products.findByPk(id);

      if (!product) {
        return next(ApiError.notFound(`Товар с id ${id} не найден`));
      }

      await product.destroy();
      return res.json({ message: `Товар с id ${id} успешно удалён` });
    } catch (error) {
      next(ApiError.internal(error.message));
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
        return res.json({ message: `По запросу "${searchQuery}" ничего не найдено` });
      }

      return res.json(products);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
  async getInfo(req, res, next) {
    try {
      const { productId } = req.params;
      const info = await ProductsInfo.findAll({ where: { productId } });

      if (!info) {
        return next(ApiError.notFound('Информация о продукте не найдена'));
      }

      return res.json(info);
    } catch (e) {
      next(ApiError.internal(e.message));
    }
  }
  async createInfo(req, res, next) {
    try {
      const { title, description, productId } = req.body;
      const info = await ProductsInfo.create({ title, description, productId });
      return res.json(info);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  // Обновление характеристики
  async updateInfo(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const info = await ProductInfo.findOne({ where: { id } });

      if (!info) {
        return next(ApiError.notFound('Характеристика не найдена'));
      }

      info.title = title || info.title;
      info.description = description || info.description;
      await info.save();

      return res.json(info);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  // Удаление характеристики
  async deleteInfo(req, res, next) {
    try {
      const { id } = req.params;
      const info = await ProductsInfo.findByPk(id);
      if (!info) {
        return next(ApiError.notFound('Характеристика не найдена'));
      }

      await info.destroy();

      return res.json({ message: 'Характеристика удалена' });
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
}

module.exports = new ProductsController();
