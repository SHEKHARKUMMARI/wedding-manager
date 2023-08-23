const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema, model } = mongoose;
const weddingSchema = new Schema({
  title: { type: String, required: true },
  bribe: { type: String, required: true },
  groom: { type: String, required: true },
  food_gallery: { type: [Schema.ObjectId], default: [] },
  photo_gallery: { type: [Schema.ObjectId], default: [] },
  pending_invitations: { type: [Schema.ObjectId], default: [] },
  guests: { type: [Schema.ObjectId], default: [] },
  wedding_date: { type: Date, required: true },
  avenue: { type: String, required: true },
  time_table: { type: String },
});

const Wedding = model("wedding", weddingSchema);

const validateWedding = (data) => {
  const wedding = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    bribe: Joi.string().min(3).max(30).required(),
    groom: Joi.string().min(3).max(30).required(),
    wedding_date: Joi.date().required(),
    avenue: Joi.string().required(),
  });
  return wedding.validate(data, { abortEarly: false });
};
module.exports = { Wedding, validateWedding };
