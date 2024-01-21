const express = require("express");
const mongoose = require("mongoose");

const { auth } = require("../middleware/authorization");

const { Wedding } = require("../modals/wedding");

const { Types } = mongoose;
const router = express.Router();
router.get("/comment/:id", (req, res) => {
  res.status(200).send("Ok");
});
router.get("/wedding/:id", auth, async (req, res) => {
  const { id } = req.params;
  const userId = req?.user?.id;
  const weddingId = new Types.ObjectId(id);
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) return res.status(400).send("something is wrong");
  const likes = wedding?.likes;
  const isLiked = likes.find((l) => l?.equals(new Types.ObjectId(userId)));
  return res.status(200).send({
    count: wedding?.likes?.length,
    status: "Already updated",
    is_liked: !!isLiked,
  });
});

router.put("/wedding/:id", auth, async (req, res) => {
  const { id } = req.params;
  const userId = req?.user?.id;
  const { is_liked } = req.body;
  const weddingId = new Types.ObjectId(id);
  const wedding = await Wedding.findById(weddingId);
  if (!wedding) return res.status(400).send("something is wrong");
  const likes = wedding.likes;
  const isLiked = likes.find((l) => l?.equals(new Types.ObjectId(userId)));
  if ((isLiked && is_liked) || (!isLiked && !is_liked))
    return res.status(200).send({
      count: wedding?.likes?.length,
      status: "Already updated",
      is_liked: !!isLiked,
    });
  if (is_liked) {
    wedding.likes.push(userId);
  } else {
    wedding.likes.pull(userId);
  }
  const updatedWedding = await wedding.save();
  const isUserLiked = updatedWedding?.likes.find((l) =>
    l?.equals(new Types.ObjectId(userId))
  );

  return res.status(200).send({
    count: updatedWedding?.likes?.length,
    status: "updated",
    is_liked: !!isUserLiked,
  });
});

module.exports = router;
