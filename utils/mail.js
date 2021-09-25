const nodemailer = require("nodemailer");

// const user = "ashishdeveloper62@gmail.com";
// const pass = "7206330362";

const user = "ashishdeveloper62@gmail.com";
const pass = "7206330362";

const sendMail = ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: user,
    to: to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { sendMail };
