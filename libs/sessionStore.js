var mongoose = require('mongoose');
var express = require('express');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;