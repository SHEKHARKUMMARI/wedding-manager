const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const guests = require("./routes/guests");
const user = require("./routes/user");
const weddings = require("./routes/weddings");
const login = require("./routes/login");

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
app.use("/guests", guests);
app.use("/user", user);
app.use("/weddings", weddings);
app.use("/login", login);

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
