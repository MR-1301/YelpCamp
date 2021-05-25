const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");

const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const allCampgrounds = await Campground.find({});
    res.render("./campgrounds/index", {allCampgrounds});
  })
);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "Successfully Created new Campground!");
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id/edit",
  isLoggedIn, isAuthor,
  catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const currInfo = await Campground.findById(id);
    if (!currInfo) {
      req.flash("error", "Cannot find that Campground!");
      return res.redirect("/campgrounds");
    }
    
    res.render("./campgrounds/edit", {currInfo});
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const currCampground = await Campground.findById(id).populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    }).populate("author");
    // console.log(currCampground);
    if (!currCampground) {
      req.flash("error", "Cannot find that Campground!");
      return res.redirect("/campgrounds");
    }
    res.render("./campgrounds/show", {currCampground});
  })
);

router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully Updated Campground!");
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully Deleted the Campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
