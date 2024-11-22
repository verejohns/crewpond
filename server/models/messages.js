'use strict';
module.exports = (sequelize, DataTypes) => {
  const messages = sequelize.define('messages', {
    content: DataTypes.TEXT,
    room_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    media_file: DataTypes.STRING,
    media_type: DataTypes.STRING, //video, file, image, text
    type: DataTypes.STRING,
    read_users: DataTypes.ARRAY({
      type: DataTypes.STRING
    }),
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  messages.associate = function(models) {
    // associations can be defined here
    messages.belongsTo(models['users'], {
      foreignKey: 'user_id',
      as: 'user'
    });
    messages.belongsTo(models['chat_rooms'], {
      foreignKey: 'room_id',
      as: 'room'
    })
  };
  return messages;
};