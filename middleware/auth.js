const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get accessToken from header
  const accessToken = req.header("Authorization")?.split(" ")[1];

  // Check if not token
  if (!accessToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    jwt.verify(accessToken, config.get("jwtSecret"), (error, decoded) => {
      if (error) {
        console.log("...Error", error);
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};
