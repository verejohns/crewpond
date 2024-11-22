const auth = require('./authController');
const admin = require('./adminController');
const user = require('./userController');
const view = require('./viewController');
const jobs = require('./jobsController');
const category = require('./categoryController');
const mail = require('./mailController');
const schedule = require('./scheduleController');
const invites = require('./invitesController');
const offer = require('./offerController');
const invoice = require('./invoiceController');
const contract = require('./contractController');
const favorite = require('./favoriteController');
const feedback = require('./feedbackController');
const notification = require('./notificationController');
const payment = require('./paymentController');
const worktime = require('./worktimeController');
const chat = require('./chatController');
const subscription = require('./subscriptionController');
const reports = require('./reportsController');

module.exports = {
    authController: auth,
    adminController: admin,
    userController: user,
    viewController: view,
    jobsController: jobs,
    categoryController: category,
    mailController: mail,
    scheduleController: schedule,
    invitesController: invites,
    offerController: offer,
    invoiceController: invoice,
    contractController: contract,
    feedbackController: feedback,
    notificationController: notification,
    paymentController: payment,
    worktimeController: worktime,
    chatController: chat,
    favoriteController: favorite,
    subscriptionController: subscription,
    reportsController: reports
};
