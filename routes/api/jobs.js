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

// @route    GET api/jobs
// @desc     Get job listing by userId
// @access   Public
router.get(
  "/getJobs",
  query("firmId", "Please include a valid firmId").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errResponse = {
        status: res.statusCode,
        data: [],
        error: errors.array()
      }
      return res.json(errResponse);
    }

    const { firmId } = req.query;

    try {
      // Get jobs
      connection.execute(
        `SELECT job.id, job.job_name as jobName, job.firmId,
          job.total_quantity, job.net_quantity, job.quantityType, job.dealValidFrom, job.dealValidUpto, 
          job.deliveryType, job.status, job.price,
          commodities.commodity, firm.firm_name as firmName, firm.address as firmAddress
          FROM job LEFT JOIN firm on job.firmId = firm.id
          LEFT JOIN commodities on commodities.id = job.commodityId
          WHERE job.firmId=?`,
        [firmId],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            const result = {
              status: res.statusCode,
              data: {
                jobs: rows,
                totalsRecords: rows.length
              }
            }
            res.json(result)
          } else {
            let errResponse = {
              status: res.statusCode,
              data: [],
              error: { msg: "No records found" }
            }
            return res.json(errResponse)
          }
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


// @route    POST api/jobs/submitJob
// @desc     Insert job meta by jobId
// @access   Public
router.post(
  "/submitJob",
  async (req, res) => {
    try {
      const {
        entryType,
        deliveryType,
        firmId,
        commodityId,
        previousSlip,
        currentSlip,
        userId,
        billNo,
        bill,
        grossWeight,
        tareWeight,
        netWeight } = req.body;

      const validateFields = validateForm(req.body);
      console.log(validateFields, "validateFields...")
      if (!validateFields?.flag) {
        return res.status(401).json({
          status: res.statusCode,
          error: { msg: validateFields?.errorMsg }
        });
      }
      connection.execute(
        `INSERT INTO jobMeta
          (entryType, deliveryType, firmId, commodityId, previousSlip, 
            currentSlip, bill, billNo, addedBy, grossWeight, tareWeight, netWeight)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [entryType, deliveryType, firmId, commodityId, previousSlip, currentSlip, bill,
          billNo, userId, grossWeight, tareWeight, netWeight],
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

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

function validateForm(params) {
  let flag = true;
  let errorMsg = "";
  if (!params?.entryType) {
    flag = false;
    errorMsg = "Entry type is missing."
  } else if (!params?.deliveryType) {
    flag = false;
    errorMsg = "Delivery type is missing."
  } else if (!params?.firmId) {
    flag = false;
    errorMsg = "Firm id is missing."
  } else if (!params?.commodityId) {
    flag = false;
    errorMsg = "Commodity id is missing."
  } else if (!params?.previousSlip) {
    flag = false;
    errorMsg = "Previous slip is missing."
  } else if (!params?.currentSlip) {
    flag = false;
    errorMsg = "Current slip is missing."
  } else if (!params?.bill) {
    flag = false;
    errorMsg = "Bill is missing."
  } else if (!params?.billNo) {
    flag = false;
    errorMsg = "Bill no. is missing."
  } else if (!params?.userId) {
    flag = false;
    errorMsg = "User id is missing."
  } else if (!params?.grossWeight) {
    flag = false;
    errorMsg = "Gross weight is missing."
  } else if (!params?.tareWeight) {
    flag = false;
    errorMsg = "Tare weight is missing."
  } else if (!params?.netWeight) {
    flag = false;
    errorMsg = "Net weight is missing."
  }

  return {
    flag,
    errorMsg
  }
}


module.exports = router;
