import apiClient from "./client";

export async function fetchDashboard() {
  const { data } = await apiClient.get("/vcs/dashboard");
  return data;
}

export async function fetchFiles() {
  const { data } = await apiClient.get("/vcs/files");
  return data;
}

export async function fetchFileContent(name) {
  const { data } = await apiClient.get(`/vcs/files/${encodeURIComponent(name)}`);
  return data;
}

export async function fetchCommits() {
  const { data } = await apiClient.get("/vcs/commits");
  return data;
}

export async function fetchCommitDetails(hash) {
  const { data } = await apiClient.get(`/vcs/commits/${hash}`);
  return data;
}

export async function fetchDiff(fromHash, toHash) {
  const { data } = await apiClient.get("/vcs/diff", {
    params: { from: fromHash, to: toHash },
  });
  return data;
}
