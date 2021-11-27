const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken"); ``
const config = require("config");
const formidable = require("formidable");
const path = require('path')
const fs = require('fs')
const { query, check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const { root } = require('../../general')

// @route    GET api/common
// @desc     Get firms listing
// @access   Public
router.get(
    "/firms",
    //   query("userId", "Please include a valid userId").exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // const { userId } = req.query;

        try {
            // Get jobs
            connection.execute(
                `SELECT * FROM firm`,
                async (err, rows, fields) => {
                    if (err) {
                        console.error(err);
                        throw err;
                    }
                    if (rows.length) {
                        res.json(rows)
                    } else {
                        return res
                            .status(401)
                            .json({ message: "No records found" });
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
