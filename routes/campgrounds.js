const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/expressErrors");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schema");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    return next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const allCampgrounds = await Campground.find({});
    res.render("./campgrounds/index", { allCampgrounds });
  })
);

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash("success", "Succesfully Created new Campground!");
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currInfo = await Campground.findById(id);
    if (!currInfo) {
      req.flash("error", "Cannot find that Campground!");
      return res.redirect("/campgrounds");
    }
    res.render("./campgrounds/edit", { currInfo });
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currCampground = await Campground.findById(id).populate("reviews");
    // console.log(currCampground);
    if (!currCampground) {
      req.flash("error", "Cannot find that Campground!");
      return res.redirect("/campgrounds");
    }
    res.render("./campgrounds/show", { currCampground });
  })
);

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Succesfully Updated Campground!");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
