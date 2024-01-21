const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const guests = require("./routes/guests");
const user = require("./routes/user");
const weddings = require("./routes/weddings");
const login = require("./routes/login");
const mails = require("./routes/mails");
const invitation = require("./routes/invitation");
const like = require("./routes/likes");

const app = express();
const PORT = process.env.PORT || "2000";
const dbConnectionString = config.get("dbConfig.mongoURI");

mongoose
  .connect(dbConnectionString)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log("FATAL:", err);
  });

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token"
  );
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});
app.use("/v1/guests", guests);
app.use("/v1/user", user);
app.use("/v1/weddings", weddings);
app.use("/v1/login", login);
app.use("/v1/mails", mails);
app.use("/v1/invitation", invitation);
app.use("/v1/likes", like);

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
