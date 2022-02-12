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
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder } = require('agora-access-token');
const dotenv = require('dotenv');

const connection = require("../../config/connection");
const { root } = require('../../general')

// var admin = require("firebase-admin");
const FIREBASE_SERVER_KEY = "AAAA0hjZ4kQ:APA91bHbZ9-1DPhGGs2V-2EcbJym7EH1jEQqjaVm9XgJ2hxFPNJdjCDcmMR1Kph5G-oPsQpCnqPHE7F3f0Fab1KMxyypB5nQ-v49KqvmpIzPR0VgesRLST1Iq3bURp6N7bhheYLyLcsn";
var FCM = require('fcm-node');
const { RtmRole } = require("agora-access-token");
var fcm = new FCM(FIREBASE_SERVER_KEY);

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
                            .json({
                                status: res.statusCode,
                                data: {},
                                error: { msg: "No records found" }
                            });
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
                            .json({
                                status: res.statusCode,
                                data: {},
                                error: { msg: "No records found" }
                            });
                    }
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

// @route    POST api/common/uploadImage
// @desc     Upload image and return image url
// @access   Public
router.post(
    "/uploadImage",
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
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
                if (!files?.image) {
                    return res.status(400).json({
                        status: res.statusCode,
                        data: {},
                        error: { msg: "Please upload a file." }
                    });
                }
                const oldpath = files.image.path;
                const ext = path.extname(files.image.path);
                const file_name = "job_" + Date.now() + ext;
                const newpath = path.join(root, "/uploads/") + file_name;

                // rename file to a upload folder
                fs.rename(oldpath, newpath, async function (err) {
                    if (err) throw err;
                    const imagePath = newpath.split("/");
                    imagePath.splice(0, 4)
                    const result = {
                        status: res.statusCode,
                        data: {
                            image: imagePath.join().replaceAll(",", "/"),
                            message: "Image uploaded successfully."
                        }
                    }
                    res.json(result)
                });
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/sendPush",
    async (req, res) => {
        const { userToken, notifymessage } = req.body;
        try {
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: userToken,
                notification: {
                    title: 'Aseiko Skin',
                    body: notifymessage
                },
                data: {}
            };

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!");
                    const result = {
                        status: res.statusCode,
                        data: {
                            message: "Something has gone wrong!"
                        }
                    }
                    res.json(result)
                } else {
                    const result = {
                        status: res.statusCode,
                        data: {
                            message: "notification sent successfully."
                        }
                    }
                    res.json(result)
                    console.log("Successfully sent with response: ", response);
                }
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.get(
    "/agoraRTMToken",
    async (req, res) => {
        const APP_ID = "4fe1aedc2e6c43acb8116dc8a0fe2c21";
        const APP_CERTIFICATE = "be45c73403334fc18726c1b8a3ed3393";
        const PORT = 8080;
        const expireTime = 3600;
        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;

        const { udid } = req.query;
        console.log(udid, "udid")
        try {
            let token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, udid, RtmRole.Rtm_User, privilegeExpireTime);
            const result = {
                status: res.statusCode,
                data: {
                    rtmToken: token,
                    message: "Token generated successfully!"
                }
            }
            res.json(result)
            // let token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, udid, role, privilegeExpireTime);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);


router.get(
    "/agoraRTCToken",
    async (req, res) => {
        const APP_ID = "4fe1aedc2e6c43acb8116dc8a0fe2c21";
        const APP_CERTIFICATE = "be45c73403334fc18726c1b8a3ed3393";
        const PORT = 8080;
        const expireTime = 3600;
        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;

        const { udid, role, channel } = req.query;
        console.log(udid, "udid")
        try {
            let token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channel, udid,
                role == "1" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER, privilegeExpireTime);
            const result = {
                status: res.statusCode,
                data: {
                    rtcToken: token,
                    message: "Token generated successfully!"
                }
            }
            res.json(result)
            // let token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, udid, role, privilegeExpireTime);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
module.exports = router;
