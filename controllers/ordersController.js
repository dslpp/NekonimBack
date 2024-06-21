const { Order, OrderProduct, Products } = require("../models/models");

    class OrdersController {
       
        async create(req, res, next) {
            const { userId, products, totalAmount,status } = req.body;
            try {
                // Создаем новый заказ
                const newOrder = await Order.create({
                  userId,
                  totalAmount,
                  status    
                });
            
                for (const product of products) {
                  await OrderProduct.create({
                    orderId: newOrder.id,
                    productId: product.productId,
                    quantity: product.quantity,
                    price: product.price,
                  });
                }
            
                res.status(201).json(newOrder);
              } catch (error) {
                console.error('Ошибка при создании заказа:', error);
                res.status(500).json({ error: 'Ошибка сервера при создании заказа' });
              }
        }
        async getOrders(req, res) {
          try {
            const userId = req.user.id; 
            const orders = await Order.findAll({
              where: { userId: userId },
              include: [
                {
                  model: OrderProduct,
                  as: 'orderProducts', 
                  include: [{ model: Products, as: 'products' }]
                }
              ]
            });
            res.status(200).json(orders);
          } catch (error) {
            console.error('Ошибка при получении заказов:', error);
            res.status(500).json({ error: 'Ошибка сервера при получении заказов' });
          }
        }
    }
    module.exports = new OrdersController()