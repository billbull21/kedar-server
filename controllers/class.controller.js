const Validator = require('fastest-validator');
const {
    MClass
} = require('../models/');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const v = new Validator();

const {
    JWT_SECRET,
} = process.env;

const fetchAll = async function (req, res) {

    try {
        return res.status(200).json({
            status: 'success',
            message: "anda berhasil login, silahkan cek email anda untuk melakukan proses verifikasi!",
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
    fetchAll
}