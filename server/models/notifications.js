'use strict';
module.exports = (sequelize, DataTypes) => {
  const notifications = sequelize.define('notifications', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    sender_id: DataTypes.INTEGER,
    type: DataTypes.INTEGER, 
    /**
     * 1: AppUpdated
       2: SystemMessage
       3: AccountCreated
       4: ProfileUpdated
       5: JobPosted
       6: JobUpdated
       7: InvitedToJob
       8: InviteDeclined
       9: OfferSent
       10: OfferReceived
       11: OfferUpdated
       12: ContractStarted
       13: ContractClosed
       14: ContractUpdated
       15: FeedbackSent
       16: FeedbackReceived
       17: FeedbackUpdated
       18: ChatStarted
       19: ChatRenamed
       20: UserAddedToChat
       21: UserLeftFromChat
       22: AssignedScheudle
       23: UnassignedSchedule
       24: InvoiceCreated
       25: JobClosed,
       26: OfferDeleted
       27: OfferDeclined
     */
    
    is_broadcast: DataTypes.BOOLEAN, //true: broadcast all, false: send to receivers,

    job_id: DataTypes.INTEGER,
    invite_id: DataTypes.INTEGER,
    offer_id: DataTypes.INTEGER,
    contract_id: DataTypes.INTEGER,
    feedback_id: DataTypes.INTEGER,
    chat_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    invoice_id: DataTypes.INTEGER,

    receiver_id: DataTypes.INTEGER,
    is_read: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});
  notifications.associate = function(models) {
    // associations can be defined here
    notifications.belongsTo(models['users'], {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    notifications.belongsTo(models['jobs'], {
      foreignKey: 'job_id',
      as: 'job'
    });

    notifications.belongsTo(models['users'], {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  };
  return notifications;
};
/**
 * "Type
{
     AppUpdated
     SystemMessage
     AccountCreated
     ProfileUpdated
     JobPosted
     JobUpdated
     InvitedToJob
     InviteDeclined
     OfferSent
     OfferReceived
     OfferUpdated
     ContractStarted
     ContractClosed
     ContractUpdated
     FeedbackSent
     FeedbackReceived
     FeedbackUpdated
     ChatStarted
     ChatRenamed
     UserAddedToChat
     UserLeftFromChat
}"
 */
