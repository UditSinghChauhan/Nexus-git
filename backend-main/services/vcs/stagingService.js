const fs = require("fs").promises;
const path = require("path");
const { getStagingPath } = require("./paths");

async function addToStage(filePath) {
  const stagingPath = getStagingPath();

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath, fileName));
    console.log(`File ${fileName} added to the staging area!`);
  } catch (err) {
    console.error("Error adding file : ", err);
  }
}

module.exports = { addToStage };
