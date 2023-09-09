const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");
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
    const user = new User({ ...payload, password: hashedPassword });
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
