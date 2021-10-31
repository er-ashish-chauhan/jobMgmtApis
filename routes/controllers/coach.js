const connection = require("../../config/connection");

/**
 * @description Get coach's latest videos
 * @param {Number} coachId
 * @param {Number} userId
 */
const isCoachFollowedByUser = async (coachId, userId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT EXISTS(SELECT * from coachFollowers WHERE coachId=? AND userId=?)`,
        [coachId, userId],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          return resolve(Boolean(rows[0][0]));
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Get coach's latest videos
 * @param {Number} coachId
 */
const getCoachLatestVideos = async (coachId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT videos.id, categoryId, category, videoBanner, videoURL, title, duration, shortDescription, firstName, lastName FROM videos left join coachDetails on coachDetails.id=videos.coachId left join users on coachDetails.userId = users.id LEFT JOIN videoCategory on videos.categoryId = videoCategory.id WHERE videos.coachId=?;`,
        [coachId],
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            return resolve(rows);
          } else {
            return resolve([]);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Toggle follow coach
 * @param {Number} coachId
 * @param {Number} userId
 * @param {Boolean} follow
 */
const toggleFollowCoach = async (coachId, userId, follow) => {
  return new Promise((resolve, reject) => {
    try {
      console.log({ coachId, userId });
      connection.execute(
        follow
          ? `INSERT INTO coachFollowers (coachId, userId) VALUES(?, ?)`
          : `DELETE FROM coachFollowers WHERE coachId=? AND USERID=?`,
        [coachId, userId],
        async (err, result) => {
          if (err) {
            console.error(err);
            throw err;
          }

          return resolve(follow);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  isCoachFollowedByUser,
  getCoachLatestVideos,
  toggleFollowCoach,
};
