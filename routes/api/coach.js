const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const {
  getCoachLatestVideos,
  isCoachFollowedByUser,
  toggleFollowCoach,
} = require("../controllers/coach");

// @route    GET api/coach/:id
// @desc     Get coach info
// @access   Private
router.get("/:id", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const isFollowed =
      (await isCoachFollowedByUser(req.params.id, req.user.id)) ?? false;
    const latestVideos = (await getCoachLatestVideos(req.params.id)) ?? [];

    res.json({ isFollowed, latestVideos });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/coach/:id/
// @desc     Toggle follow coach
// @access   Private
router.post("/:id/follow", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { follow } = req.body;

  try {
    const isFollowed =
      (await toggleFollowCoach(Number(req.params.id), req.user.id, follow)) ??
      false;

    res.json({ isFollowed });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
