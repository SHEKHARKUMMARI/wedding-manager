const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./user");
const { Wedding } = require("./wedding");
const { Schema, model } = mongoose;
const invitationStatuses = ["invited", "accepted", "rejected", ""];
const invitationSchema = new Schema({
  guest_id: { type: Schema.ObjectId, ref: User, require: true },
  wedding_id: { type: Schema.ObjectId, ref: Wedding, require: true },
  email: { type: String },
  created_by: { type: Schema.ObjectId, ref: User },
  created_on: { type: Date, default: Date.now() },
  updated_by: { type: Schema.ObjectId, ref: User },
  updated_on: { type: Date, default: Date.now() },
  no_of_antendees: { type: Number, default: 0 },
  status: {
    type: String,
    enum: invitationStatuses,
    default: "invited",
  },

  reason: { type: String },
});

const Invitation = model("invitation", invitationSchema);
const validateInvitation = (data) => {
  const invitation = Joi.object({
    guest_id: Joi.string(),
    wedding_id: Joi.string().required(),
    email: Joi.string().email(),
    status: Joi.string().valid("invited", "accepted", "rejected", ""),
  });
  return invitation.validate(data, { abortEarly: false });
};
const validateStatusUpdation = (data) => {
  const invitation = Joi.object({
    reason: Joi.string(),
    status: Joi.string()
      .valid("invited", "accepted", "rejected", "")
      .required(),
  });
  return invitation.validate(data, { abortEarly: false });
};

module.exports = { Invitation, validateInvitation, validateStatusUpdation };
