const express = require('express'),
    passport = require('passport'),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn(),
    router = express.Router();

/* GET user profile. */
router.get('/', ensureLoggedIn, (req, res, next) => {
  res.render('user', {
    user: req.user
  });
});

module.exports = router;
