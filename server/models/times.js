'use strict';
module.exports = (sequelize, DataTypes) => {
  const times = sequelize.define('times', {
    schedule_id: DataTypes.INTEGER,
    from: DataTypes.DATE,
    to: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  times.associate = function(models) {
    // associations can be defined here
    times.belongsTo(models['schedules'], {
      foreignKey: 'schedule_id',
      as: 'schedule'
    })
  };
  return times;
};