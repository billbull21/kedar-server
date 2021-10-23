const Validator = require('fastest-validator');
const { QueryTypes } = require('sequelize/');
const v = new Validator();
const fs = require('fs');
const {TClassActivity, sequelize} = require('../models/');

const fetchAll = async function (req, res) {

    try {

        const data = await sequelize.query(`
            SELECT tca.*, tcu.class_id, tcu.user_id, mc.name as class_name, mc.avatar as class_avatar, CASE WHEN mc.user_id=${req.user.data.id} THEN true ELSE false END as class_owner, mu.name as user_name 
            FROM t_class_activity tca
            INNER JOIN t_class_users tcu ON tcu.id = tca.class_users_id
            INNER JOIN m_class mc ON mc.id = tcu.class_id
            INNER JOIN m_users mu ON mu.id = tcu.user_id
            WHERE tca.class_users_id = '${req.params.id}'
        `, {type: QueryTypes.SELECT});

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
            class_users_id: 'any',
        }

        const validate = v.validate(req.body, schema);

        console.log("VALIDATE : ", validate);
        if (validate.length) {
            return res.status(400).json({
                status: 'error',
                validation: validate,
            })
        } else {

            var filePath = "";

            if (req.body.attachment && req.body.filename) {
                const file = Buffer.from(req.body.attachment, 'base64');

                const folderPath = `/upload/class-activity/${req.body.class_users_id}`
                filePath = `${folderPath}/kedar-${new Date().getTime()}-${req.body.filename}`

                fs.mkdirSync('public'+folderPath, { recursive: true })
                fs.writeFileSync('public'+filePath, file,  
                    function() 
                    {
                        console.log('DEBUG - feed:message: Saved to disk image attached by user:', 'public/temporary/file.csv');
                    },
                );
            }

            const data = {
                class_users_id: req.body.class_users_id,
                message: req.body.message,
                attachment: filePath,
            }

            const fetchResult = await TClassActivity.create(data);

            fetchResult.attachment = req.protocol+'://'+req.hostname+fetchResult.attachment

            return res.status(200).json({
                status: 'success',
                message: "successfully insert activity!",
                data: fetchResult
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