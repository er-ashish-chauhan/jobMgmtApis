const connection = require("../../config/connection");

/**
 * @description Get user details by id
 * @param {Number} id
 */
const getUserById = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT a.id, a.firstName, a.lastName, a.email, a.contact, a.profileImage, a.dob, a.role,
          a.isSubscribed, a.isActive, a.isDeleted, b.weight, b.height, b.gender, b.cardioConditioning, 
          b.strength, b.flexibility, b.mentalWellness FROM users as a LEFT JOIN userMeta as b 
          ON a.id=b.userId WHERE a.id=?;`,
        [id],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            return resolve(rows[0]);
          }

          return reject("Please login again");
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Get user details by id
 * @param {Number} id
 */
const getUserBySocialId = async (social_id_type, social_id) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT a.id, a.firstName, a.lastName, a.email, a.contact, a.profileImage, a.dob, a.role,
          a.isSubscribed, a.isActive, a.isDeleted, b.weight, b.height, b.gender, b.cardioConditioning, 
          b.strength, b.flexibility, b.mentalWellness FROM users as a LEFT JOIN userMeta as b 
          ON a.id=b.userId WHERE a.social_id_type=? AND a.social_id=?;`,
        [social_id_type, social_id],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            return resolve(rows[0]);
          }
          return resolve();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getUserById,
  getUserBySocialId,
};
