const fs = require("fs").promises;
const path = require("path");
const {
  getBranchHead,
  getCommitMetadataByHash,
  getCurrentBranch,
  hasBranch,
} = require("../../utils/commitMetadata");
const { createCommitFromStage } = require("./commitService");
const { getCommitsPath, getRepoPath, getStagingPath } = require("./paths");

function getParentHashes(commitMetadata) {
  if (!commitMetadata) {
    return [];
  }

  return [commitMetadata.parent1 || commitMetadata.parent, commitMetadata.parent2].filter(
    Boolean
  );
}

async function readCommitSnapshot(repoPath, commitHash) {
  const snapshot = new Map();
  if (!commitHash) {
    return snapshot;
  }

  const commitDir = path.join(getCommitsPath(), commitHash);
  const files = await fs.readdir(commitDir);

  for (const file of files) {
    if (file === "commit.json") {
      continue;
    }

    snapshot.set(file, await fs.readFile(path.join(commitDir, file)));
  }

  return snapshot;
}

async function collectAncestorSet(repoPath, startHash) {
  const ancestors = new Set();
  const queue = [startHash];

  while (queue.length > 0) {
    const currentHash = queue.shift();
    if (!currentHash || ancestors.has(currentHash)) {
      continue;
    }

    ancestors.add(currentHash);
    const metadata = await getCommitMetadataByHash(repoPath, currentHash);
    queue.push(...getParentHashes(metadata));
  }

  return ancestors;
}

async function findCommonAncestor(repoPath, leftHash, rightHash) {
  if (!leftHash || !rightHash) {
    return null;
  }

  const leftAncestors = await collectAncestorSet(repoPath, leftHash);
  const queue = [rightHash];
  const visited = new Set();

  while (queue.length > 0) {
    const currentHash = queue.shift();
    if (!currentHash || visited.has(currentHash)) {
      continue;
    }

    if (leftAncestors.has(currentHash)) {
      return currentHash;
    }

    visited.add(currentHash);
    const metadata = await getCommitMetadataByHash(repoPath, currentHash);
    queue.push(...getParentHashes(metadata));
  }

  return null;
}

function buffersEqual(leftBuffer, rightBuffer) {
  if (!leftBuffer && !rightBuffer) {
    return true;
  }

  if (!leftBuffer || !rightBuffer) {
    return false;
  }

  return leftBuffer.equals(rightBuffer);
}

function buildConflictContent(currentBranch, sourceBranch, targetBuffer, sourceBuffer) {
  const targetContent = targetBuffer ? targetBuffer.toString("utf-8") : "";
  const sourceContent = sourceBuffer ? sourceBuffer.toString("utf-8") : "";

  return Buffer.from(
    [
      `<<<<<<< ${currentBranch}`,
      targetContent,
      "=======",
      sourceContent,
      `>>>>>>> ${sourceBranch}`,
      "",
    ].join("\n"),
    "utf-8"
  );
}

async function writeSnapshotToWorkingTree(snapshot) {
  const repoPath = getRepoPath();
  const stagingPath = getStagingPath();
  const workingTreeRoot = path.resolve(repoPath, "..");

  await fs.mkdir(stagingPath, { recursive: true });

  for (const [fileName, fileBuffer] of snapshot.entries()) {
    await fs.writeFile(path.join(workingTreeRoot, fileName), fileBuffer);
    await fs.writeFile(path.join(stagingPath, fileName), fileBuffer);
  }
}

async function mergeBranch(sourceBranch) {
  const repoPath = getRepoPath();

  try {
    const currentBranch = await getCurrentBranch(repoPath);
    if (sourceBranch === currentBranch) {
      throw new Error("Cannot merge a branch into itself.");
    }

    if (!(await hasBranch(repoPath, sourceBranch))) {
      throw new Error(`Branch ${sourceBranch} does not exist.`);
    }

    const targetHead = await getBranchHead(repoPath, currentBranch);
    const sourceHead = await getBranchHead(repoPath, sourceBranch);

    if (!sourceHead) {
      console.log(`Branch ${sourceBranch} has no commits to merge.`);
      return;
    }

    if (!targetHead) {
      console.log(`Current branch ${currentBranch} has no commits to merge into.`);
      return;
    }

    const commonAncestor = await findCommonAncestor(repoPath, targetHead, sourceHead);
    const ancestorSnapshot = await readCommitSnapshot(repoPath, commonAncestor);
    const targetSnapshot = await readCommitSnapshot(repoPath, targetHead);
    const sourceSnapshot = await readCommitSnapshot(repoPath, sourceHead);
    const mergedSnapshot = new Map(targetSnapshot);
    const conflicts = [];

    const allFiles = new Set([
      ...ancestorSnapshot.keys(),
      ...targetSnapshot.keys(),
      ...sourceSnapshot.keys(),
    ]);

    for (const fileName of allFiles) {
      const ancestorBuffer = ancestorSnapshot.get(fileName) || null;
      const targetBuffer = targetSnapshot.get(fileName) || null;
      const sourceBuffer = sourceSnapshot.get(fileName) || null;

      if (buffersEqual(targetBuffer, sourceBuffer)) {
        if (targetBuffer) {
          mergedSnapshot.set(fileName, targetBuffer);
        }
        continue;
      }

      if (buffersEqual(targetBuffer, ancestorBuffer)) {
        if (sourceBuffer) {
          mergedSnapshot.set(fileName, sourceBuffer);
        }
        continue;
      }

      if (buffersEqual(sourceBuffer, ancestorBuffer)) {
        if (targetBuffer) {
          mergedSnapshot.set(fileName, targetBuffer);
        }
        continue;
      }

      conflicts.push(fileName);
      mergedSnapshot.set(
        fileName,
        buildConflictContent(currentBranch, sourceBranch, targetBuffer, sourceBuffer)
      );
    }

    await writeSnapshotToWorkingTree(mergedSnapshot);

    if (conflicts.length > 0) {
      console.log(`Merge conflict detected in: ${conflicts.join(", ")}`);
      console.log("Resolve the conflict markers manually before creating a commit.");
      return;
    }

    await createCommitFromStage({
      currentBranch,
      message: `Merge branch ${sourceBranch} into ${currentBranch}`,
      parent1: targetHead,
      parent2: sourceHead,
      repoPath,
    });

    console.log(
      `Merged ${sourceBranch} into ${currentBranch} using common ancestor ${commonAncestor || "none"}.`
    );
  } catch (err) {
    console.error("Unable to merge branch : ", err.message || err);
  }
}

module.exports = {
  findCommonAncestor,
  mergeBranch,
};
