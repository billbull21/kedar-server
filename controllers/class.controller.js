const Validator = require('fastest-validator');
const {
    MClass,
    TClassUsers
} = require('../models/');
const { v4: uuidv4 } = require('uuid');
const v = new Validator();
const fs = require('fs');

const fetchAll = async function (req, res) {

    try {
        const data = await MClass.findAll({
            where: {
                user_id: req.user.data.id
            }
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

            var filePath = "";

            if (req.body.avatar) {
                const file = Buffer.from(req.body.avatar, 'base64');

                const folderPath = `/upload/class-avatar`
                filePath = `${folderPath}/${classData.id}.png`

                fs.mkdirSync('public'+folderPath, { recursive: true })
                fs.writeFileSync('public'+filePath, file,  
                    function() 
                    {
                        console.log('DEBUG - feed:message: Saved to disk image attached by user:', 'public/temporary/file.csv');
                    },
                );
            }

            const data = {
                name: req.body.name,
                description: req.body.description,
                user_id: req.user.data.id,
                avatar: filePath,
            }

            const createClass = await MClass.create(data);
            const join = await TClassUsers.create({
                id: uuidv4(),
                class_id: createClass.id,
                user_id: req.user.data.id
            });

            if (createClass.avatar)
                createClass.avatar = req.protocol+'://'+`${req.get('host')}`+createClass.avatar

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

            if (classData) {
                var filePath = "";

                if (req.body.avatar) {
                    const file = Buffer.from(req.body.avatar, 'base64');

                    const folderPath = `/upload/class-avatar`
                    filePath = `${folderPath}/${classData.id}.png`

                    fs.mkdirSync('public'+folderPath, { recursive: true })
                    fs.writeFileSync('public'+filePath, file,  
                        function() 
                        {
                            console.log('DEBUG - feed:message: Saved to disk image attached by user:', 'public/temporary/file.csv');
                        },
                    );
                }

                const data = {
                    name: req.body.name || classData.name,
                    description: req.body.description || classData.description,
                    avatar: filePath || classData.avatar,
                }
    
                const updateClass = await classData.update(data);

                updateClass.avatar = req.protocol+'://'+`${req.get('host')}`+updateClass.avatar
    
                return res.status(200).json({
                    status: 'success',
                    message: "successfully update a class!",
                    data: updateClass,
                })
            } else {
                return res.status(400).json({
                    status: 'failed',
                    message: "class was not found!",
                })
            }
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