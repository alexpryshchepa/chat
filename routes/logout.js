exports.post = function(req, res) {
  var sid = req.session.id;
  
  var io = req.app.get('io');
  req.session.destroy(function(err) {
    io.sockets._events.sessreload(sid);
    if (err) console.log(err);
    
    res.clearCookie('sid', {path: '/'}).status(200).redirect('/');
  });
};