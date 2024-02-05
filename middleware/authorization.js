const jwt = require("jsonwebtoken");
const config = require("config");

const jwtSecreteKey = config.get("dbConfig.jwtSecretKey");

const auth = async (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).send("Please, Login to get access");
  }
  try {
    const decodedData = jwt.verify(token, jwtSecreteKey);
    req.user = decodedData;
    return next();
  } catch {
    return res.status(400).send("Invalid  token");
  }
};

const profile = async (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    req.user = {};
    return next();
  }
  try {
    const decodedData = jwt.verify(token, jwtSecreteKey);
    req.user = decodedData;
    return next();
  } catch {
    return res.status(400).send("Invalid  token");
  }
};
module.exports = { auth, profile };
