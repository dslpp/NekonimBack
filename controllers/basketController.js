// controllers/BasketController.js

const { BasketProducts, Products, Basket } = require("../models/models")

class BasketController {
 
    async addToBasket(req, res, next) {
        try {
            const user = req.user;
            const { productId } = req.body;
    
  
            const existingProduct = await BasketProducts.findOne({
                where: { basketId: user.id, productId: productId }
            });
    
            if (existingProduct) {
                existingProduct.Quantity += 1;
                await existingProduct.save();
                return res.json(existingProduct);
            } else {
                const basketProduct = await BasketProducts.create({ basketId: user.id, productId: productId });
                return res.json(basketProduct);
            }
        } catch (error) {
            next(error);
        }
    }
   
    
    async getBasketUser(req, res, next) {
        try {
            const { id } = req.user;
            const basket = await BasketProducts.findAll({
                include: {
                    model: Products,
                    attributes: ['id', 'name','price', 'img'],
                },
                where: { basketId: id }
            });
            const basketWithQuantity = basket.map(item => ({
                ...item.toJSON(),
                quantity: item.Quantity
            }));
    
            return res.json(basketWithQuantity);
        } catch (error) {
            next(error);
        }
    }
    async deleteFromBasket(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await BasketProducts.destroy({ where: { id } }); 
            if (deleted) {
                return res.status(204).json({ message: "Товар успешно удален из корзины" });
            } else {
                return res.status(404).json({ message: "Товар не найден в корзине" });
            }
        } catch (error) {
            next(error);
        }
    }

    async incrementQuantity(req, res, next) {
        try {
            const { id } = req.params;

            const basketProduct = await BasketProducts.findByPk(id);

            if (!basketProduct) {
                return res.status(404).json({ message: "Товар не найден в корзине" });
            }

            basketProduct.Quantity += 1;
            await basketProduct.save();

            return res.json(basketProduct);
        } catch (error) {
            next(error);
        }
    }

    async decrementQuantity(req, res, next) {
        try {
            const { id } = req.params;

            const basketProduct = await BasketProducts.findByPk(id);

            if (!basketProduct) {
                return res.status(404).json({ message: "Товар не найден в корзине" });
            }

            if (basketProduct.Quantity > 1) {
                basketProduct.Quantity -= 1;
                await basketProduct.save();
            } else {
                await basketProduct.destroy();
            }

            return res.json({ message: "Количество товара обновлено" });
        } catch (error) {
            next(error);
        }
    }
    
}

module.exports = new BasketController()
