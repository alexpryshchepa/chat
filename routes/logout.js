exports.post = function(req, res) {
  req.session.destroy(function(err) {
    if (err) console.log(err);
    
    res.clearCookie('sid', {path: '/'}).status(200).redirect('/');
  });
};