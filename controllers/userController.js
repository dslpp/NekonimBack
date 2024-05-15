const ApiError = require("../error/ApiError")
const {User, Basket, UserAccount} = require('../models/models')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const generateJwt= (id, email,  role)=>{
     return jwt.sign({id, email, role},process.env.SECRET_KEY, {expiresIn:'12h'} )
} 

class UserController {
    
    async registration(req, res, next){
        try{
            const {email, password, role} =req.body
             if (!email || !password){
                return next(ApiError.badRequest('Введите e-mail или пароль'))
             }
             const candidate = await User.findOne({where: {email}})
             if (candidate){
                return next(ApiError.badRequest('Пользователь с таким e-mail уже существует'))
             }
             const hashPassword = await bcrypt.hash(password, 5)
             const user = await User.create({email, role, password:hashPassword})
             const basket =await Basket.create({userId:user.id})
             const account = await UserAccount.create({userId:user.id})
             const token = generateJwt(user.id, user.email, user.role)

             return res.json({token}) 
            }
            catch (e) {
                if (e.name === 'ValidationError') {
                  return res.status(400).json({ message: e.message });}
                  return next(ApiError.internal('Произошла ошибка при регистрации'));
                }}
    async login(req, res, next){
        try {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Неверный email или пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})}
        catch (e) {
          
            if (e.name === 'ValidationError') {
              return res.status(400).json({ message: e.message });
            }
            return next(ApiError.internal('Произошла ошибка при входе'));
          }
    }
    async check(req, res){
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})

    }
}
module.exports = new UserController