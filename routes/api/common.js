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

// @route    GET api/common/firms
// @desc     Get firms listing
// @access   Public
router.get(
    "/firms",
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { searchText } = req.query;

        try {

            const queryForExecute = searchText ? 'SELECT * FROM firm Where firm_name like "%' + searchText + '%"'
                : `SELECT * FROM firm`

            // Get firms
            connection.execute(
                queryForExecute,
                async (err, rows, fields) => {
                    if (err) {
                        console.error(err);
                        throw err;
                    }
                    if (rows.length) {
                        const result = {
                            status: res.statusCode,
                            data: {
                                firms: rows,
                                totalRecords: rows.length
                            },
                        }
                        res.json(result)
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

// @route    GET api/common/commodities
// @desc     Get firms listing
// @access   Public
router.get(
    "/commodities",
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Get commodities
            connection.execute(
                `SELECT * FROM commodities`,
                async (err, rows, fields) => {
                    if (err) {
                        console.error(err);
                        throw err;
                    }
                    if (rows.length) {
                        const result = {
                            status: res.statusCode,
                            data: {
                                commodities: rows,
                                totalRecords: rows.length
                            }
                        }
                        res.json(result)
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
