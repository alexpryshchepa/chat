var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app) {
  app.get('/', function (req, res, next) {
    res.render('index');
  });

  app.get('/users', function (req, res, next) {
    User.find({}, function (err, users) {
     if (err) throw next(err);
     return res.json(users);
    });
  });

  app.get('/users/:id', function (req, res, next) {
    try {
      var id = new ObjectID(req.params.id);
    } catch (e) {
      next(404);
      return;
    }
      
    User.findById(id, function (err, user) {
      if (err) throw next(err);
      if (!user) {
        next(new HttpError(404, 'User not found'));
        return;
      }
      return res.json(user);
    });
  });
}
