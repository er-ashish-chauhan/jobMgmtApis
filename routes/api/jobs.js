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


// @route    POST api/jobs
// @desc     Insert job meta by jobId
// @access   Public
router.post(
  "/:jobId",
  async (req, res) => {
    try {

      const { jobId } = req.params;

      const form = formidable({
        keepExtensions: true,
        // maxFileSize: 15 * 1024 * 1024,
        uploadDir: root + "/tmp",
      });
      form.parse(req, (err, fields, files) => {
        let response = {};
        // check for any error if err. then return with a message
        if (err) {
          response.status = "error";
          response.msg = err.message;
          return res.status(400).json(response);
        }
        // file upload code
        const oldpath = files.image.path;
        const ext = path.extname(files.image.path);
        const file_name = "job_" + Date.now() + ext;
        const newpath = path.join(root, "/uploads/") + file_name;

        // rename file to a upload folder
        fs.rename(oldpath, newpath, async function (err) {
          if (err) throw err;

          connection.execute(
            `INSERT INTO jobMeta
            (jobId, image, quantityConfirmed)
            VALUES(?, ?, ?)`,
            [jobId, newpath, fields.quantityConfirmed],
            async (err, result) => {
              if (err) {
                console.error(err);
                throw err;
              }

              res.json({ success: true })
            }
          );

        });
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
