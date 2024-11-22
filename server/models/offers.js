'use strict';
module.exports = (sequelize, DataTypes) => {
  const offers = sequelize.define('offers', {
    job_id: DataTypes.INTEGER,
    contract_id: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    cover_letter: DataTypes.STRING,
    jobber_id: DataTypes.INTEGER,
    hirer_id: DataTypes.INTEGER,
    is_hourly: DataTypes.BOOLEAN,
    invite_id: DataTypes.INTEGER,
    schedule_ids: DataTypes.ARRAY({
      type: DataTypes.STRING
    }),
    is_archived: DataTypes.BOOLEAN,
    due_date: DataTypes.DATE,
    status: DataTypes.INTEGER,   //1: created, 2: accepted, 3: rejected, 4: closed
    read_offer: DataTypes.BOOLEAN,
    is_job_updated: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  offers.associate = function(models) {
    // associations can be defined here
    offers.belongsTo(models.users, {
      foreignKey: 'jobber_id',
      as: 'jobber'
    });

    offers.belongsTo(models.users, {
      foreignKey: 'hirer_id',
      as: 'hirer'
    });

    offers.belongsTo(models.jobs, {
      foreignKey: 'job_id',
      as: 'job'
    });

    offers.hasMany(models.contracts, {
      foreignKey: 'offer_id',
      as: 'contract'
    })

  };
  return offers;
};
