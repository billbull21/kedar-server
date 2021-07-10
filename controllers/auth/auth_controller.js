const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const {
    User
} = require('../../models/');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const v = new Validator();
const nodemailer = require("nodemailer");

const {
    JWT_SECRET,
} = process.env;

const register = async function (req, res) {

    try {
        const schema = {
            nama: 'string|empty:false',
            username: 'string|empty:false',
            email: 'email|empty:false',
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

            // const user = await User.findOne({
            //     where: {
            //         [Op.or]: [
            //             { username: req.body.username },
            //             { email: req.body.email },
            //         ]
            //     }
            // })

            // if (user) {
            //     return res.status(409).json({
            //         status: 'error',
            //         message: 'email already exists!',
            //     })
            // }

            // use var, because const/let can't redeclared!
            var password = await bcrypt.hash(req.body.password, 10)

            // JWT
            const token = jwt.sign({
                username: req.body.username,
                email: req.body.email,
            }, JWT_SECRET)

            var data = {
                nama: req.body.nama,
                username: req.body.username,
                email: req.body.email,
                password,
                status: 'inactive',
                confirmation_code: token,
            }

            const user = await User.create(data)

            nodemailer.sendConfirmationEmail(
                user.username,
                user.email,
                user.confirmation_code
            );

            return res.status(200).json({
                status: 'success',
                message: "anda berhasil login, silahkan cek email anda untuk melakukan proses verifikasi!",
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

const login = async function (req, res) {

    try {
        const schema = {
            email: 'email|empty:false',
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
                where: {
                    email: req.body.email
                }
            })

            if (!user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'email not found!',
                })
            }

            if (user.status == 'inactive') {
                return res.status(400).json({
                    status: 'error',
                    message: 'your account isn\'t activated yet!',
                })
            }

            const isValidPassword = await bcrypt.compare(req.body.password, user.password)
            if (!isValidPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'email and password doesn\'t match!',
                })
            }

            const {
                password,
                ...result
            } = user['dataValues']

            // JWT
            const token = jwt.sign({
                data: result
            }, JWT_SECRET)

            return res.status(200).json({
                status: 'success',
                data: result,
                token: token
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

const confirm = async function (req, res) {

    try {

        const { confirmationCode } = req.params;
        const decodeData = jwt.verify(confirmationCode, process.env.JWT_SECRET)

        const user = await User.findOne({
            where: {
                email: decodeData.data.email,
                confirmation_code: confirmationCode
            }
        })

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'user was not found!',
            })
        }

        if (user.status == 'active') {
            return res.status(400).json({
                status: 'error',
                message: 'your account was already activated!',
            })
        }

        user.status = 'active';

        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'congratulations, your account have been activated!'
        })

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
    login,
    confirm
}