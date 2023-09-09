const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema, model } = mongoose;

const dishSchema = new Schema({
  name: { type: String, require: true },
  photo: { type: Schema.ObjectId, ref: "Photo", require: true },
  cost: { type: Number, require: true },
  description: { type: String },
  units: { type: Number },
  ratings: { type: Number },
  reviews: { type: [String] },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
});

dishSchema.methods.getTotalCost = function () {
  return this.units * this.cost;
};

const validateDish = (data) => {
  const dish = Joi.object({
    name: Joi.string().required(),
    photo: Joi.string().required(),
    cost: Joi.number().required(),
    units: Joi.number(),
    ratings: Joi.number(),
    reviews: Joi.array().items(Joi.string()),
    description: Joi.string(),
    created_on: Joi.date(),
    updated_on: Joi.date(),
  });
  return dish.validate(data, { abortEarly: false });
};

const Dish = model("dish", dishSchema);
module.exports = { Dish, validateDish };
