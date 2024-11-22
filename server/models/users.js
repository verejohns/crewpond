'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING,
    salt: DataTypes.STRING,
    password: DataTypes.STRING,
    password_reset_token: DataTypes.STRING,
    password_reset_sent_at: DataTypes.DATE,
    confirmation_token: DataTypes.STRING,
    confirmation_sent_at: DataTypes.DATE,
    confirmed_at: DataTypes.DATE,
    availability:DataTypes.BOOLEAN,
    birthday: DataTypes.DATE,
    categories: DataTypes.ARRAY({
      type: DataTypes.JSONB
    }),
    company: DataTypes.STRING,
    abn: DataTypes.STRING,
    description: DataTypes.TEXT,
    experience_from: DataTypes.DATE,
    experience_years: DataTypes.INTEGER,
    experience_months: DataTypes.INTEGER,
    is_closed: DataTypes.BOOLEAN,
    is_hided: DataTypes.BOOLEAN,
    is_suspended: DataTypes.BOOLEAN,
    is_key_hirer: DataTypes.BOOLEAN,
    is_key_jobber: DataTypes.BOOLEAN,
    jobber_type: DataTypes.STRING,
    last_invoice_num: DataTypes.INTEGER,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    address: DataTypes.STRING,
    place_name: DataTypes.STRING,
    last_login_time: DataTypes.DATE,
    login_count: DataTypes.INTEGER,
    trial_period: DataTypes.INTEGER,
    sub_accounts: DataTypes.INTEGER,//0: subuser, 1: main user
    hourly_price: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  users.associate = function(models) {
    // associations can be defined here
    users.hasOne(models.st_customers, {
      foreignKey: 'user_id',
      as: 'stripe_customer'
    });
    users.hasMany(models.jobs, {
      foreignKey: 'owner_id',
      as: 'jobs_list'
    });

    users.hasMany(models.offers, {
      foreignKey: 'jobber_id',
      as: 'jobber'
    });

    users.hasMany(models.offers, {
      foreignKey: 'hirer_id',
      as: 'hirer'
    });

    users.hasMany(models.contracts, {
      foreignKey: 'jobber_id',
      as: 'jobber_contracts'
    });

    users.hasMany(models.contracts, {
      foreignKey: 'hirer_id',
      as: 'hirer_contracts'
    });

    users.hasMany(models.favorites, {
      foreignKey: 'to_user_id',
      as: 'favorites'
    });

    users.hasMany(models.messages, {
      foreignKey: 'user_id',
      as: 'user_messages'
    });

    users.hasMany(models.feedbacks, {
      foreignKey: 'from_user_id',
      as: 'from_feedbacks'
    });

    users.hasMany(models.feedbacks, {
      foreignKey: 'to_user_id',
      as: 'to_feedbacks'
    });
  };
  return users;
};
