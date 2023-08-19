const express = require("express");
const router = express.Router();

const { guest, validateGuest } = require("../modals/guests");
router.get("/", async (req, res) => {
  const guestList = await guest.find();
  return res.status(200).send(guestList);
});
router.post("/", async (req, res) => {
  const payload = req?.body;
  const { error } = validateGuest(payload);

  if (error) {
    return res.status(400).send(error);
  }
  const { name, h_no } = payload;
  const newGuest = new guest({
    name: name,
    h_no: h_no,
  });
  await newGuest.save();
  return res.status(200).send("guest is successfuly added");
});

module.exports = router;
