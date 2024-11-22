'use strict';
module.exports = (sequelize, DataTypes) => {
  const archived_rooms = sequelize.define('archived_rooms', {
    room_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  archived_rooms.associate = function(models) {
    // associations can be defined here
    archived_rooms.belongsTo(models.chat_rooms, {
      foreignKey: 'room_id',
      as: 'room'
    });
  };
  return archived_rooms;
};