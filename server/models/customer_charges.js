'use strict';
module.exports = (sequelize, DataTypes) => {
  const customer_charges = sequelize.define('customer_charges', {
    user_id: DataTypes.INTEGER,
    job_id: DataTypes.INTEGER,
    charge_type:DataTypes.STRING,
    charge_id: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  customer_charges.associate = function(models) {
    // associations can be defined here
    customer_charges.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'job'
    });

    customer_charges.belongsTo(models['users'], {
      foreignKey: 'user_id',
      as: 'user'
    });
  };
  return customer_charges;
};
