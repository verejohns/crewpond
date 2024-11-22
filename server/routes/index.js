const router = require('express').Router();
const apiRoutes = require('./api');
const clientRoutes = require('./client');

apiRoutes(router);
clientRoutes(router);

module.exports = router;
