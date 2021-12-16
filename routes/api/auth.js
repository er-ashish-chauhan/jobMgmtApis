const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");

// @route    POST api/auth
// @desc     Authenticate user & get accessToken
// @access   Public
router.post(
  "/",
  // check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Get user
      connection.execute(
        "SELECT * FROM `users` WHERE `email` = ? AND `role` = 3",
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
              return res
                .status(400)
                .json({
                  status: res.statusCode,
                  data: {},
                  error: { msg: "Invalid Credentials" },
                  message: "Invalid Credentials",
                });
            }

            const payload = {
              user: {
                id: rows[0].id,
              },
            };

            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: "60 days" },
              (err, accessToken) => {
                if (err) throw err;
                let data = { ...rows[0] }
                delete data['password']
                res.json(data)
              }
            );
          } else {
            return res
              .status(401)
              .json({ message: "Invalid username or password" });
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
