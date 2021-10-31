const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const {
  getBrandFeaturedVideos,
  getBrandInstructors,
} = require("../controllers/brands");

// @route    GET api/brands/:id
// @desc     Get brand's featured videos, on-demand videos, instructors
// @access   Private
router.get("/:id", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const featuredVideos = (await getBrandFeaturedVideos(req.params.id)) ?? [];

    // TODO
    const onDemandVideos = (await getBrandFeaturedVideos(req.params.id)) ?? [];

    const instructors = (await getBrandInstructors(req.params.id)) ?? [];

    res.json({ featuredVideos, onDemandVideos, instructors });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
