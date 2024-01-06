const express = require("express");
const mongoose = require("mongoose");
const { Types } = mongoose;
const router = express.Router();
const { Wedding, validateWedding } = require("../modals/wedding");
const { User } = require("../modals/user");
const { auth } = require("../middleware/authorization");
const { weddingInvitation } = require("../utils/mails");

// get all wedding

router.get("/", auth, async (req, res) => {
  const weddings = await Wedding.find();
  return res.status(200).send(weddings);
});

router.post("/", auth, async (req, res) => {
  const payload = req.body;
  const { user } = req;
  const { error } = validateWedding(payload);
  if (error) {
    return res.status(400).send(error);
  }
  const groomId = new Types.ObjectId(payload?.groom?.toString());
  const bribeId = new Types.ObjectId(payload?.bribe?.toString());
  const userId = new Types.ObjectId(user?.id?.toString());

  const wedding = new Wedding({
    ...payload,
    groom: groomId,
    bribe: bribeId,
    created_by: userId,
  });
  const savedWedding = await wedding.save();

  const currentUser = await User.findById(userId);
  currentUser.my_weddings = [
    ...(currentUser?.my_weddings || []),
    savedWedding?._id,
  ];
  await currentUser.save();

  return res.status(200).send(savedWedding);
});

router.get("/my-weddings", auth, async (req, res) => {
  const { user } = req;

  try {
    const id = new Types.ObjectId(user?.id);
    const userData = await User.findById(id)
      .populate({
        path: "my_weddings",
        populate: {
          path: "bribe groom",
          model: User,
        },
      })
      .exec();
    return res.status(200).send(userData?.my_weddings);
  } catch (ex) {
    return res.status(500).send(ex);
  }
});

router.put("/invite", auth, async (req, res) => {
  const payload = req.body;
  const inviteeId = new Types.ObjectId(payload?.inviteeId?.toString());
  const weddingId = new Types.ObjectId(payload?.weddingId?.toString());

  const invitee = await User.findById(inviteeId);
  const wedding = await Wedding.findById(weddingId);
  if (!invitee || !wedding) {
    res.status(400).send("Wedding or Invitee doesnot exist");
  }
  const isAlreadyInvited =
    invitee?.approval_pending_weddings?.some((id) =>
      new Types.ObjectId(id.toString()).equals(weddingId)
    ) ||
    wedding?.guests?.some((id) =>
      new Types.ObjectId(id.toString()).equals(inviteeId)
    );

  if (isAlreadyInvited) {
    return res
      .status(400)
      .send(`${invitee.name} ${invitee.surname} is Already Invited.`);
  }
  invitee.approval_pending_weddings = [
    ...(invitee.approval_pending_weddings || []),
    weddingId,
  ];
  wedding.pending_invitations = [
    ...(wedding.pending_invitations || []),
    inviteeId,
  ];
  await invitee.save();
  await wedding.save();
  try {
    await weddingInvitation({ invitee: invitee, invitor: req.user });
    return res.status(200).send("Invitation send successfully");
  } catch (err) {
    return res.status(500).status(err);
  }
});

router.put("/accept", auth, async (req, res) => {
  const payload = req.body;
  const userId = new Types.ObjectId(req.user.id?.toString());
  const weddingId = new Types.ObjectId(payload?.weddingId?.toString());

  const user = await User.findById(userId);
  const wedding = await Wedding.findById(weddingId);
  if (!user || !wedding) {
    res.status(400).send("Wedding  doesnot exist");
  }

  const isAlreadyAccepted = user?.weddings?.some((id) =>
    new Types.ObjectId(id.toString()).equals(weddingId)
  );

  if (isAlreadyAccepted) {
    return res.status(400).send(`${wedding.title} is Already Accepted.`);
  }
  user.approval_pending_weddings = (
    user?.approval_pending_weddings || []
  )?.filter((id) => !new Types.ObjectId(id.toString()).equals(weddingId));
  user.weddings = [...(user?.weddings || []), weddingId];

  wedding.pending_invitations = (wedding.pending_invitations || [])?.filter(
    (id) => !new Types.ObjectId(id.toString()).equals(userId)
  );
  wedding.guests = [...(wedding?.guests || []), userId];

  await user.save();
  await wedding.save();
  try {
    await weddingInvitation({ invitee: user, invitor: req.user });
    return res.status(200).send("Invitation is Accepted successfully");
  } catch (err) {
    return res.status(500).status(err);
  }
});

module.exports = router;
