const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcryptjs");

const { root } = require("../../general");
const connection = require("../../config/connection");
const resetPasswordAuth = require("../../middleware/resetPasswordAuth");

// @route    GET /forgot-password
// @desc     Forgot Password screen from email link
// @access   Private
router.get("/", resetPasswordAuth, (req, res) => {
  res.sendFile(path.resolve(root, "templates", "reset-password.html"));
});

// @route    POST /forgot-password
// @desc     Reset password submit
// @access   Private
router.post("/", resetPasswordAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      throw Error("Password empty");
    }

    // Update new password
    const salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(password, salt);

    connection.query(
      `UPDATE users
          SET password=?
          WHERE id=?`,
      [encryptedPassword, req.user.id],
      async (err, result) => {
        if (err) {
          throw err;
        }

        console.log("..result", JSON.stringify(result));

        res.sendFile(
          path.resolve(root, "templates", "reset-password-success.html")
        );
      }
    );
  } catch (error) {
    console.log("...Error", error);
    res.send(
      "<h2>An unexpected error occurred while processing your request</h2>"
    );
  }
});

module.exports = router;
