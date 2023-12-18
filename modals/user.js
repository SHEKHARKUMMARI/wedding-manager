const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const { Wedding } = require("../modals/wedding");

const jwtSecreteKey = config.get("dbConfig.jwtSecretKey");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, require: true },
  surname: { type: String, require: true },
  gender: { type: String, require: true },
  place: { type: String, require: true },
  mobile: { type: String, require: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, require: true, default: "Customer" },
  my_weddings: [{ type: Schema.ObjectId, ref: Wedding }],
  weddings: [{ type: Schema.ObjectId, ref: Wedding }],
  approval_pending_weddings: [{ type: Schema.ObjectId, ref: Wedding }],
  h_no: { type: String, require: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  family: {
    father: { type: Schema.ObjectId, ref: "User" },
    mother: { type: Schema.ObjectId, ref: "User" },
    wife: { type: Schema.ObjectId, ref: "User" },
    husband: { type: Schema.ObjectId, ref: "User" },
    children: [{ type: Schema.ObjectId, ref: "User" }],
  },

  access: { type: String },
});

userSchema.methods.getJwtToken = function () {
  const jwtToken = jwt.sign(
    {
      id: this._id,
      role: this.role,
      name: this.name,
      surname: this.surname,
    },
    jwtSecreteKey
  );
  return jwtToken;
};

const validateUser = (data) => {
  const user = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    surname: Joi.string().min(3).max(20).required(),
    mobile: Joi.string().min(2).max(20).required(),
    password: Joi.string().min(2).max(20).required(),
    gender: Joi.string().valid("male", "female").required(),
    repeat_password: Joi.ref("password"),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com"] },
      })
      .required(),
    place: Joi.string().min(5).max(20).required(),
    family: Joi.object({
      father: Joi.string().allow(null, ""),
      mother: Joi.string().allow(null, ""),
      husband: Joi.string().allow(null, ""),
      wife: Joi.string().allow(null, ""),
      children: Joi.array().items(Joi.string().allow(null, "")),
    }),
    role: Joi.string().min(5).max(20),
    my_weddings: Joi.array().items(Joi.string()),
    weddings: Joi.array().items(Joi.string()),
    h_no: Joi.string().required(),
    access: Joi.string(),
  }).with("password", "repeat_password");
  return user.validate(data, { abortEarly: false });
};

const User = model("user", userSchema);
module.exports = { User, validateUser };
