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
const { getUserById } = require("../../utils/methods");
const { json } = require("express");

// @route    POST api/subscription
// @desc     Add new subscription to user
// @access   Public
router.post(
  "/",
  auth,
  check("platform", "Platform is required").exists(),
  check("purchasedAmount", "Purchased amount is required").exists(),
  check("subscriptionPlan", "Subscription Plan is required").exists(),
  check("productId", "Product ID is required").exists(),
  check("startDate", "Start Date is required").exists(),
  check("endDate", "End Date is required").exists(),
  check("transactionId", "Transaction Date is required").exists(),
  check("transactionReceipt", "Transaction Receipt is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      platform,
      purchasedAmount,
      subscriptionPlan,
      productId,
      startDate,
      endDate,
      transactionId,
      transactionReceipt,
    } = req.body;

    try {
      // Insert record in usersSubscription
      connection.execute(
        `INSERT INTO usersSubscription (userId, platform, productId, purchasedAmount, subscriptionPlan, startDate,
        endDate) VALUES (?,?,?,?,?,?,?)
        `,
        [
          req.user.id,
          platform,
          productId,
          purchasedAmount,
          subscriptionPlan,
          startDate,
          endDate,
        ],
        async (err, result) => {
          if (err) {
            console.error(err);
            throw err;
          }

          // Insert record in subscriptionMeta
          connection.execute(
            `INSERT INTO subscriptionMeta (subscriptionId, transactionId, transactionReceipt) VALUES (?,?,?)`,
            [result.insertId, transactionId, transactionReceipt],
            async (err, result) => {
              if (err) {
                console.error(err);
                throw err;
              }
              // Update user's isSubscribed as 1
              connection.execute(
                `UPDATE users SET isSubscribed=1 WHERE id=?`,
                [req.user.id],
                async (err, result) => {
                  if (err) {
                    console.error(err);
                    throw err;
                  }
                  const user = await getUserById(req.user.id);
                  res.json({ success: true, ...user });
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
