'use strict';
module.exports = (sequelize, DataTypes) => {
  const favorites = sequelize.define('favorites', {
    from_user_id: DataTypes.INTEGER,
    to_user_id: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  favorites.associate = function(models) {
    // associations can be defined here
    favorites.belongsTo(models.users, {
      foreignKey: 'to_user_id'
    });
  };
  return favorites;
};