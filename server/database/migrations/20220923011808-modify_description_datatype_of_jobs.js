'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('jobs', 'description', {
              type: Sequelize.TEXT,
              allowNull: true,
          })
      ])
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('jobs', 'description', {
              type: Sequelize.STRING,
              allowNull: true,
          })
      ])
  }
};
