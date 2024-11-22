'use strict';
module.exports = (sequelize, DataTypes) => {
  const breaktimes = sequelize.define('breaktimes', {
    user_id: DataTypes.INTEGER,
    worktime_id: DataTypes.INTEGER,
    from: DataTypes.DATE,
    to: DataTypes.DATE,
    type: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  breaktimes.associate = function(models) {
    // associations can be defined here
    breaktimes.belongsTo(models.users, {
      foreignKey: 'worktime_id',
      as: 'worktime'
    });
  };
  return breaktimes;
};