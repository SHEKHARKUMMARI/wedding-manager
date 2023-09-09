const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Joi = require("joi");
const photoSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  url: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  is_public: {
    type: Boolean,
    require: true,
  },
  created_by: {
    type: String,
  },
  created_on: {
    type: String,
    default: Date.now(),
  },
});
const Photo = model("photo", photoSchema);
const validatePhoto = (data) => {
  const photo = Joi.object({
    title: Joi.string().required().min(5),
    url: Joi.string().required(),
    type: Joi.string().required(),
    is_public: Joi.boolean().required(),
  });
  return photo.validate(data, { abortEarly: false });
};

module.exports = { validatePhoto, Photo };
