const express = require("express");
const { Types } = require("mongoose");
const { Wedding } = require("../modals/wedding");
const { User } = require("../modals/user");
const { auth } = require("../middleware/authorization");
const { validateInvitation, Invitation } = require("../modals/invitation");
const { weddingInvitation } = require("../utils/mails");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const payload = req.body;
  const userId = req?.user?.id;
  const inviteeId = new Types.ObjectId(userId);

  const { guest_id, wedding_id, email } = payload;
  if (!guest_id && !email)
    return res.status(400).json("Please add Email or Guest ");
  const { error } = validateInvitation(payload);
  if (error) return res.status(400).send(error);
  const guestId = new Types.ObjectId(guest_id);
  const weddingId = new Types.ObjectId(wedding_id?.trim());

  const guest = guestId ? await User.findById(guestId) : null;
  const invitee = await User.findById(inviteeId);
  const wedding = await Wedding.findById(weddingId)?.populate([
    {
      path: "bribe groom",
      model: User,
      select: "-password",
    },
  ]);
  try {
    const emailResponse = await weddingInvitation({
      wedding: wedding,
      guest_email: guest_id ? guest?.email : email,
      invitee_email: invitee?.email,
    });
    const guestInvitations = guestId
      ? await Invitation.find({ wedding_id: weddingId, guest_id: guestId })
      : [];

    if (emailResponse?.accepted?.length && !guestInvitations?.length) {
      const newInvitation = new Invitation(payload);
      try {
        const savedInvitation = await newInvitation.save();
        return res.status(200).json(savedInvitation);
      } catch (err) {
        return res.status(500).send(err);
      }
    }
    return res.status(200).send(emailResponse);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
