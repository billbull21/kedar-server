const Validator = require('fastest-validator');
const {
    TClassUsers, sequelize
} = require('../models/');
const { QueryTypes } = require('sequelize/');
const v = new Validator();

const fetchAll = async function (req, res) {

    try {

        const data = await sequelize.query(`
            SELECT tcu.*, mc.name as class_name, mc.description as class_description, mc.avatar as class_avatar, mc.user_id as class_owner, mu.name as class_owner_name, mu.avatar as class_owner_avatar FROM t_class_users tcu
            INNER JOIN m_class mc ON mc.id = tcu.class_id
            INNER JOIN m_users mu ON mu.id = tcu.user_id
            WHERE tcu.user_id = ${req.user.data.id}
        `, {type: QueryTypes.SELECT});

        const result = data.map((x) => {
            if (x.class_avatar)
                x.class_avatar = req.protocol+'://'+`${req.get('host')}`+x.class_avatar
            if (x.class_owner_avatar)
                x.class_owner_avatar = req.protocol+'://'+`${req.get('host')}`+x.class_owner_avatar
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


const create = async function (req, res) {

    try {

        const schema = {
            class_id: 'any',
        }

        const validate = v.validate(req.body, schema);

        console.log("VALIDATE : ", validate);
        if (validate.length) {
            return res.status(400).json({
                status: 'error',
                validation: validate,
            })
        } else {

            const model = await TClassUsers.findOne({
                where: {
                    class_id: req.body.class_id,
                    user_id: req.user.data.id
                }
            })

            console.log("RESULT :: ", model);

            if (!model) {
                const data = {
                    class_id: req.body.class_id,
                    user_id: req.user.data.id,
                }
    
                const createClass = await TClassUsers.create(data);
    
                return res.status(200).json({
                    status: 'success',
                    message: "successfully join to a new class!",
                })   
            }

            return res.status(200).json({
                status: 'success',
                message: "you were already join!",
            })   


        }
    } catch (e) {
        console.log("ERROR MSG : ", e);
        if (e && e.parent && e.parent.code == 23503) {
            return res.status(400).json({
                status: 'error',
                message: 'class was not found!',
            })
        }
        return res.status(500).json({
            status: 'error',
            message: 'internal server error!',
        })
    }
}

const del = async function (req, res) {

    try {

        const { id } = req.params;

        const classData = await TClassUsers.findByPk(id);

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
    del
}