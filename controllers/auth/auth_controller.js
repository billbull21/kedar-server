const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const {User} = require('../../models/');
const v = new Validator();

const register = async function(req, res) {
    
    try {
     const schema = {
         username: 'string|empty:false',
         // email: 'email|empty:false',
         password: 'string|min:6',
     }
 
     const validate = v.validate(req.body, schema);
 
     console.log("VALIDATE : ", validate);
     if (validate.length) {
         return res.status(400).json({
             status: 'error',
             message: validate,
         })
     } else {

         const user = await User.findOne({
             where: {username: req.body.username}
         })

         if (user) {
             return res.status(409).json({
                 status: 'error',
                 message: 'username already exists!',
             })
         }

         // use var, because const/let can't redeclared!
         var password = await bcrypt.hash(req.body.password, 10)

         var data = {
             username: req.body.username,
             password,
             role: 'client',
         }

         const createUser = await User.create(data)

         var {password, ...result} = createUser['dataValues']

         return res.status(200).json({
             status: 'success',
             message: result,
         })
     }
    } catch (e) {
     console.log("ERROR MSG : ", e);
     return res.status(500).json({
         status: 'error',
         message: 'internal server error!',
     })
    }
}

const login = async function(req, res) {
    
    try {
     const schema = {
         username: 'string|empty:false',
         // email: 'email|empty:false',
         password: 'string|min:6',
     }
 
     const validate = v.validate(req.body, schema);
 
     console.log("VALIDATE : ", validate);
     if (validate.length) {
         return res.status(400).json({
             status: 'error',
             message: validate,
         })
     } else {

         const user = await User.findOne({
             where: {username: req.body.username}
         })

         if (!user) {
             return res.status(404).json({
                 status: 'error',
                 message: 'username not found!',
             })
         }

         const isValidPassword = await bcrypt.compare(req.body.password, user.password)
         if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'username and password doesn\'t match!',
            })
         }

         const {password, ...result} = user['dataValues']

         return res.status(200).json({
             status: 'success',
             message: result,
         })
     }
    } catch (e) {
     console.log("ERROR MSG : ", e);
     return res.status(500).json({
         status: 'error',
         message: 'internal server error!',
     })
    }
}

module.exports = {
    register,
    login
}