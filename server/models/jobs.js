'use strict';
module.exports = (sequelize, DataTypes) => {
  const jobs = sequelize.define('jobs', {
    owner_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    price: DataTypes.FLOAT,
    avatar: DataTypes.STRING,
    latitude: DataTypes.FLOAT(11),
    longitude: DataTypes.FLOAT(11),
    address: DataTypes.STRING,
    place_name: DataTypes.STRING,
    is_assigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_cancelled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_hourly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_urgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_hided: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    has_updates: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    due_date: DataTypes.DATE,
    description: DataTypes.STRING,
    deleted_at: DataTypes.DATE,
    category: DataTypes.ARRAY({
      type: DataTypes.JSONB
    }),
    closed_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  jobs.associate = function(models) {
    // associations can be defined here
    jobs.belongsTo(models.users, {
      foreignKey: 'owner_id',
      as: 'user'
    });

    jobs.hasMany(models.schedules, {
      foreignKey: 'job_id',
      as: 'schedules'
    });

    jobs.hasMany(models.offers, {
      foreignKey: 'job_id',
      as: 'offers'
    });

    jobs.hasMany(models.contracts, {
      foreignKey: 'job_id',
      as: 'contracts'
    });

    jobs.hasMany(models.invites, {
      foreignKey: 'job_id',
      as: 'invites'
    });
  };
  return jobs;
};
