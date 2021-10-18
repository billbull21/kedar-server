const bcrypt = require('bcrypt');
const Validator = require('fastest-validator');
const {
    User
} = require('../../models/');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const v = new Validator();
const nodemailer = require("../../config/nodemailer.config");
const fs = require('fs');

const {
    JWT_SECRET,
} = process.env;

const fetchAllUsers = async function (req, res) {

    try {

        const data = await User.findAll({
            attributes: {exclude: ['password', 'confirmationCode']},
        })

        const result = data.map((x) => {
            if (x.avatar)
                x.avatar = req.protocol+'://'+`${req.get('host')}`+x.avatar
            return x
        });

        return res.status(200).json({
            status: 'success',
            data: result,
        })
    } catch (e) {
        console.log("ERROR MSG : ", e);
        return res.status(500).json({
            status: 'error',
            message: 'internal server error!',
        })
    }
}

const fetchUserByUsername = async function (req, res) {

    try {

        const {username} = req.params;

        const data = await User.findOne({
            where: {
                username: username
            },
            attributes: {exclude: ['password', 'confirmationCode']},
        })

        if (data.avatar) {
            data.avatar = req.protocol+'://'+`${req.get('host')}`+data.avatar;
        }

        return res.status(200).json({
            status: 'success',
            data: data,
        })
    } catch (e) {
        console.log("ERROR MSG : ", e);
        return res.status(500).json({
            status: 'error',
            message: 'internal server error!',
        })
    }
}

const register = async function (req, res) {

    try {
        const schema = {
            name: 'string|empty:false',
            username: 'string|empty:false|min:3',
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

const updateUser = async function (req, res) {

    try {

        const {username} = req.params;

        const schema = {
            name: 'string|empty:false',
            username: 'string|empty:false|min:3',
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
                    username: username
                },
                attributes: {exclude: ['password', 'confirmationCode']},
            })

            if (user) {

                // TODO("ADD VALIDATION TO SEPARATE UPDATE FROM OWN USER OR SUPERADMIN")
                if (username != req.user.data.username) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'sorry, you can\'t edit this user!',
                    })
                } else {

                    var filePath = "";

                    if (req.body.avatar) {
                        const file = Buffer.from(req.body.avatar, 'base64');

                        const folderPath = `/upload/user-avatar/${username}`
                        filePath = `${folderPath}/${username}-avatar.png`

                        fs.mkdirSync('public'+folderPath, { recursive: true })
                        fs.writeFileSync('public'+filePath, file,  
                            function() 
                            {
                                console.log('DEBUG - feed:message: Saved to disk image attached by user:', 'public/temporary/file.csv');
                            },
                        );
                    }

                    var data = {
                        name: req.body.name,
                        username: req.body.username,
                        avatar: filePath,
                    }
        
                    const updateUser = await user.update(data)
    
                    // const {
                    //     password,
                    //     confirmationCode,
                    //     ...result
                    // } = updateUser['dataValues']
        
                    return res.status(200).json({
                        status: 'success',
                        message: "data have updated!",
                        data: updateUser,
                    })   
                }
            }
            
            return res.status(400).json({
                status: 'error',
                message: 'user was not found!',
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
    fetchAllUsers,
    fetchUserByUsername,
    register,
    updateUser,
    login,
    confirm
}