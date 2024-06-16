require("dotenv").config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const checkAccountActivation = require('./accountActivationChecker');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Используйте секретный ключ из env
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);

// Добавьте этот маршрут для перенаправления корневого URL на /main
app.get('/', (req, res) => {
  res.redirect('/main');
});

// Маршрут для создания платежного намерения с использованием Stripe
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { totalPrice } = req.body;

    // Создание платежного намерения
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Сумма в центах
      currency: 'byn',
    });

    // Отправка клиентского секрета обратно клиенту
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Ошибка создания платежного намерения:', error.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);

      // Запуск функции проверки активации через 3 дня
      setTimeout(checkAccountActivation, 3 * 24 * 60 * 60 * 1000);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
