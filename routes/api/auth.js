const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const mail = require("../../utils/mail");
const jwt = require("jsonwebtoken");
const config = require("config");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const { getUserById, getUserBySocialId } = require("../../utils/methods");

// @route    GET api/auth
// @desc     Get user by accessToken
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    return res.json({ success: true, ...user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get accessToken
// @access   Public
router.post(
  "/",
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, deviceId, fcmToken, platform } = req.body;

    try {
      // Get user
      connection.execute(
        "SELECT * FROM `users` WHERE `email` = ?",
        [email],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            // User exists

            console.log("..user", JSON.stringify(rows));

            const isMatch = await bcrypt.compare(password, rows[0].password);

            if (!isMatch) {
              // Wrong password
              return res.status(400).json({
                errors: [{ msg: "Invalid Credentials" }],
                message: "Invalid Credentials",
              });
            }

            const payload = {
              user: {
                id: rows[0].id,
                deviceId,
              },
            };

            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: "30 days" },
              (err, accessToken) => {
                if (err) throw err;

                // Upsert record in usersDeviceInfo
                connection.execute(
                  `INSERT INTO usersDeviceInfo (userId, platform, accessToken, deviceId, fcmToken)
                values (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE platform=?, accessToken=?, fcmToken=?
                `,
                  [
                    rows[0].id,
                    platform,
                    accessToken,
                    deviceId,
                    fcmToken,
                    platform,
                    accessToken,
                    fcmToken,
                  ],
                  async (err, results) => {
                    if (err) {
                      console.error(err);
                      throw err;
                    }
                    const response = {
                      accessToken,
                      ...rows[0],
                    };
                    delete response.password;
                    res.json(response);
                  }
                );
              }
            );
          }
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    POST api/auth/social-login
// @desc     Login using Social Auth, Signup if user does not exist already
// @access   Public
router.post(
  "/social-login",
  check("social_id", "Please include a valid social_id").notEmpty(),
  check("social_id_type", "Please include a valid social_id_type").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      social_id_type,
      social_id,
      accessToken,
      deviceId,
      fcmToken,
      platform,
    } = req.body;

    // TODO - Authenticate accessToken from social_id

    try {
      // Get user
      const user = await getUserBySocialId(social_id_type, social_id);

      if (user) {
        // User exists, login user

        console.log("..user", JSON.stringify(user));

        const payload = {
          user: {
            id: user.id,
            deviceId,
          },
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: "30 days" },
          (err, accessToken) => {
            if (err) throw err;

            // Upsert record in usersDeviceInfo
            connection.execute(
              `INSERT INTO usersDeviceInfo (userId, platform, accessToken, deviceId, fcmToken)
            values (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE platform=?, accessToken=?, fcmToken=?
            `,
              [
                user.id,
                platform,
                accessToken,
                deviceId,
                fcmToken,
                platform,
                accessToken,
                fcmToken,
              ],
              async (err, results) => {
                if (err) {
                  console.error(err);
                  throw err;
                }
                const response = {
                  accessToken,
                  ...user,
                };

                return res.json(response);
              }
            );
          }
        );
      } else {
        // New user, register user

        connection.query(
          `INSERT INTO users
          (social_id, social_id_type)
          VALUES (?, ?)`,
          [social_id, social_id_type],
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
                  isSubscribed: 0,
                });
              }
            );
          }
        );
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    POST api/auth/logout
// @desc     Logout
// @access   Public
router.post("/logout", auth, async (req, res) => {
  const { deviceId } = req.body;
  console.log("..deviceId", deviceId);
  if (!deviceId) {
    return res.json({ success: true });
  }

  try {
    // Clear user's access token and fcmToken
    connection.execute(
      `UPDATE usersDeviceInfo SET accessToken=null, fcmToken=null WHERE userId=? AND deviceId=?
                `,
      [req.user.id, deviceId],
      async (err, results) => {
        if (err) {
          console.error(err);
          throw err;
        }
        console.log("..logout");
        res.json({ success: true });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/auth/forgot-password
// @desc     Forgot Password - Send password to user mail
// @access   Public
router.post(
  "/forgot-password",
  check("username", "Please include a valid email or username"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    try {
      // Get user
      connection.execute(
        "SELECT * FROM `users` WHERE `email` = ?",
        [username],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            // User exists

            console.log("..user", JSON.stringify(rows));

            const payload = {
              user: {
                id: rows[0].id,
              },
            };

            // Token for reset password
            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: "10 minutes" },
              (err, accessToken) => {
                if (err) throw err;

                mail.sendMail({
                  to: rows[0].email,
                  subject: "Reset SWEAT-DC password",
                  html: `
                <div>
                <h1>Reset Sweat-DC password</h1>
                <h2>You requested to reset your password</h2>
                Link is only valid for 10 minutes.
                <p>
                  <a href="${config.get(
                    "baseUrl"
                  )}forgot-password?token=${accessToken}">Reset Password</a>
                </p>
                </div>
                `,
                });

                res.json({
                  success: true,
                  message:
                    "A password reset link has been sent to your registered mail",
                });
              }
            );
          }
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
