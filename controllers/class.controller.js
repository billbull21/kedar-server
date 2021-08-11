const Validator = require('fastest-validator');
const {
    MClass,
    TClassUsers
} = require('../models/');
const {
    Op
} = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const v = new Validator();

const fetchAll = async function (req, res) {

    try {
        const data = await MClass.findAll({
            where: {
                user_id: req.user.data.id
            }
        })

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

const create = async function (req, res) {

    try {
        const schema = {
            name: 'string|empty:false',
            description: 'string|empty:false',
        }

        const validate = v.validate(req.body, schema);

        console.log("VALIDATE : ", validate);
        if (validate.length) {
            return res.status(400).json({
                status: 'error',
                validation: validate,
            })
        } else {

            const data = {
                name: req.body.name,
                description: req.body.description,
                user_id: req.user.data.id,
                avatar: req.body.avatar,
                banner: req.body.banner,
            }

            const createClass = await MClass.create(data);
            const join = await TClassUsers.create({
                id: uuidv4(),
                class_id: createClass.id,
                user_id: req.user.data.id
            });

            return res.status(200).json({
                status: 'success',
                message: "successfully create new class!",
                data: createClass,
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

const update = async function (req, res) {

    try {

        const { id } = req.params;

        const schema = {
            name: 'string|empty:false',
            description: 'string|empty:false',
        }

        const validate = v.validate(req.body, schema);

        console.log("VALIDATE : ", validate);
        if (validate.length) {
            return res.status(400).json({
                status: 'error',
                validation: validate,
            })
        } else {

            const classData = await MClass.findByPk(id);

            const data = {
                name: req.body.name || classData.name,
                description: req.body.description || classData.description,
                avatar: req.body.avatar || classData.avatar,
                banner: req.body.banner || classData.banner,
            }

            const updateClass = await classData.update(data);

            return res.status(200).json({
                status: 'success',
                message: "successfully update a class!",
                data: updateClass,
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

const del = async function (req, res) {

    try {

        const { id } = req.params;

        const classData = await MClass.findByPk(id);

        if (classData != null) {
            await classData.destroy();
        }

        return res.status(200).json({
            status: 'success',
            message: "successfully delete a class!",
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
    fetchAll,
    create,
    update,
    del
}