'use strict';
module.exports = (sequelize, DataTypes) => {
  const feedbacks = sequelize.define('feedbacks', {
    contract_id: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    failure_reason: DataTypes.STRING,
    from_user_id: DataTypes.INTEGER,
    to_user_id: DataTypes.INTEGER,
    is_from_hirer: DataTypes.BOOLEAN,
    read_feedback: DataTypes.BOOLEAN,//0: unread, 1: hirer read, 2: jobber read, 3: both read
    is_private: DataTypes.BOOLEAN,
    job_id: DataTypes.INTEGER,
    score: DataTypes.FLOAT,
    success: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  feedbacks.associate = function(models) {
    // associations can be defined here
    feedbacks.belongsTo(models.users, {
      foreignKey: 'from_user_id',
      as: 'from_user'
    });
    feedbacks.belongsTo(models.users, {
      foreignKey: 'to_user_id',
      as: 'to_user'
    });
  };
  return feedbacks;
};