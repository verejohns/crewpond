'use strict';
module.exports = (sequelize, DataTypes) => {
  const web_users = sequelize.define('web_users', {
    user_id: DataTypes.INTEGER,
    is_trial: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  web_users.associate = function(models) {
    // associations can be defined here

    web_users.belongsTo(models['users'], {
      foreignKey: 'user_id',
      as: 'participant'
    })
  };
  return web_users;
};