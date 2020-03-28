var express = require("express");
var router = express.Router();
const Sequelize = require('sequelize');
const models = require('../models');

const { Op } = Sequelize;

/* List meta data */
router.get("/list", async (req, res, next) => {
    try {
        let { type, parentId, search } = req.query;
        if (!type) {
            throw new Error('type is required.');
        }

        const where = {
            type
        };

        if (parentId != undefined) {
            where.parent_id = parentId;
        }

        if (search) {
            where.name = {
                [Op.iLike]: `%${search}%`
            }
        };

        const data = await models.MetaData.findAndCountAll({
            where
        });

        res.json({
            success: true,
            data
        });
    } catch (err) {
        return res.json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
