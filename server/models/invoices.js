'use strict';
module.exports = (sequelize, DataTypes) => {
  const invoices = sequelize.define('invoices', {
    job_id: DataTypes.INTEGER,
    contract_id: DataTypes.INTEGER,
    invoice_no: DataTypes.INTEGER,
    jobber_type: DataTypes.STRING,
    is_gst_registered: DataTypes.BOOLEAN,
    purchase_order: DataTypes.STRING,
    sender_id: DataTypes.INTEGER,
    sender_trading_name: DataTypes.STRING,
    sender_abn: DataTypes.STRING,
    sender_username: DataTypes.STRING,
    sender_email: DataTypes.STRING,
    sender_company: DataTypes.STRING,
    invoice_date: DataTypes.DATE,
    due_date: DataTypes.INTEGER,
    worktime_ids: DataTypes.ARRAY({
      type: DataTypes.INTEGER
    }),
    receiver_id: DataTypes.INTEGER,
    receiver_name: DataTypes.STRING,
    receiver_email: DataTypes.STRING,
    receiver_company: DataTypes.STRING,
    acc_number: DataTypes.STRING,
    bsb: DataTypes.STRING,
    acc_name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  invoices.associate = function(models) {
    // associations can be defined here
    invoices.belongsTo(models['contracts'], {
      foreignKey: 'contract_id',
      as: 'in_contract'
    }),
    invoices.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'in_job'
    })
  };
  return invoices;
};