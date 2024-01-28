const express = require("express");
const mongoose = require("mongoose");
const { Types } = mongoose;
const router = express.Router();
const { Wedding, validateWedding } = require("../modals/wedding");
const { Photo, validatePhotos } = require("../modals/photo");
const { User } = require("../modals/user");
const { Comment } = require("../modals/comment");
const { auth } = require("../middleware/authorization");
const { weddingInvitation } = require("../utils/mails");

router.get("/", auth, async (req, res) => {
  const weddings = await Wedding.find();
  return res.status(200).send(weddings);
});

router.get("/my-weddings", auth, async (req, res) => {
  const { user } = req;

  try {
    const id = new Types.ObjectId(user?.id);
    const userData = await Wedding.findById(id)
      .populate([
        {
          path: "my_weddings",
          populate: [
            {
              path: "bribe groom",
              model: User,
              select: "-password",
            },
            {
              path: "photo_gallery",
              model: Photo,
            },
          ],
        },
      ])
      .exec();
    return res.status(200).send(userData?.my_weddings);
  } catch (ex) {
    return res.status(500).send(ex);
  }
});

router.get("/my-wedding/:id", async (req, res) => {
  const { id } = req.params || {};
  if (!id) {
    return res.status(400).send("Wedding Not Found");
  }
  const weddingID = new Types.ObjectId(id);
  try {
    const wedding = await Wedding.findById(weddingID).populate([
      {
        path: "bribe groom",
        model: User,
        select: "-password",
      },
      {
        path: "photo_gallery",
        model: Photo,
      },
    ]);
    if (!wedding) return res.status(400).send("please create  wedding");
    return res.status(200).send(wedding);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/public", async (req, res) => {
  const weddings = await Wedding.find({ is_public: true })?.populate([
    {
      path: "bribe groom",
      select: "-password",
      model: User,
    },
    {
      path: "photo_gallery",
      model: Photo,
    },
    {
      path: "wedding_description",
      model: Comment,
      select: "message",
    },
  ]);
  return res.status(200).send(weddings);
});

router.post("/", auth, async (req, res) => {
  const { wedding_description, ...payload } = req.body;
  const { photo_gallery, ...weddingDetails } = payload || {};
  const { user } = req;
  const { error: weddingError } = validateWedding(weddingDetails);
  const { error: galleryError } = validatePhotos(photo_gallery);
  if (weddingError || galleryError) {
    return res
      .status(400)
      .send({ weeding: weddingError, photos: galleryError });
  }

  const groomId = new Types.ObjectId(payload?.groom?.toString());
  const bribeId = new Types.ObjectId(payload?.bribe?.toString());
  const userId = new Types.ObjectId(user?.id?.toString());
  const savedPhotos = await Photo.insertMany(photo_gallery);
  const savedPhotosIds = savedPhotos?.map((photo) => photo._id);

  const wedding = new Wedding({
    ...payload,
    groom: groomId,
    bribe: bribeId,
    created_by: userId,
    photo_gallery: savedPhotosIds,
  });
  const savedWedding = await wedding.save();

  const weddingDescpayload = {
    wedding: savedWedding?._id,
    created_by: userId,
    type: "description",
    ...wedding_description,
  };
  const weddingDescription = new Comment(weddingDescpayload);
  const savedWeddingComment = await weddingDescription?.save();
  savedWedding.wedding_description = savedWeddingComment?._id;
  await savedWedding.save();

  const currentUser = await User.findById(userId);
  currentUser.my_weddings = [
    ...(currentUser?.my_weddings || []),
    savedWedding?._id,
  ];
  await currentUser.save();
  return res.status(200).send(savedWedding);
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
