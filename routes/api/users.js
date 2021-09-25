const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");

// @route    POST api/users
// @desc     Register new user
// @access   Public
router.post(
  "/",
  check("firstName", "First Name is required").notEmpty(),
  check("lastName", "Last Name is required").notEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("platform", "Platform is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      platform,
      fcmToken,
      deviceId,
    } = req.body;

    try {
      // Check if user already exists
      connection.execute(
        "SELECT * FROM `users` WHERE `email` = ?",
        [email],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            // Email exists already, return
            return res
              .status(400)
              .json({ message: "You are already registered" });
          }

          // Insert new user
          const salt = await bcrypt.genSalt(10);
          let encryptedPassword = await bcrypt.hash(password, salt);

          connection.query(
            `INSERT INTO users
          (firstName, lastName, email, password)
          VALUES (?, ?, ?, ?)`,
            [firstName, lastName, email, encryptedPassword],
            async (err, result) => {
              if (err) {
                throw err;
              }

              console.log("..result", JSON.stringify(result));

              // Generate jwt token
              const payload = {
                user: {
                  id: result.insertId,
                  deviceId,
                },
              };

              const accessToken = await jwt.sign(
                payload,
                config.get("jwtSecret"),
                {
                  expiresIn: "30 days",
                }
              );

              // Insert row in usersDeviceInfo
              connection.query(
                `INSERT INTO usersDeviceInfo
                          (userId, platform, accessToken, deviceId, fcmToken)
                          VALUES (?, ?, ?, ?, ?)`,
                [result.insertId, platform, accessToken, deviceId, fcmToken],
                (err, result) => {
                  if (err) {
                    throw err;
                  }
                  res.json({
                    accessToken,
                    firstName,
                    lastName,
                    email,
                    isSubscribed: 0,
                  });
                }
              );
            }
          );
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
