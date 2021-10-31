const connection = require("../../config/connection");

/**
 * @description Get videos by categoryId
 * @param {Number} id
 */
const getVideosByCategoryId = async (categoryId) => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT categoryId, videoBanner, videoURL, title, duration, shortDescription, firstName, lastName FROM videos left join users on videos.coachId = users.id where videos.categoryId=? ORDER BY videos.created DESC LIMIT 3;`,
        [categoryId],
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

          return reject("Something went wrong");
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Get random videos
 * @param {Number} id
 */
const getRandomVideos = async () => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT categoryId, category, videoBanner, videoURL, title, duration, shortDescription, firstName, lastName FROM videos left join users on videos.coachId = users.id LEFT JOIN videoCategory on videos.categoryId = videoCategory.id ORDER BY RAND() LIMIT 6;`,
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

          return reject("Something went wrong");
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Get recommended brands
 */
const getRecommendedBrands = async () => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT id, brand_name, brand_logo, brand_cover from brands;`,
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            return resolve(rows);
          }
          return resolve();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Get recommended categories
 */
const getRecommendedCategories = async () => {
  return new Promise((resolve, reject) => {
    try {
      connection.execute(
        `SELECT id, category_name, category_image, cover_image from activityCategories;`,
        async (err, rows, fields) => {
          if (err) {
            console.error(err);
            throw err;
          }

          if (rows.length) {
            return resolve(rows);
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
  getVideosByCategoryId,
  getRandomVideos,
  getRecommendedBrands,
  getRecommendedCategories,
};
