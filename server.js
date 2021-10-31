const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder
app.use(express.static("templates"));

// Api routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/subscription", require("./routes/api/subscription"));
app.use("/api/videos", require("./routes/api/videos"));
app.use("/api/brands", require("./routes/api/brands"));
app.use("/api/coach", require("./routes/api/coach"));
app.use("/api/activity-category", require("./routes/api/activityCategories"));

// Web routes
app.use("/forgot-password", require("./routes/web/forgotPassword"));

// Serve static assets in production
app.get("*", (req, res) => {
  res.send("Working server");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
