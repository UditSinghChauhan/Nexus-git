const AWS = require("aws-sdk");

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const S3_BUCKET = process.env.S3_BUCKET || "";

AWS.config.update({ region: AWS_REGION });

const s3 = new AWS.S3();

module.exports = { s3, S3_BUCKET, AWS_REGION };
