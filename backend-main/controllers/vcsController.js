const {
  getCommitDetails,
  getCommitDiff,
  getDashboardData,
  getFileContent,
  listCommits,
  listFiles,
} = require("../services/vcs/queryService");

async function fetchDashboard(req, res) {
  try {
    const dashboard = await getDashboardData();
    res.json(dashboard);
  } catch (err) {
    console.error("Error during fetching dashboard : ", err.message);
    res.status(500).json({ error: err.message || "Unable to fetch dashboard" });
  }
}

async function fetchFiles(req, res) {
  try {
    const files = await listFiles();
    res.json(files);
  } catch (err) {
    console.error("Error during fetching files : ", err.message);
    res.status(500).json({ error: err.message || "Unable to fetch files" });
  }
}

async function fetchFileContent(req, res) {
  try {
    const file = await getFileContent(req.params.name);
    res.json(file);
  } catch (err) {
    console.error("Error during fetching file content : ", err.message);
    res.status(404).json({ error: err.message || "Unable to fetch file" });
  }
}

async function fetchCommits(req, res) {
  try {
    const commits = await listCommits();
    res.json(commits);
  } catch (err) {
    console.error("Error during fetching commits : ", err.message);
    res.status(500).json({ error: err.message || "Unable to fetch commits" });
  }
}

async function fetchCommitDetails(req, res) {
  try {
    const commit = await getCommitDetails(req.params.hash);
    res.json(commit);
  } catch (err) {
    console.error("Error during fetching commit details : ", err.message);
    res.status(404).json({ error: err.message || "Unable to fetch commit details" });
  }
}

async function fetchCommitDiff(req, res) {
  const { from, to } = req.query;

  try {
    const diff = await getCommitDiff(from, to);
    res.json(diff);
  } catch (err) {
    console.error("Error during fetching diff : ", err.message);
    res.status(500).json({ error: err.message || "Unable to fetch diff" });
  }
}

module.exports = {
  fetchCommitDetails,
  fetchCommitDiff,
  fetchCommits,
  fetchDashboard,
  fetchFileContent,
  fetchFiles,
};
