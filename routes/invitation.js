const express = require("express");
const { Types } = require("mongoose");
const config = require("config");
const _ = require("lodash");
const { Wedding } = require("../modals/wedding");
const { User } = require("../modals/user");
const { auth } = require("../middleware/authorization");
const {
  validateInvitation,
  Invitation,
  validateStatusUpdation,
} = require("../modals/invitation");
const { weddingInvitation } = require("../utils/mails");

const router = express.Router();
const WEB_URL = config.get(`fe.website_url`);
router.get("/wedding/:id/guests", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send("something went wrong");
  const weddingId = new Types.ObjectId(id);
  const invitations = await Invitation.find({
    wedding_id: weddingId,
    status: "accepted",
  }).populate({
    path: "guest_id",
    model: User,
    select: "-password",
  });

  return res.status(200).send(invitations || []);
});

router.get("/wedding/:id/guests/status", async (req, res) => {
  const { id } = req.params;
  const { guest_id, email } = req?.query || {};
  const decodedEmailId = decodeURIComponent(email);
  if (!id || (!guest_id && !email))
    return res.status(400).send("something went wrong");
  const weddingId = new Types.ObjectId(id);
  const guestId = new Types.ObjectId(guest_id);
  const invitations = guest_id
    ? await Invitation.find({
        wedding_id: weddingId,
        guest_id: guestId,
      })
    : await Invitation.find({
        wedding_id: weddingId,
        email: decodedEmailId,
      });

  return res.status(200).send(invitations || []);
});

router.post("/wedding/:id/guests/status", auth, async (req, res) => {
  const { id } = req.params;
  const user = req?.user;
  const payload = req?.body;
  const { error } = validateStatusUpdation(payload);
  if (error) {
    return res.status(400).send(error);
  }

  if (!id || !user?.id) return res.status(400).send("something went wrong");
  const weddingId = new Types.ObjectId(id);
  const userId = new Types.ObjectId(user?.id);
  try {
    const request = await Invitation?.updateMany(
      {
        wedding_id: weddingId,
        guest_id: userId,
      },
      {
        $set: {
          status: payload?.status,
          reason: payload?.reason,
          updated_on: new Date(),
        },
      }
    );
    return res.status(200).send(request);
  } catch (error) {
    return res.status(500).send(error);
  }
});

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
  const guestQuery = guest_id ? `guest_id=${guest_id}` : `guest_email=${email}`;
  try {
    const emailResponse = await weddingInvitation({
      wedding: wedding,
      guest_email: guest_id ? guest?.email : email,
      invitee_email: invitee?.email,
      wedding_url: `${WEB_URL}/weddings/${wedding?._id}?${guestQuery}`,
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
