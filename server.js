const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Api routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/jobs", require("./routes/api/jobs"));

app.use(express.static("uploads"));

app.get("*", (req, res) => {
  res.send("Working server");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
