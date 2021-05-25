const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const Campground = require("../models/campground");
const expressError = require("../utils/expressErrors");
const catchAsync = require("../utils/catchAsync");
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const cg = await Campground.findById(id);
    const rv = new Review(req.body.review);
    rv.author=req.user._id;
    cg.reviews.push(rv);
    await rv.save();
    await cg.save();
    req.flash("success", "Successfully Posted a new Review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const delRev = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    console.log(delRev);
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully Deleted Review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
