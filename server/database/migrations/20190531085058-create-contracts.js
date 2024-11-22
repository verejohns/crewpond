'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('contracts', {
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
      hirer_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      jobber_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      schedule_ids: {
        type: Sequelize.ARRAY({
          type: Sequelize.STRING
        })
      },
      offer_id: {
        type: Sequelize.INTEGER
      },
      archive_hirer: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      archive_jobber: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      read_hirer: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      read_jobber: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      invoice_date: {
        type: Sequelize.DATE
      },
      paid: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT
      },
      price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT
      },
      is_hourly: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      due_date: {
        type: Sequelize.DATE
      },
      read_closed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      closed_by: {
        type: Sequelize.INTEGER
      },
      closed_at: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('contracts');
  }
};
