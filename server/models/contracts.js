'use strict';
module.exports = (sequelize, DataTypes) => {
  const contracts = sequelize.define('contracts', {
    job_id: DataTypes.INTEGER,
    hirer_id: DataTypes.INTEGER,
    jobber_id: DataTypes.INTEGER,
    schedule_ids: DataTypes.ARRAY({
        type: DataTypes.STRING
    }),
    offer_id: DataTypes.INTEGER,
    archive_hirer: DataTypes.BOOLEAN,
    archive_jobber: DataTypes.BOOLEAN,
    read_hirer: DataTypes.BOOLEAN,
    read_jobber: DataTypes.BOOLEAN,
    invoice_date: DataTypes.DATE,
    paid: DataTypes.FLOAT,
    price: DataTypes.FLOAT,
    is_hourly: DataTypes.BOOLEAN,
    due_date: DataTypes.DATE,
    read_closed: DataTypes.BOOLEAN,
    closed_by: DataTypes.INTEGER,
    closed_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  contracts.associate = function(models) {
    // associations can be defined here
    contracts.hasMany(models.feedbacks, {
      foreignKey: 'contract_id',
      as: 'feedbacks'
    });
    contracts.belongsTo(models.jobs, {
      foreignKey: 'job_id',
      as: 'job'
    });
    contracts.belongsTo(models.offers, {
      foreignKey: 'offer_id',
      as: 'offer'
    });
    contracts.belongsTo(models.users, {
      foreignKey: 'hirer_id',
      as: 'hirer'
    });
    contracts.belongsTo(models.users, {
      foreignKey: 'jobber_id',
      as: 'jobber'
    });
  };
  return contracts;
};
