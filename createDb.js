var mongoose = require('./libs/mongoose');
var async = require('async');

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
], function(err, results) {
  console.log(arguments);
  mongoose.disconnect();
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  var db = mongoose.connection.db;
  
  db.dropDatabase(callback);
}

function requireModels(callback) {
  require('./models/user');
  
  async.each(Object.keys(mongoose.models), function(modelName, callback) {
    mongoose.models[modelName].ensureIndexes(callback)
  }, callback);
}

function createUsers(callback) {
  var users = [
    {username: 'Vasya', password: '123'},
    {username: 'Petya', password: '123'},
    {username: 'Kolya', password: '123'},
  ];
  
  async.each(users, function(userData, callback) {
    var user = new mongoose.models.User(userData);
    user.save(callback);
  }, callback);
}

function close(callback) {
  mongoose.disconnect(callback);
}
