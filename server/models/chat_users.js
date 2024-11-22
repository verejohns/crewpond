'use strict';
module.exports = (sequelize, DataTypes) => {
  const chat_users = sequelize.define('chat_users', {
    room_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  chat_users.associate = function(models) {
    // associations can be defined here

    chat_users.belongsTo(models['users'], {
      foreignKey: 'user_id',
      as: 'participant'
    })
  };
  return chat_users;
};