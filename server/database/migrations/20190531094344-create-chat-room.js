'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('chat_rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chat_type: {
        type: Sequelize.STRING
      },
      level: {
        type: Sequelize.STRING
      },
      job_id: {
        type: Sequelize.INTEGER
      },
      last_message: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      user_ids: {
        type: Sequelize.ARRAY({
          type: Sequelize.STRING
        })
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
    return queryInterface.dropTable('chat_rooms');
  }
};