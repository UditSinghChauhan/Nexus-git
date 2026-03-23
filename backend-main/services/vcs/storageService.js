const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../../config/aws-config");
const {
  BRANCHES_FILE_NAME,
  HEAD_FILE_NAME,
  DEFAULT_BRANCH_NAME,
  ensureBranchState,
  getLatestCommitMetadata,
  writeHead,
  writeBranches,
} = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath } = require("./paths");

async function pushRepository() {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();
  const headPath = path.join(repoPath, HEAD_FILE_NAME);
  const branchesPath = path.join(repoPath, BRANCHES_FILE_NAME);

  try {
    const commitDirs = await fs.readdir(commitsPath);
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();
      }
    }

    try {
      const headContent = await fs.readFile(headPath);
      await s3
        .upload({
          Bucket: S3_BUCKET,
          Key: HEAD_FILE_NAME,
          Body: headContent,
        })
        .promise();
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    try {
      const branchesContent = await fs.readFile(branchesPath);
      await s3
        .upload({
          Bucket: S3_BUCKET,
          Key: BRANCHES_FILE_NAME,
          Body: branchesContent,
        })
        .promise();
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    console.log("All commits pushed to S3.");
  } catch (err) {
    console.error("Error pushing to S3 : ", err);
  }
}

async function pullRepository() {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();

  try {
    await fs.mkdir(commitsPath, { recursive: true });

    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: "commits/",
      })
      .promise();

    const objects = data.Contents || [];

    for (const object of objects) {
      const key = object.Key;
      const commitDir = path.join(
        commitsPath,
        path.dirname(key).split("/").pop()
      );

      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();
      await fs.writeFile(path.join(repoPath, key), fileContent.Body);
    }

    try {
      const headObject = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: HEAD_FILE_NAME,
        })
        .promise();
      await fs.writeFile(path.join(repoPath, HEAD_FILE_NAME), headObject.Body);
    } catch (err) {
      if (err.code !== "NoSuchKey") {
        throw err;
      }

      const latestCommit = await getLatestCommitMetadata(repoPath);
      await writeHead(repoPath, DEFAULT_BRANCH_NAME);
      await writeBranches(repoPath, {
        [DEFAULT_BRANCH_NAME]: latestCommit ? latestCommit.hash : null,
      });
    }

    try {
      const branchesObject = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: BRANCHES_FILE_NAME,
        })
        .promise();
      await fs.writeFile(
        path.join(repoPath, BRANCHES_FILE_NAME),
        branchesObject.Body
      );
    } catch (err) {
      if (err.code !== "NoSuchKey") {
        throw err;
      }

      await ensureBranchState(repoPath);
    }

    console.log("All commits pulled from S3.");
  } catch (err) {
    console.error("Unable to pull : ", err);
  }
}

module.exports = {
  pullRepository,
  pushRepository,
};
