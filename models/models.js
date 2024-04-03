const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Basket = sequelize.define('basket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const BasketProducts = sequelize.define('basketproducts', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Quantity: { type: DataTypes.INTEGER }, 
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



User.hasOne(Basket)
Basket.belongsTo(User)

Basket.hasMany(BasketProducts)
BasketProducts.belongsTo(Basket)

Type.hasMany(Products)
Products.belongsTo(Type)

Products.hasMany(BasketProducts)
BasketProducts.belongsTo(Products)

Products.hasMany(ProductsInfo,{as:'info'})
ProductsInfo.belongsTo(Products)

module.exports={
   User, 
   Basket,
   BasketProducts,
   Products,
   Type,
   ProductsInfo
}
