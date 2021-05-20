const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
const expressError = require("../utils/expressErrors");
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schema");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    return next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const cg = await Campground.findById(id);
    const rv = new Review(req.body.review);
    cg.reviews.push(rv);

    await rv.save();
    await cg.save();
    req.flash("success", "Succesfully Posted a new Review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const delRev = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    console.log(delRev);
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Succesfully Deleted Review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
