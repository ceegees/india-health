'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Hospitals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      district_id: {
        type: Sequelize.INTEGER
      },
      state_id: {
        type: Sequelize.INTEGER
      },
      country_id: {
        type: Sequelize.INTEGER
      },
      lat: {
        type: Sequelize.STRING
      },
      lng: {
        type: Sequelize.STRING
      },
      bed_capacity: {
        type: Sequelize.BIGINT
      },
      icu_capacity: {
        type: Sequelize.BIGINT
      },
      phone_number: {
        type: Sequelize.STRING
      },
      pincode: {
        type: Sequelize.STRING
      },
      json: {
        type: Sequelize.JSONB
      },
      source_url: {
        type: Sequelize.STRING
      },
      source_row_uq_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Hospitals');
  }
};