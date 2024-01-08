const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");
const _ = require("lodash");
const { Types } = require("mongoose");
const { auth } = require("../middleware/authorization");
const { User, validateUser } = require("../modals/user");

const router = express.Router();

const saltRounds = config.get("dbConfig.saltRounds");

router.post("/", async (req, res) => {
  const payload = req?.body;
  const { error } = validateUser(payload);

  if (error) {
    return res.status(400).send(error);
  }
  const { email, mobile, password } = payload;
  const accounts = await User.find({
    $or: [{ email: email }, { mobile: mobile }],
  });
  if (accounts?.length) {
    return res.status(400).send("Account already exist.");
  }
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(saltRounds?.toString())
    );
    const children = payload.family?.children?.map((member) => {
      return new Types.ObjectId(member?.child?.toString());
    });
    const user = new User({
      ...payload,
      password: hashedPassword,
      family: {
        ...(payload.family?.mother
          ? { mother: new Types.ObjectId(payload.family?.mother.toString()) }
          : {}),
        ...(payload?.family?.father
          ? { father: new Types.ObjectId(payload?.family?.father.toString()) }
          : {}),
        ...(payload.family?.wife
          ? { wife: new Types.ObjectId(payload.family?.wife.toString()) }
          : {}),
        ...(payload.family?.husband
          ? { husband: new Types.ObjectId(payload.family?.husband.toString()) }
          : {}),
        ...(payload.family?.children ? { children: children } : {}),
      },
    });
    const newUser = await user.save();
    const jwtToken = user.getJwtToken();
    return res.header("X-Auth-Token", jwtToken).json({
      name: newUser?.name,
      surname: newUser?.surname,
      id: newUser?._id,
    });
  } catch (ex) {
    return res.status(500).send(ex);
  }
});

router.get("/", auth, async (req, res) => {
  const userId = new Types.ObjectId(req?.user?.id?.trim());
  if (!userId)
    return res
      .status(400)
      .send({ message: "User doesnot exist , Please SignUp." });
  try {
    const userData = await User.findById(userId);
    const user = _.omit(userData?.toObject(), ["password", "__v"]);
    return res.status(200).send(user);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get("/lookup", async (req, res) => {
  const { q } = req.query;
  const queryRegex = new RegExp(q);
  const users = await User.find({
    $or: [
      { name: { $regex: queryRegex, $options: "i" } },
      { surname: { $regex: queryRegex, $options: "i" } },
    ],
  });
  return res.status(200).send(users);
});
module.exports = router;
