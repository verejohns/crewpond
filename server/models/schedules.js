'use strict';
module.exports = (sequelize, DataTypes) => {
  const schedules = sequelize.define('schedules', {
    hirer_id: DataTypes.INTEGER,
    job_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  schedules.associate = function(models) {
    // associations can be defined here
    schedules.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'job'
    });

    schedules.hasMany(models['times'], {
      foreignKey: 'schedule_id',
      as: 'time_field'
    })
  };
  return schedules;
};
