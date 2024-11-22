'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      job_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      contract_id: {
        type: Sequelize.INTEGER
      },
      price: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      cover_letter: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jobber_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      hirer_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER
      },
      is_hourly: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      invite_id: {
        type: Sequelize.INTEGER
      },
      is_archived: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      due_date: {
        type: Sequelize.DATE
      },
      schedule_ids: {
        type: Sequelize.ARRAY({
          type: Sequelize.STRING
        })
      },
      read_offer: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_job_updated: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      deleted_at: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('offers');
  }
};
