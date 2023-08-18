const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const GuestSchema = new Schema({
  name: String,
  h_no: String,
});
const guest = mongoose.model("guest", GuestSchema);
module.exports = { guest };
