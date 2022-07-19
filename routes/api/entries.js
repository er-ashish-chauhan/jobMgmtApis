const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const path = require('path')
const fs = require('fs')
const { query, check, validationResult } = require("express-validator");

const connection = require("../../config/connection");
const { root } = require('../../general')


// @route    POST api/entries/add
// @desc     Insert entry against the bargain
// @access   Public
router.post(
    "/add",
    async (req, res) => {
        try {
            const request = req.body;
            const bargainDetails = request?.bargain;
            const deliveryType = formatVariable(bargainDetails?.deliveryType);
            const firmId = formatVariable(bargainDetails?.party);
            const commodityId = formatVariable(bargainDetails?.commodityId);
            const userId = formatVariable(request?.userId);
            const billNo = formatVariable(request?.billNo);
            const coparty = formatVariable(request?.coparty);
            const noofbags = formatVariable(request?.noofbags);
            const truckNo = formatVariable(request?.truckNo);
            const bargainId = formatVariable(bargainDetails?.id);
            const b_rate = formatVariable(bargainDetails?.rate);
            const quantity = formatVariable(request?.quantity);
            const entryDate = formatVariable(request?.entryDate);

            const validateFields = validateForm(req.body);
            if (!validateFields?.flag) {
                return res.status(401).json({
                    status: res.statusCode,
                    error: { msg: validateFields?.errorMsg }
                });
            }

            var bargainRemaining = bargainDetails?.remaining_quantity - quantity;

            if (bargainRemaining <= 0) {
                return res.status(401).json({
                    status: res.statusCode,
                    error: { msg: "Don\'t have enough quanity to update. Please update the bargain quantity." }
                });
            }

            await connection.execute(
                `INSERT INTO entries_out
                (deliveryType, firmId, commodityId, billNo, userId, coparty, bags, truckNo, jobId,
                     rate, quantity, entryDate) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [deliveryType, firmId, commodityId, billNo, userId, coparty, noofbags, truckNo,
                    bargainId, b_rate, quantity, entryDate],
                async (err, rows, fields) => {
                    if (err) {
                        console.error(err);
                        throw err;
                    }

                    connection.execute(
                        `UPDATE bargains_out SET remaining_quantity=` + bargainRemaining + ` WHERE id =` + bargainDetails?.id,
                        async (err, result) => {
                            if (err) {
                                console.error(err);
                                throw err;
                            }

                            res.json({
                                status: res.statusCode,
                                data: {},
                                success: {
                                    msg: "Entry added successfully."
                                }
                            })
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

function formatVariable(str) {
    return !str ? null : str
}

function validateForm(params) {
    let flag = true;
    let errorMsg = "";
    if (!params?.bargain) {
        flag = false;
        errorMsg = "Bargain details are missing."
    } else if (!params?.billNo) {
        flag = false;
        errorMsg = "Bill no. is missing."
    } else if (!params?.userId) {
        flag = false;
        errorMsg = "User id is missing."
    } else if (!params?.noofbags) {
        flag = false;
        errorMsg = "No. of bags are missing."
    } else if (!params?.truckNo) {
        flag = false;
        errorMsg = "Truck no. is missing."
    } else if (!params?.quantity) {
        flag = false;
        errorMsg = "Quantity is missing."
    } else if (!params?.entryDate) {
        flag = false;
        errorMsg = "Entry date is missing."
    } else if (!params?.coparty) {
        flag = false;
        errorMsg = "Coparty id is missing."
    }

    return {
        flag,
        errorMsg
    }
}


module.exports = router;
