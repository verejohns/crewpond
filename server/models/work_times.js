'use strict';
module.exports = (sequelize, DataTypes) => {
  const work_times = sequelize.define('work_times', {
    jobber_id: DataTypes.INTEGER,
    contract_id: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    is_sent: DataTypes.BOOLEAN,
    schedule_id: DataTypes.INTEGER,
    from: DataTypes.DATE,
    to: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  work_times.associate = function(models) {
    // associations can be defined here
    work_times.hasMany(models.breaktimes, {
      foreignKey: 'worktime_id',
      as: 'break_times'
    });

    work_times.belongsTo(models['schedules'], {
      foreignKey: 'schedule_id',
      as: 'schedule'
    });
  };
  return work_times;
};