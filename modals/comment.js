const mogoose = require("mongoose");
const { Wedding } = require("./wedding");
const { User } = require("./user");
const Joi = require("joi");
const { Schema, model } = mogoose;

const commentSchema = new Schema({
  parent: {
    type: String,
  },
  replies: [String],
  message: { type: String, required: true },
  wedding: {
    type: Schema.ObjectId,
    ref: "Wedding",
    required: true,
  },
  likes: [
    {
      type: Schema.ObjectId,
      ref: User,
    },
  ],
  created_on: {
    type: Date,
    default: Date.now(),
  },
  created_by: {
    type: Schema.ObjectId,
    ref: "User",
  },
  updated_on: {
    type: Date,
    default: Date.now(),
  },
});

const Comment = model("comment", commentSchema);

const validateComment = (data) => {
  const comment = Joi.object({
    parent: Joi.string(),
    wedding: Joi.string().required(),
    message: Joi.string().required(),
    likes: Joi.array().items(Joi.string()),
    replies: Joi.array().items(Joi.string()),
  });
  return comment.validate(data, { abortEarly: false });
};

module.exports = { Comment, validateComment };
