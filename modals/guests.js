const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const GuestSchema = new Schema({
  name: String,
  h_no: String,
});
const guest = mongoose.model("guest", GuestSchema);

const validateGuest = (data) => {
  const guestValidationSchema = Joi.object({
    name: Joi.string().min(3).required(),
    h_no: Joi.string(),
  });
  return guestValidationSchema.validate(data);
};

module.exports = { guest, validateGuest };
