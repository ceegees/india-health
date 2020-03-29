"use strict";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("meta_data", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			name: {
				type: Sequelize.STRING
			},
			type: {
				type: Sequelize.STRING,
				defaultValue: "META_DATA"
			},
			category: {
				type: Sequelize.STRING
			},
			code: {
				type: Sequelize.STRING
			},
			unique_id: {
				type: Sequelize.STRING
			},
			parent_id: {
				defaultValue: 0,
				type: Sequelize.BIGINT
			},
			group: {
				type: Sequelize.STRING
			},
			json: {
				type: Sequelize.JSONB
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: "ACTIVE"
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}).then(() =>  queryInterface.addIndex('meta_data',['parent_id'])
		).then(() =>  queryInterface.addIndex('meta_data',['type']) 
		).then(() =>  queryInterface.addIndex('meta_data',['code']) 
		).then(() =>  queryInterface.addIndex('meta_data',['category']) 
		).then(() =>  queryInterface.addIndex('meta_data',['unique_id']) 
		).then(() =>  queryInterface.addIndex('meta_data',['status']));
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable("MetaData");
	}
};
