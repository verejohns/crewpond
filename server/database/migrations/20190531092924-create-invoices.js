'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sender_id: {
        type: Sequelize.INTEGER
      },
      contract_id: {
        type: Sequelize.INTEGER
      },
      jobber_type: {
        type: Sequelize.STRING
      },
      sender_abn: {
        type: Sequelize.STRING
      },
      due_date: {
        type: Sequelize.DATE
      },
      sender_company: {
        type: Sequelize.STRING
      },
      sender_trading_name: {
        type: Sequelize.STRING
      },
      sender_email: {
        type: Sequelize.STRING
      },
      sender_username: {
        type: Sequelize.STRING
      },
      is_gst_registered: {
        type: Sequelize.BOOLEAN
      },
      purchase_order: {
        type: Sequelize.STRING
      },
      job_id: {
        type: Sequelize.INTEGER
      },
      invoice_no: {
        type: Sequelize.INTEGER
      },
      purchase_order: {
        type: Sequelize.STRING
      },
      receiver_company: {
        type: Sequelize.STRING
      },
      receiver_email: {
        type: Sequelize.STRING
      },
      receiver_id: {
        type: Sequelize.INTEGER
      },
      receiver_name: {
        type: Sequelize.STRING
      },
      worktime_ids: {
        type: Sequelize.ARRAY({
          type: Sequelize.STRING
        })
      },
      acc_number: {
        type: Sequelize.STRING
      },
      bsb: {
        type: Sequelize.STRING
      },
      acc_name: {
        type: Sequelize.STRING
      },
      invoice_date: {
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
    return queryInterface.dropTable('invoices');
  }
};