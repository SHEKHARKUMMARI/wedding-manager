const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || "2000";
mongoose
  .connect(
    `mongodb+srv://weddingmanager:weddingmanager@cluster-wedding-planer.gnukwke.mongodb.net/Weddings?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected  to mongodb");
  })
  .catch((err) => {
    console.log("FATAL:", err);
  });
app.use("/", (req, res) => {
  return res.send("Hello world");
});
app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
