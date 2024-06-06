const ApiError = require("../error/ApiError");
const { User, Basket } = require("../models/models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const { Op } = require('sequelize');

// Функция генерации JWT
const generateJwt = (id, email, role,isActivated) => {
  return jwt.sign({ id, email, role,isActivated }, process.env.SECRET_KEY, { expiresIn: "12h" });
};

// Настройка транспортера для отправки писем
const transporter = nodemailer.createTransport({
  service: "mail.ru",
    auth: {
      user: "nekonim@mail.ru", // Ваш адрес электронной почты на Mail.ru
      pass: "GfvXaMptUd1xbey6peEG", // Пароль от вашей учетной записи на Mail.ru
    },
});

// Функция отправки письма для активации аккаунта
const sendActivationMail = (email, link) => {
  transporter.sendMail({
    from: '"Nekonim Support" <nekonim@mail.ru>', // Отправитель
    to: email,
    subject: 'Подтверждение регистрации и активация аккаунта',
    html: `
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">

    <p align=center style="font-family:Outfit; 
    color: #b56576;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: 5vw;"> Nekonim </p>
    <div style="font-family:Ossem; font-size:1.5vw; color:#000000">
        <p> Здравствуйте! Вы были зарегистрированы в интернет-магазине по продаже аниме товаров из Японии "Nekonim".</p>
       <p>Если вы не регистрировались, просто игнорируйте это письмо.</p>
       <p>Для подтверждения регистрации перейдите, пожалуйста, по этой ссылке: </p>
       <p> <a href="${link}">${link}</a></p>
       <p>C наилучшими пожеланиями,</p>
       <p>Nekonim.</p>
    `,
  });
};

class UserController {
  async resetPasswordRequest(req, res)  {
    const { email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const resetToken = uuid.v4();
      const resetTokenExpiry = Date.now() + 3600000; // 1 час

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

      const mailOptions = {
        from: '"Nekonim Support" <nekonim@mail.ru>',
        to: email,
        subject: 'Сброс пароля',
        text: `Для сброса пароля перейдите по следующей ссылке: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Email sent: ' + info.response);
      });

      return res.json({ message: 'Ссылка для сброса пароля отправлена на вашу почту' });
    } catch (e) {
      return res.status(500).json({ message: 'Что-то пошло не так' });
    }
  };

  async resetPassword(req, res) {
    const { resetToken, password } = req.body;
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: { [Op.gt]: Date.now() },
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Ссылка для сброса пароля недействительна или истекла' });
      }
  
      const hashPassword = await bcrypt.hash(password, 5);
      user.password = hashPassword; // Update user's password
      user.resetPasswordToken = null; // Clear reset token
      user.resetPasswordExpires = null; // Clear reset token expiry
      await user.save();
  
      return res.json({ message: 'Пароль успешно сброшен' });
    } catch (e) {
      return res.status(500).json({ message: 'Что-то пошло не так' });
    }
  };
  
  // Регистрация пользователя
  async registration(req, res, next) {
    try {
      const { email, password, name, surname, phoneNumber } = req.body;
      if (!email || !password || !name || !surname || !phoneNumber) {
        return next(ApiError.badRequest("Заполните все поля"));
      }
  
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest("Пользователь с таким e-mail уже существует"));
      }
  
      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({
        email,
        password: hashPassword,
        name,
        surname,
        phoneNumber,
        role: "USER",
        isActivated: false,
      });
  
      const activationLink = `http://localhost:5000/api/user/activate/${user.id}`;
      sendActivationMail(email, activationLink);
      await Basket.create({ userId: user.id });
      const token = generateJwt(user.id, user.email, user.role);
      return res.json({ token, message: 'Пользователь зарегистрирован. Для активации проверьте почту.' });
    } catch (e) {
      console.error("Ошибка при регистрации: ", e);
      return next(ApiError.internal("Произошла ошибка при регистрации"));
    }
  }
  
  // Активация аккаунта пользователя
  async activate(req, res, next) {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      if (!user) {
        return next(ApiError.badRequest("Некорректная ссылка активации"));
      }
      user.isActivated = true;
      await user.save();
      return res.redirect(`http://localhost:3000`);
    } catch (e) {
      return next(ApiError.internal("Произошла ошибка при активации аккаунта"));
    }
  }

  // Вход пользователя
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }

      if (!user.isActivated) {
        const activationLink = `http://localhost:5000/api/user/activate/${user.id}`;
        sendActivationMail(user.email, activationLink);
        return next(ApiError.internal("Аккаунт не активирован. Ссылка для активации отправлена на вашу почту."));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal("Неверный email или пароль"));
      }

      const token = generateJwt(user.id, user.email, user.role, user.isActivated);
      return res.json({ token });
    } catch (e) {
      return next(ApiError.internal("Произошла ошибка при входе"));
    }
  }

  // Проверка токена
  async check(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.isActivated);
    return res.json({ token });
  }

  // Получение информации о пользователе
  async getUserInfo(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }
      return res.json(user);
    } catch (e) {
      return next(ApiError.internal("Произошла ошибка при получении информации о пользователе"));
    }
  }

  // Обновление информации о пользователе
  async updateUserInfo(req, res, next) {
    try {
      const { name, surname, phoneNumber, sex } = req.body;
      const userId = req.user.id; // ID текущего пользователя
      const updatedFields = {}; // Объект для хранения обновленных полей

      // Проверяем, какие поля были переданы и добавляем их в объект обновленных полей
      if (name) updatedFields.name = name;
      if (surname) updatedFields.surname = surname;
      if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
      if (sex) updatedFields.sex = sex;

      // Обновляем информацию о пользователе в базе данных
      await User.update(updatedFields, { where: { id: userId } });

      // Возвращаем успешный ответ
      return res.status(200).json({ message: "Информация о пользователе успешно обновлена" });
    } catch (e) {
      // В случае ошибки возвращаем сообщение об ошибке
      return next(ApiError.internal("Произошла ошибка при обновлении информации о пользователе"));
    }
  }

  // Обновление пароля пользователя
  async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return next(ApiError.badRequest("Старый пароль неверен"));
      }

      if (newPassword !== confirmPassword) {
        return next(ApiError.badRequest("Пароли не совпадают"));
      }

      const hashPassword = await bcrypt.hash(newPassword, 5);
      user.password = hashPassword;
      await user.save();

      const token = generateJwt(user.id, user.email, user.role, user.isActivated);
      return res.json({ token, message: "Пароль успешно обновлён" });
    } catch (e) {
      return next(ApiError.internal("Произошла ошибка при обновлении пароля"));
    }
  }

}

module.exports = new UserController();
