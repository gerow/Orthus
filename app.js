﻿var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var httpProxy = require('http-proxy');

/** Import own JS files **/
var config = require('./config/config');
var secrets = require('./config/secrets');
var User = require('./models/User');
var authController = require('./controllers/auth');
var proxyController = require('./controllers/proxy');

/** App Setup **/
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use('/_static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());
app.use(cookieParser())
app.use(session({ key: 'orthus', secret: secrets.sessionSecret }));
app.use(passport.initialize());
app.use(passport.session());

/** Routes **/
app.post('/auth/openid', passport.authenticate('openid'));
app.get('/auth/openid/callback', authController.getOpenIDCallback);

app.get(config.loginURL, authController.getLogin);
app.get(config.logoutURL, authController.getLogout);
app.get(config.signupURL, authController.getSignup);

//Anything after this needs to be authenticated
app.use(authController.isAuthenticated);
app.use(proxyController.proxy);
app.on('upgrade', proxyController.proxyWebSocket);

/** Finally start server **/
app.listen(config.port);
console.log("Orthus listening on port: " + config.port);