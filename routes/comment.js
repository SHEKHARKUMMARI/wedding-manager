const express = require("express");
const mongoose = require("mongoose");

const { Comment, validateComment } = require("../modals/comment");
const { User } = require("../modals/user");
const { auth } = require("../middleware/authorization");
const { Types } = mongoose;

const route = express.Router();

route.get(`/wedding/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const weddingId = new Types.ObjectId(id);
    const comments = await Comment.find({
      wedding: weddingId,
      type: { $ne: "description" },
      parent: { $exists: false },
    })
      ?.sort({ created_on: -1 })
      ?.populate([
        {
          path: "created_by",
          model: User,
          select: "-password",
        },
        {
          path: "replies",
          model: Comment,
          populate: {
            path: "created_by",
            model: User,
            select: "-password",
          },
        },
      ]);
    return res.status(200).send(comments);
  } catch (err) {
    console.log("ERROR", err);
    return res.status(500).send(err);
  }
});

route.get(`/comment/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const commentId = new Types.ObjectId(id);
    const comments = await Comment.findById(commentId)
      ?.sort({ created_on: -1 })
      ?.populate([
        {
          path: "created_by",
          model: User,
          select: "-password",
        },
        {
          path: "replies",
          model: Comment,
          populate: {
            path: "created_by",
            model: User,
            select: "-password",
          },
        },
      ]);
    // replies
    if (!comments) return res.status(400).send("Comment doesnot exist");

    return res.status(200).send(comments);
  } catch (err) {
    console.log("ERROR", err);
    return res.status(500).send(err);
  }
});

route.post(`/wedding/:id`, auth, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const user = req.user;

  try {
    const weddingId = new Types.ObjectId(id);
    const { error: commentError } = validateComment({
      ...payload,
      wedding: id,
    });
    const commentPayload = {
      ...payload,
      wedding: weddingId,
      created_by: new Types.ObjectId(user?.id),
      updated_by: new Types.ObjectId(user?.id),
      created_on: new Date(),
      updated_on: new Date(),
    };
    if (commentError) return res.status(400).send(commentError);

    const comment = new Comment(commentPayload);
    const savedComment = await comment.save();
    if (payload.parent) {
      const parentCommnetId = new Types.ObjectId(payload?.parent);
      const parentComment = await Comment.findById(parentCommnetId);
      parentComment?.replies?.push(savedComment?._id);
      await parentComment.save();
    }
    return res.status(200).send(savedComment);
  } catch (err) {
    console.log("ERROR", err);
    return res.status(500).send(err);
  }
});

module.exports = route;
