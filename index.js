require("dotenv").config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const PORT = process.env.PORT;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const checkAccountActivation = require('./accountActivationChecker');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`СЭРВЭР ДЖС СТАРДЕТ ${PORT}`);
            
            // Запуск функции проверки активации через 3 дня
            setTimeout(checkAccountActivation, 3 * 24 * 60 * 60 * 1000);
        });
    } catch (e) {
        console.log(e);
    }
};

start();
