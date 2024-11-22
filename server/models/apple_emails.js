'use strict';
module.exports = (sequelize, DataTypes) => {
  const apple_emails = sequelize.define('apple_emails', {
    user_id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    confirmation_code: DataTypes.STRING,
    salt: DataTypes.STRING,
    confirmed_at: DataTypes.DATE,
    identity_token: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  apple_emails.associate = function(models) {
    // associations can be defined here
  };
  return apple_emails;
};