const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");
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
    await user.save();
    const jwtToken = user.getJwtToken();
    return res
      .header("X-Auth-Token", jwtToken)
      .send(`Account is created successfully`);
  } catch (ex) {
    return res.status(500).send(ex);
  }
});

router.get("/lookup", auth, async (req, res) => {
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
