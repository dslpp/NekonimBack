const { BasketProducts, Products, Basket } = require("../models/models")

class BasketController {
 
    async addToBasket(req, res, next) {
        try {
            const user = req.user;
            const { productId } = req.body;

            console.log('User:', user);
            console.log('ProductId:', productId);

            const existingProduct = await BasketProducts.findOne({
                where: { basketId: user.id, productId: productId }
            });

            if (existingProduct) {
                existingProduct.quantity += 1;
                await existingProduct.save();
                return res.json(existingProduct);
            } else {
                const basketProduct = await BasketProducts.create({ basketId: user.id, productId: productId });
                return res.json(basketProduct);
            }
        } catch (error) {
            console.error('Error adding to basket:', error);
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
            const basketWithquantity = basket.map(item => ({
                ...item.toJSON(),
                quantity: item.quantity
            }));
    
            return res.json(basketWithquantity);
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

            basketProduct.quantity += 1;
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

            if (basketProduct.quantity > 1) {
                basketProduct.quantity -= 1;
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
