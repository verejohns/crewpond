'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_tokens = sequelize.define('user_tokens', {
    user_id: DataTypes.INTEGER,
    platform: DataTypes.STRING,
    token: DataTypes.STRING,
    device_token: DataTypes.STRING,
    session_token: DataTypes.STRING,
    generatedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {});
  user_tokens.associate = function(models) {
    // associations can be defined here
  };
  return user_tokens;
};
