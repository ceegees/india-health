var express = require("express");
var router = express.Router();
const Sequelize = require('sequelize');
const models = require('../models');

const { Op } = Sequelize;

/* List meta data */
router.get("/list", async (req, res, next) => {
    try {
        let { category, parentId, search } = req.query;
        if (!category) {
            throw new Error('category is required.');
        }

        const where = {
            category
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
