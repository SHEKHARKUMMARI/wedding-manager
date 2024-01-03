const express = require("express");

const bcrypt = require("bcrypt");
const { validateLoginCredentials } = require("../modals/auth");
const { User } = require("../modals/user");

const router = express.Router();

router.post("/", async (req, res) => {
  const payload = req.body;
  const { error } = validateLoginCredentials(payload);
  if (error) {
    return res.status(400).send(error);
  }
  const { user_id, password } = payload;
  const user = await User.findOne({
    $or: [{ email: user_id }, { mobile: user_id }],
  });
  if (!user) {
    return res.status(400).send("Invalid username or password");
  }
  const isValidUser = await bcrypt.compare(password, user.password);
  if (!isValidUser) {
    return res.status(400).send("Invalid username or password");
  }
  const jwtToken = user.getJwtToken();
  return res
    .header("X-Auth-Token", jwtToken)
    .json({ name: user?.name, surname: user?.surname, id: user?._id });
});
module.exports = router;
