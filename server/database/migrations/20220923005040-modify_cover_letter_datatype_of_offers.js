'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('offers', 'cover_letter', {
              type: Sequelize.TEXT,
              allowNull: true,
          })
      ])
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.changeColumn('offers', 'cover_letter', {
              type: Sequelize.STRING,
              allowNull: true,
          })
      ])
  }
};
