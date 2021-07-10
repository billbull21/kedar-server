const Validator = require('fastest-validator');
const {
    MClass
} = require('../models/');
const {
    Op
} = require("sequelize");
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
                user_id: req.user.data.id
            }

            const createClass = await MClass.create(data);

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


module.exports = {
    fetchAll,
    create
}