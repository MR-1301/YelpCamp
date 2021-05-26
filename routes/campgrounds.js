const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const multer = require('multer');
const {storage} = require('../config/cloudinary')
const upload = multer({storage});
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const {
  index,
  newCamp,
  newCampForm,
  editCampForm,
  showCamp,
  editCamp,
  deleteCamp
} = require('../controllers/campgrounds');

router.route('/')
  .get(catchAsync(index))
  .post(
    isLoggedIn,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(newCamp)
  );


router.get(
  "/new",
  isLoggedIn,
  newCampForm
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(editCampForm)
);

router.route('/:id')
  .get(catchAsync(showCamp))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(editCamp)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(deleteCamp)
  );


module.exports = router;
