const mongoose = require("mongoose");
const Joi = require("joi");

const { Photo } = require("../modals/photo");
const { Dish } = require("../modals/dish");
const { Comment } = require("../modals/comment");

const { Schema, model } = mongoose;
const weddingSchema = new Schema({
  title: { type: String, required: true },
  bribe: { type: Schema.ObjectId, ref: "User", required: true },
  groom: { type: Schema.ObjectId, ref: "User", required: true },
  food_gallery: [{ type: Schema.ObjectId, ref: Dish }],
  photo_gallery: [{ type: Schema.ObjectId, ref: Photo }],
  pending_invitations: [{ type: Schema.ObjectId, ref: "User" }],
  guests: [{ type: Schema.ObjectId, ref: "User" }],
  wedding_date: { type: Date, required: true },
  avenue: { type: String, required: true },
  likes: [{ type: Schema.ObjectId, ref: "User" }],
  wedding_description: { type: Schema.ObjectId, ref: Comment },
  comments: [{ type: Schema.ObjectId, ref: Comment }],
  time_table: { type: String },
  created_by: { type: Schema.ObjectId, ref: "User" },
  managed_by: [{ type: Schema.ObjectId, ref: "User" }],
  created_on: { type: Date, default: Date.now() },
  updated_on: { type: Date, default: Date.now() },
  is_public: { type: Boolean, default: false },
});

const Wedding = model("wedding", weddingSchema);

const validateWedding = (data) => {
  const wedding = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    bribe: Joi.string().required(),
    groom: Joi.string().required(),
    wedding_date: Joi.date().required(),
    avenue: Joi.string().required(),
    wedding_description: Joi.string(),
    managed_by: Joi.array().items(Joi.string()),
    is_public: Joi.boolean(),
  });
  return wedding.validate(data, { abortEarly: false });
};
module.exports = { Wedding, validateWedding, weddingSchema };
