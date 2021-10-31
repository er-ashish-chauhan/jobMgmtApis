const connection = require("../../config/connection");

/**
 * @description Get activityCategory's featured videos
 * @param {Number} activityCategoryId
 */
const getCategoryFeaturedVideos = async (activityCategoryId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT videos.id as id, categoryId, category, videoBanner, videoURL, title, duration, shortDescription, firstName, lastName FROM videos left join users on videos.coachId = users.id LEFT JOIN videoCategory on videos.categoryId = videoCategory.id WHERE videos.activityCategoryId=?;`,
        [activityCategoryId],
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
 * @description Get activityCategory's instructors
 * @param {Number} activityCategoryId
 */
const getCategoryInstructors = async (activityCategoryId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT coachId as id, activityCategoryId, userId, image, bio, bio_video, firstName, lastName FROM videos
        INNER JOIN coachDetails ON videos.coachId=coachDetails.id 
        INNER JOIN users on users.id=coachDetails.userId
        GROUP BY coachDetails.userId HAVING activityCategoryId=?;`,
        [activityCategoryId],
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

module.exports = {
  getCategoryFeaturedVideos,
  getCategoryInstructors,
};
