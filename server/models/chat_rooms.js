'use strict';
module.exports = (sequelize, DataTypes) => {
  const chat_rooms = sequelize.define('chat_rooms', {
    chat_type: DataTypes.STRING,  //direct, group, job
    level: DataTypes.STRING,      //admin, user
    job_id: DataTypes.INTEGER,
    last_message: DataTypes.INTEGER,
    title: DataTypes.STRING,
    user_ids: DataTypes.ARRAY({
      type: DataTypes.STRING
    }),
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  chat_rooms.associate = function(models) {
    // associations can be defined here
    chat_rooms.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'job'
    });

    chat_rooms.hasMany(models['messages'], {
      foreignKey: 'room_id',
      as: 'chat_messages'
    });

    chat_rooms.hasMany(models['archived_rooms'], {
      foreignKey: 'room_id',
      as: 'archived_rooms'
    });

  };
  return chat_rooms;
};