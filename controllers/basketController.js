const { BasketProducts, Products, Basket } = require("../models/models")

class BasketController {
 
    async addToBasket(req, res, next) {
        try {
            const user = req.user;
            const { productId } = req.body;
    
            // Проверяем, существует ли продукт уже в корзине пользователя
            const existingProduct = await BasketProducts.findOne({
                where: { basketId: user.id, productId: productId }
            });
    
            if (existingProduct) {
                // Если продукт уже есть в корзине, увеличиваем его количество
                existingProduct.Quantity += 1;
                await existingProduct.save();
                return res.json(existingProduct);
            } else {
                // Если продукта нет в корзине, создаем новую запись
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
                    attributes: ['id', 'name', 'price', 'img'],
                },
                where: { basketId: id }
            });
    
            // Добавляем количество каждого продукта в корзине к ответу
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
            const { id } = req.params; // Получаем id товара, который нужно удалить из корзины
            const deleted = await BasketProducts.destroy({ where: { id } }); // Удаляем товар из корзины по его id
            if (deleted) {
                return res.status(204).json({ message: "Товар успешно удален из корзины" });
            } else {
                return res.status(404).json({ message: "Товар не найден в корзине" });
            }
        } catch (error) {
            next(error);
        }
    }
    
}

module.exports = new BasketController()