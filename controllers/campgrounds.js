const Campground = require("../models/campground");
const {cloudinary} = require('../config/cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({accessToken: mapBoxToken});

const index = async (req, res, next) => {
  const allCampgrounds = await Campground.find({});
  res.render("./campgrounds/index", {allCampgrounds});
};

const newCamp = async (req, res, next) => {
  const geoData= await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  
  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.body.features[0].geometry;
  newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
  newCampground.author = req.user._id;
  await newCampground.save();
  console.log(newCampground);
  req.flash("success", "Successfully Created new Campground!");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

const newCampForm = (req, res) => {
  res.render("campgrounds/new");
};

const editCampForm = async (req, res, next) => {
  const {id} = req.params;
  const currInfo = await Campground.findById(id);
  if (!currInfo) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  
  res.render("./campgrounds/edit", {currInfo});
};

const showCamp = async (req, res, next) => {
  const {id} = req.params;
  const currCampground = await Campground.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  }).populate("author");
  if (!currCampground) {
    req.flash("error", "Cannot find that Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("./campgrounds/show", {currCampground});
};

const editCamp = async (req, res, next) => {
  const {id} = req.params;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  if (req.body.deleteImages) {
    for (let pick of req.body.deleteImages) {
      await cloudinary.uploader.destroy(pick);
    }
    await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
  }
  const pics = req.files.map(f => ({url: f.path, filename: f.filename}));
  camp.images.push(...pics);
  await camp.save();
  req.flash("success", "Successfully Updated Campground!");
  res.redirect(`/campgrounds/${camp._id}`);
};

const deleteCamp = async (req, res, next) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted the Campground!");
  res.redirect("/campgrounds");
};

module.exports = {index, newCamp, newCampForm, editCampForm, showCamp, editCamp, deleteCamp};