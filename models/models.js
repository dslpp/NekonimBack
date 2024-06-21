const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
  name: { type: DataTypes.STRING, allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false },
  sex: { type: DataTypes.STRING, defaultValue: "Не задан" },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE }
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
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
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
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

const OrderProduct = sequelize.define('orderProduct', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});
const Review = sequelize.define('review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  reviewDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

User.hasOne(Basket, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Basket.belongsTo(User);

Basket.hasMany(BasketProducts, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
BasketProducts.belongsTo(Basket);

Type.hasMany(Products, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Products.belongsTo(Type);

Products.hasMany(BasketProducts, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
BasketProducts.belongsTo(Products);

Products.hasMany(ProductsInfo, { as: 'info', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProductsInfo.belongsTo(Products);

User.hasMany(Order, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.belongsTo(User);

Order.hasMany(OrderProduct, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderProduct.belongsTo(Order);

User.hasMany(Review, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Review.belongsTo(User);

Products.hasMany(Review, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Review.belongsTo(Products);

OrderProduct.belongsTo(Products, { as: 'products', foreignKey: 'productId' });
Products.hasMany(OrderProduct, { as: 'orderProducts', foreignKey: 'productId' }); 
module.exports = {
   User, 
   Basket,
   BasketProducts,
   Products,
   Type,
   ProductsInfo,
   Order,
   OrderProduct,
   Review
};
