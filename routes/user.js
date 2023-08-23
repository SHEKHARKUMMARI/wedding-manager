const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");

const { User, validateUser } = require("../modals/user");

const router = express.Router();

const saltRounds = config.get("dbConfig.saltRounds");

router.post("/", async (req, res) => {
  const payload = req?.body;
  const { error } = validateUser(payload);

  if (error) {
    return res.status(400).send(error);
  }
  try {
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);
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
module.exports = router;
