'use strict';
module.exports = (sequelize, DataTypes) => {
  const invites = sequelize.define('invites', {
    job_id: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.INTEGER,
    accepted_date: DataTypes.DATE,
    status: DataTypes.INTEGER,  //1:sent,2:accepted,3:cancelled,4:declined
    schedule_ids: DataTypes.ARRAY({
      type: DataTypes.STRING
    }),
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  invites.associate = function(models) {
    // associations can be defined here
    invites.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'job'
    });
    invites.belongsTo(models['users'], {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    invites.belongsTo(models['users'], {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  };
  return invites;
};
