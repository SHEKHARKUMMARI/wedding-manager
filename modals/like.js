const mogoose = require("mongoose");
const { Wedding } = require("./wedding");
const { User } = require("./user");
const { Comment } = required("./comment.js");
const Joi = require("joi");
const { Schema, model } = mogoose;

const likeSchema = new Schema({
  wedding: {
    type: Schema.ObjectId,
    ref: Wedding,
  },
  comment: {
    type: Schema.ObjectId,
    ref: Comment,
  },
  is_liked: {
    type: Boolean,
  },
  liked_by: {
    type: Schema.ObjectId,
    ref: User,
  },
  updated_on: {
    type: Date,
    default: Date.now(),
  },
});

const Like = model("comment", likeSchema);

const validateLike = (data) => {
  const like = Joi.object({
    wedding: Joi.string(),
    comment: Joi.string(),
    is_liked: Joi.boolean(),
  });
  return like.validate(data, { abortEarly: false });
};

module.exports = { Like, validateLike };
