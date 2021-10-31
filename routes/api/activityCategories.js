const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const {
  getCategoryFeaturedVideos,
  getCategoryInstructors,
} = require("../controllers/activityCategories");

// @route    GET api/categories/:id
// @desc     Get category's featured videos, on-demand videos, instructors
// @access   Private
router.get("/:id", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const featuredVideos =
      (await getCategoryFeaturedVideos(req.params.id)) ?? [];

    // TODO
    const onDemandVideos =
      (await getCategoryFeaturedVideos(req.params.id)) ?? [];

    const instructors = (await getCategoryInstructors(req.params.id)) ?? [];

    res.json({ featuredVideos, onDemandVideos, instructors });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
