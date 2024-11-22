'use strict';
module.exports = (sequelize, DataTypes) => {
  const categories = sequelize.define('categories', {
    deep: DataTypes.INTEGER,
    main: DataTypes.STRING,
    sub: DataTypes.ARRAY({
      type: DataTypes.STRING
    }),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  categories.associate = function(models) {
    // associations can be defined here
  };
  return categories;
};
