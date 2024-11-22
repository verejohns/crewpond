'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscriptions = sequelize.define('subscriptions', {
    customer_id: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    subscription_id: DataTypes.STRING,
    type: DataTypes.INTEGER, //1: key hirer, 0: key jobber, 2: web portal, 3: sub user
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  subscriptions.associate = function(models) {
    // associations can be defined here
  };
  return subscriptions;
};