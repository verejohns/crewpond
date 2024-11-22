'use strict';
module.exports = (sequelize, DataTypes) => {
  const st_customers = sequelize.define('st_customers', {
    user_id: DataTypes.INTEGER,
    stripe_id: DataTypes.STRING,
    account_id: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  st_customers.associate = function(models) {
    // associations can be defined here
  };
  return st_customers;
};