const Review = require("../models/review");
const Campground = require("../models/campground");

const newReview = async (req, res, next) => {
  const {id} = req.params;
  const cg = await Campground.findById(id);
  const rv = new Review(req.body.review);
  rv.author = req.user._id;
  cg.reviews.push(rv);
  await rv.save();
  await cg.save();
  req.flash("success", "Successfully Posted a new Review!");
  res.redirect(`/campgrounds/${id}`);
};

const deleteReview = async (req, res, next) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {
    $pull: {reviews: reviewId},
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully Deleted Review!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports = {newReview, deleteReview};