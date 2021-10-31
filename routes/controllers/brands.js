const connection = require("../../config/connection");

/**
 * @description Get brand's featured videos
 * @param {Number} brandId
 */
const getBrandFeaturedVideos = async (brandId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT videos.id as id, categoryId, category, videoBanner, videoURL, title, duration, shortDescription, firstName, lastName FROM videos left join users on videos.coachId = users.id LEFT JOIN videoCategory on videos.categoryId = videoCategory.id WHERE videos.brandId=?;`,
        [brandId],
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
 * @description Get brand's featured videos
 * @param {Number} brandId
 */
const getBrandInstructors = async (brandId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT a.id, image, bio, bio_video, b.created, c.id as userId, c.firstName, c.lastName FROM coach_brands as a LEFT JOIN coachDetails as b ON a.coach_id=b.id LEFT JOIN users as c ON c.id=b.userId WHERE a.brand_id=?;`,
        [brandId],
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
  getBrandFeaturedVideos,
  getBrandInstructors,
};
