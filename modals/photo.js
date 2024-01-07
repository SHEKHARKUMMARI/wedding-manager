const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Joi = require("joi");
const photoSchema = new Schema({
  title: {
    type: String,
  },
  url: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    enum: ["wedding", "food"],
    require: true,
  },
  is_public: {
    type: Boolean,
  },
  created_by: {
    type: String,
  },
  created_on: {
    type: String,
    default: Date.now(),
  },
  upadated_by: {
    type: String,
  },
  updated_on: {
    type: String,
    default: Date.now(),
  },
});
photoSchema.pre("updateOne", function (next) {
  this.set({ updated_on: Date.now() });
  next();
});
const Photo = model("photo", photoSchema);
const photoValidator = Joi.object({
  title: Joi.string(),
  url: Joi.string().required(),
  type: Joi.string().valid("wedding", "food").required(),
  is_public: Joi.boolean(),
  id: Joi.string(),
});
const validatePhotoGallery = (data) => {
  const photo = Joi.array().items(photoValidator);
  return photo.validate(data, { abortEarly: false });
};
const validatePhoto = (data) => {
  const photo = photoValidator;
  return photo.validate(data, { abortEarly: false });
};

module.exports = { validatePhotos: validatePhotoGallery, validatePhoto, Photo };
