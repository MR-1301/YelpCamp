const Campground=require('./models/campground');
const Review=require('./models/review');
const {campgroundSchema} = require("./schema");
const { reviewSchema } = require("./schema");
const expressError = require("./utils/expressErrors");
const catchAsync= require('./utils/catchAsync');

const isLoggedIn=(req,res,next) => {
  if (!req.isAuthenticated())
  {
    req.session.returnTo=req.originalUrl;
    req.flash('error','You Must Login in!!');
    return res.redirect('/login');
  }
  next();
}

const isAuthor = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const currInfo = await Campground.findById(id);
  if (!currInfo.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
});

// /campgrounds/:id/reviews/:reviewId
const isReviewAuthor = catchAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
});

const validateCampground = (req, res, next) => {
  console.log(req.body);
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    return next();
  }
};


const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    return next();
  }
};

module.exports={isLoggedIn,validateCampground,isAuthor,validateReview,isReviewAuthor};