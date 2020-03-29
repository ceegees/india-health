"use strict";
const csv = require('csv-parser');
const fs = require('fs');

module.exports = (sequelize, DataTypes) => {
	const MetaData = sequelize.define(
		"MetaData",
		{
			name: DataTypes.STRING,
			type: DataTypes.STRING,
			category: DataTypes.STRING,
			code: DataTypes.STRING,
			unique_id: DataTypes.STRING,
			parent_id: DataTypes.BIGINT,
			group: DataTypes.STRING,
			json: DataTypes.JSONB,
			status: DataTypes.STRING
		},
		{
			tableName: "meta_data"
		}
	);
	MetaData.associate = function(models) {
		// associations can be defined here
	};
	return MetaData;
};
