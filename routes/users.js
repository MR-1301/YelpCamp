const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/expressErrors");
const User = require("../models/user");
const passport = require('passport');
const isLoggedIn=require('../middleware');

router.get("/register", (req, res) => {
  res.render("./Users/register");
});

router.post("/register", catchAsync(async (req, res,next) => {
  try {
    const {username, email, password} = req.body;
    const newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err) => {
      if (err)
        return next(err);
    })
    req.flash('success', 'Successfully Registered');
    res.redirect('/campgrounds');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
}));

router.get('/login', (req, res) => {
  res.render('./Users/login');
});

router.post('/login', passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/login'
}), catchAsync((req, res) => {
  req.flash('success', 'Welcome Back!')
  const redirectUrl=req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}));

router.get('/logout',(req, res) =>{
  req.logout();
  req.flash('success','Tata!')
  res.redirect('/campgrounds');
});
module.exports = router;