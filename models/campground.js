const {func} = require("joi");
const mongoose = require("mongoose");
const {Schema} = mongoose;
const Review = require("./review");
const User = require('./user')

const imageSchema = new Schema({
  url: String,
  filename: String
});

imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200')
});

const opts = {toJSON: {virtuals: true} };

const CampgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  price: Number,
  description: String,
  location: String,
  geometry: {
    type: {
      type: "String",
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
},opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
});

CampgroundSchema.post("findOneAndDelete", async function (camp) {
  if (camp) {
    await Review.remove({
      _id: {$in: camp.reviews},
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
