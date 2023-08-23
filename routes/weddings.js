const express = require("express");
const mongoose = require("mongoose");
const { Types } = mongoose;
const router = express.Router();
const { Wedding, validateWedding } = require("../modals/wedding");
const { User } = require("../modals/user");
const { auth } = require("../middleware/authorization");

router.get("/", auth, async (req, res) => {
  const weddings = await Wedding.find();
  return res.status(200).send(weddings);
});

router.get("/me", auth, async (req, res) => {
  const { user } = req;

  try {
    const id = new Types.ObjectId(user?.id);
    const userDetails = await User.findById(id);
    const weddingsIds = userDetails?.my_weddings;
    return res.status(200).send(weddingsIds);
  } catch (ex) {
    return res.status(500).send(ex);
  }
});

router.post("/", auth, async (req, res) => {
  const payload = req.body;
  const { user } = req;
  const { error } = validateWedding(payload);
  if (error) {
    return res.status(400).send(error);
  }
  const wedding = new Wedding(payload);
  const savedWedding = await wedding.save();
  const id = new Types.ObjectId(user?.id?.toString());
  const currentUser = await User.findById(id);
  currentUser.my_weddings = [
    ...(currentUser.my_weddings || []),
    savedWedding._id,
  ];
  await currentUser.save();

  return res.status(200).send(savedWedding);
});

module.exports = router;
