const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/expressErrors");
const Users=require('../models/user');

router.get('/register',(req,res) => {
	res.render('./Users/register');
})
module.exports=router;