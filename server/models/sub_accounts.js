'use strict';
module.exports = (sequelize, DataTypes) => {
  const sub_accounts = sequelize.define('sub_accounts', {
    main_user_id: DataTypes.INTEGER,
    sub_user_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  sub_accounts.associate = function(models) {
    // associations can be defined here
    sub_accounts.belongsTo(models['users'], {
      foreignKey: 'sub_user_id',
      as: 'sub_user'
    });

    sub_accounts.belongsTo(models['users'], {
      foreignKey: 'main_user_id',
      as: 'main_user'
    });
  };
  return sub_accounts;
};