// requiring
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const { validate } = require("joi");
const Campground = require("./models/campground");
const expressError = require("./utils/expressErrors");
const catchAsync = require("./utils/catchAsync");
const { campgroundSchema } = require("./schema");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    return next();
  }
};

//connect to local MongoDB
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//sets and uses
const app = express();
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//all routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const allCampgrounds = await Campground.find({});
    res.render("./campgrounds/index", { allCampgrounds });
  })
);

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currInfo = await Campground.findById(id);
    res.render("./campgrounds/edit", { currInfo });
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const currCampground = await Campground.findById(id);
    res.render("./campgrounds/show", { currCampground });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.all("*", (req, res, next) => {
  next(new expressError("Page Note Found!!!", 404));
});

//Error handler
app.use((err, req, res, next) => {
  if (!err.message) err.message = "Opps!! something Went Wrong!!";
  res.status(err.statusCode || 500).render("error", { err });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on Port : ${port}`);
});
