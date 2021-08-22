const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const {
    User
} = require('../../models/');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const v = new Validator();
const nodemailer = require("../../config/nodemailer.config");

const {
    JWT_SECRET,
} = process.env;

const register = async function (req, res) {

    try {
        const schema = {
            name: 'string|empty:false',
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

            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: req.body.username },
                        { email: req.body.email },
                    ]
                }
            })

            // JWT
            const token = jwt.sign({
                username: req.body.username,
                email: req.body.email,
            }, JWT_SECRET)

            if (user) {
                var message = "";
                if (user.email == req.body.email) {
                    if (user.status === 'inactive') {
                        message = 'account with this email is doesn\'t activated. please check your mailbox!'
                        nodemailer.sendConfirmationEmail(
                            user.username,
                            user.email,
                            user.confirmationCode
                        )
                    } else {
                        message = 'email already exists!'
                    }
                } else if (user.username == req.body.username) {
                    message = 'username already exists!'
                } else {
                    if (user.status === 'inactive') {
                        message = 'account with this email is doesn\'t activated. please check your mailbox!'
                        nodemailer.sendConfirmationEmail(
                            user.username,
                            user.email,
                            user.confirmationCode
                        );
                    } else {
                        message = 'username and email already exists!'
                    }
                }
                return res.status(409).json({
                    status: 'error',
                    message: message,
                })
            }

            // use var, because const/let can't redeclared!
            var password = await bcrypt.hash(req.body.password, 10)

            var data = {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password,
                status: 'inactive',
                confirmationCode: token,
            }

            const userInsert = await User.create(data)

            nodemailer.sendConfirmationEmail(
                userInsert.username,
                userInsert.email,
                userInsert.confirmationCode
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
                    message: 'user was not found!',
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

        console.log("DECODE DATA", decodeData);

        const user = await User.findOne({
            where: {
                email: decodeData.email
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