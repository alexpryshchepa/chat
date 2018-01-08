var log = require('../libs/log')(module);
var config = require('../config');
var cookieParser = require('cookie-parser');
var async = require('async');
var cookie = require('cookie');
var sessionStore = require('../libs/sessionStore');
var HttpError = require('../error').HttpError;
var User = require('../models/user').User;

function loadSession(sid, callback) {
  sessionStore.load(sid, function(err, session) {
    if (arguments.length == 0) {
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });
}

function loadUser(session, callback) {

  if (!session.user) {
    log.debug("Session %s is anonymous", session.id);
    return callback(null, null);
  }

  log.debug("retrieving user ", session.user);

  User.findById(session.user, function(err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }
    log.debug("user findbyId result: " + user);
    callback(null, user);
  });

}

module.exports = function(server) {
  var io = require('socket.io')(server, {
    logger: log,
  });
  
  io.use(function(socket, callback) {
    async.waterfall([
      function(callback) {
        var handshakeData = socket.request;
        handshakeData.cookies = cookie.parse(handshakeData.headers.cookie || '');
        var sidCookie = handshakeData.cookies[config.get('session:key')];
        var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

        loadSession(sid, callback);
      },
      function(session, callback) {

        if (!session) {
          callback(new HttpError(401, "No session"));
        }

        socket.handshake.session = session;
        loadUser(session, callback);
      },
      function(user, callback) {
        if (!user) {
          callback(new HttpError(403, "Anonymous session may not connect"));
        }

        socket.handshake.user = user;
        callback(null);
      }

    ], function(err) {
      if (!err) {
        return callback(null, true);
      }

      if (err instanceof HttpError) {
        return callback(null, false);
      }

      callback(err);
    });

  });

  io.on('sessreload', function(sid) {
    // add later
  });

  io.on('connection', function(socket) {
    var username = socket.handshake.user.get('username');

    io.emit('join', username);

    socket.on('message', function(text) {
      io.emit('message', username, text);
    });

    socket.on('disconnect', function() {
      io.emit('leave', username);
    });

  });
  
  return io;
}
