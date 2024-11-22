'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      avatar: {
        type: Sequelize.STRING
      },
      salt: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      password_reset_token: {
        type: Sequelize.STRING
      },
      password_reset_sent_at: {
        type: Sequelize.DATE
      },
      confirmation_token: {
        type: Sequelize.STRING
      },
      confirmation_sent_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      confirmed_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      availability: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      birthday: {
        type: Sequelize.DATE
      },
      categories: {
        type: Sequelize.ARRAY({
          type: Sequelize.JSONB
        })
      },
      company: {
        type: Sequelize.STRING
      },
      abn: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      experience_from: {
        allowNull: true,
        type: Sequelize.DATE
      },
      is_closed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_hided: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_suspended: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_key_hirer: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      is_key_jobber: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      jobber_type: {
        type: Sequelize.STRING
      },
      last_invoice_num: {
        type: Sequelize.INTEGER
      },
      latitude: {
        type: Sequelize.DOUBLE
      },
      longitude: {
        type: Sequelize.DOUBLE
      },
      address: {
        type: Sequelize.STRING
      },
      place_name: {
        type: Sequelize.STRING
      },
      last_login_time: {
        type: Sequelize.DATE
      },
      login_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      trial_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sub_accounts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      hourly_price: {
        type: Sequelize.DOUBLE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
