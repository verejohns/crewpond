'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('messages', 'content', {
              type: Sequelize.TEXT,
              allowNull: true,
          })
      ])
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('messages', 'content', {
              type: Sequelize.STRING,
              allowNull: true,
          })
      ])
  }
};
