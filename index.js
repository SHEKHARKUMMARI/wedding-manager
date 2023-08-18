const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const guests = require("./routes/guests");

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
app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
