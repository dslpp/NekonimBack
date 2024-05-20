const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
  name: { type: DataTypes.STRING, allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false },
  sex: { type: DataTypes.STRING,defaultValue: "Не задан" },
  phoneNumber: { 
    type: DataTypes.STRING, 
    allowNull: false, 
  
  }
});


const Basket = sequelize.define('basket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const BasketProducts = sequelize.define('basketproducts', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER }, 
});

const Products = sequelize.define('products', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  shortdescription: { type: DataTypes.TEXT },
  price: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  img: { type: DataTypes.STRING, allowNull: false },
});


const Type = sequelize.define('type', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

const ProductsInfo = sequelize.define('products_info', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
});

const Order = sequelize.define('order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // Идентификатор пользователя, сделавшего заказ
  status: { type: DataTypes.STRING, allowNull: false }, // Статус заказа (например, "в обработке", "выполнен")
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Общая сумма заказа
});

const OrderProduct = sequelize.define('orderProduct', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false }, // Идентификатор заказа, к которому относится товар
  productId: { type: DataTypes.INTEGER, allowNull: false }, // Идентификатор продукта, который находится в заказе
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Цена товара на момент заказа
});


User.hasOne(Basket)
Basket.belongsTo(User)

Basket.hasMany(BasketProducts)
BasketProducts.belongsTo(Basket)

Type.hasMany(Products)
Products.belongsTo(Type)

Products.hasMany(BasketProducts)
BasketProducts.belongsTo(Products)

Products.hasMany(ProductsInfo, { as: 'info' });
ProductsInfo.belongsTo(Products);

User.hasMany(Order);
Order.belongsTo(User);


Order.hasMany(OrderProduct);
OrderProduct.belongsTo(Order);


module.exports={
   User, 
   Basket,
   BasketProducts,
   Products,
   Type,
   ProductsInfo,
   Order,
   OrderProduct
}
