const ApiError = require("../error/ApiError");
const { User, Basket} = require("../models/models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "12h",
  });
};

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, name, surname, phoneNumber } = req.body;
      if (!email || !password || !name || !surname || !phoneNumber) {
        return next(ApiError.badRequest("Заполните все поля"));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(
          ApiError.badRequest("Пользователь с таким e-mail уже существует")
        );
      }
      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({
        email,
        password: hashPassword,
        name,
        surname,
        phoneNumber,
        role: "USER",
      });
      await Basket.create({ userId: user.id });
      const token = generateJwt(user.id, user.email, user.role);

      return res.json({ token });
    } catch (e) {
      if (e.name === "ValidationError") {
        return res.status(400).json({ message: e.message });
      }
      return next(ApiError.internal("Произошла ошибка при регистрации"));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal("Неверный email или пароль"));
      }
      const token = generateJwt(user.id, user.email, user.role);
      return res.json({ token });
    } catch (e) {
      if (e.name === "ValidationError") {
        return res.status(400).json({ message: e.message });
      }
      return next(ApiError.internal("Произошла ошибка при входе"));
    }
  }

  async check(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
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
      await User.update(updatedFields, {
        where: { id: userId },
      });

      // Возвращаем успешный ответ
      return res.status(200).json({ message: "Информация о пользователе успешно обновлена" });
    } catch (e) {
      // В случае ошибки возвращаем сообщение об ошибке
      return next(ApiError.internal("Произошла ошибка при обновлении информации о пользователе"));
    }
  }

  
    async updatePassword(req, res, next) {
      try {
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
          return next(ApiError.badRequest("Пароли не совпадают"));
        }
  
        const hashPassword = await bcrypt.hash(password, 5);
        await User.update({ password: hashPassword }, { where: { id: req.user.id } });
  
        const user = await User.findByPk(req.user.id);
        const token = generateJwt(user.id, user.email, user.role);
  
        return res.json({ token });
      } catch (e) {
        return next(ApiError.internal("Произошла ошибка при обновлении пароля"));
      }
    }
  
    async updateEmail(req, res, next) {
      try {
        const { email } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return next(ApiError.badRequest("Пользователь с таким e-mail уже существует"));
        }
  
        await User.update({ email }, { where: { id: req.user.id } });
  
        const user = await User.findByPk(req.user.id);
        const token = generateJwt(user.id, user.email, user.role);
  
        return res.json({ token });
      } catch (e) {
        return next(ApiError.internal("Произошла ошибка при обновлении почты"));
      }
    }

  
}


module.exports = new UserController();
