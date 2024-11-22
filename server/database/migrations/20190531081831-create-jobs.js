'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner_id: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      latitude: {
        type: Sequelize.FLOAT(11)
      },
      longitude: {
        type: Sequelize.FLOAT(11)
      },
      address: {
        type: Sequelize.STRING
      },
      place_name:{
        type: Sequelize.STRING
      },
      is_assigned: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_cancelled: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_closed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_completed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_hourly: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_public: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_urgent: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_hided: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      has_updates: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      due_date: {
        type: Sequelize.DATE
      },
      description: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.ARRAY({
          type: Sequelize.JSONB
        })
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      avatar: {
        type: Sequelize.STRING
      },
      closed_at: {
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
    return queryInterface.dropTable('jobs');
  }
};