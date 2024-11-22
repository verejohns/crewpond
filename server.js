// Dependencies
// =============================================================
const express = require("express");
const session = require("express-session");
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const compression = require('compression');
const logger = require("morgan");
const fs = require("fs");
const path = require("path");
const routes = require("./server/routes");
const middleware = require('./server/middlewares');
const dotenv = require('dotenv');
const cors = require("cors");
const cron = require('node-cron');
const cronJobs = require('./server/cron/cronJobs');

cron.schedule('0 * * * *', cronJobs.alertJobIn24hours);
dotenv.config();

const PORT = process.env.PORT || 3000;
// Setup Express App
// =============================================================
const app = express();
const http = require('http').Server(app);

// Add Database
// =============================================================
const db = require("./server/models");

// Setup view engine
// ==============================================================
app.set('port', PORT);
app.set('view engine', 'pug');
app.set('views', './client/pug');

// Middleware
// ==============================================================

// Use Morgan to log requests
let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {"flags": "a"});

//  Set Morgan to output to access.log file and to console
app.use(logger("common", {"stream": accessLogStream}));
app.use(logger("dev"));

// Use bodyParser middleware to parse strings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use express-validator to check data before entering DB
// Add options inside an array as a parameter if wanted
app.use(expressValidator());

// To Read Cookies
app.use(cookieParser());

// Use Sessions for tracking login
// Set Cookie To True If Using HTTPS - For Dev You Can Comment Out.
// Save Uninitialized Saves A Cookie On User's Device
app.use(session({
  secret: 'crew pond',
  resave: false,
  saveUninitialized: false,
  cookie: {secure:false},
}));

// enable localhost access on staging server
// =============================================================
if (process.env.NODE_ENV !== "production") {
  app.use(cors({credentials: true, origin: true}));
}
// Add Routes
// =============================================================
app.use(compression());
app.use('/static', express.static('./static'));

app.use(middleware.requestDetails);
app.use(middleware.authentication);

app.use('/', routes);

// Start Express
// =============================================================
// Syncing DB & Start Express (!!!Force Must Be Set To False Or It Will Overwrite Data!!!)
// =============================================================
db.sequelize.sync({ force: false }).then(function() {
  http.listen(PORT, function() {
    console.log(`🌎 ==> Server now on port ${PORT}!`);
  });
}).catch(err => console.error(err));
