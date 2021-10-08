const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const {
  getUserById,
  getVideosByCategoryId,
  getRandomVideos,
} = require("../../utils/methods");

// @route    PUT api/videos/recommended
// @desc     Get recommended videos on homepage
// @access   Private
router.get("/recommended", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await getUserById(req.user.id);
    const { cardioConditioning, strength, flexibility, mentalWellness } = user;

    const recommended = [];
    let videos = [];

    if (cardioConditioning || strength || flexibility || mentalWellness) {
      if (cardioConditioning > 1) {
        videos = await getVideosByCategoryId(3);
        if (videos?.length) {
          recommended.push({
            text: "Because you want to improve cardio",
            category: "Cardio",
            videos,
          });
        }
      }

      if (strength > 1) {
        videos = await getVideosByCategoryId(5);
        if (videos?.length) {
          recommended.push({
            text: "Because you want to improve strength",
            category: "Strength",
            videos,
          });
        }
      }

      if (flexibility > 1) {
        videos = await getVideosByCategoryId(6);
        if (videos?.length) {
          recommended.push({
            text: "Because you want to improve flexibility",
            category: "Flexibility",
            videos,
          });
        }
      }

      if (mentalWellness > 1) {
        videos = await getVideosByCategoryId(7);
        if (videos?.length) {
          recommended.push({
            text: "Because you want to improve mental wellness",
            category: "Mental Wellness",
            videos,
          });
        }
      }
    } else {
      videos = await getRandomVideos();
      if (videos?.length) {
        recommended.push({
          text: "Recently Added",
          category: null,
          videos,
        });
      }
    }

    res.json({ recommended });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
