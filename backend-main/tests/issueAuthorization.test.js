const test = require("node:test");
const assert = require("node:assert/strict");

const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");
const { authorizeIssueOwner } = require("../middleware/authorizeMiddleware");
const issueRouter = require("../routes/issue.router");

function createResponseRecorder() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

function stubFindById(model, result) {
  const original = model.findById;
  model.findById = () => ({ select: async () => result });
  return () => {
    model.findById = original;
  };
}

test("authorizeIssueOwner rejects requests when no user is authenticated", async () => {
  const req = { userId: null, params: { id: "issue-1" } };
  const res = createResponseRecorder();
  let nextCalled = false;

  await authorizeIssueOwner(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { message: "Unauthorized" });
});

test("authorizeIssueOwner rejects a user who does not own the issue's repository", async () => {
  const restoreIssue = stubFindById(Issue, { repository: "repo-1" });
  const restoreRepo = stubFindById(Repository, { owner: "owner-1" });

  try {
    const req = { userId: "owner-2", params: { id: "issue-1" } };
    const res = createResponseRecorder();
    let nextCalled = false;

    await authorizeIssueOwner(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.payload.message, /Forbidden/);
  } finally {
    restoreIssue();
    restoreRepo();
  }
});

test("authorizeIssueOwner allows the owner of the issue's repository", async () => {
  const restoreIssue = stubFindById(Issue, { repository: "repo-1" });
  const restoreRepo = stubFindById(Repository, { owner: "owner-1" });

  try {
    const req = { userId: "owner-1", params: { id: "issue-1" } };
    const res = createResponseRecorder();
    let nextCalled = false;

    await authorizeIssueOwner(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.payload, null);
    assert.deepEqual(req.issue, { repository: "repo-1" });
  } finally {
    restoreIssue();
    restoreRepo();
  }
});

test("authorizeIssueOwner returns 404 for a missing issue", async () => {
  const restoreIssue = stubFindById(Issue, null);

  try {
    const req = { userId: "owner-1", params: { id: "missing" } };
    const res = createResponseRecorder();
    let nextCalled = false;

    await authorizeIssueOwner(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.payload, { message: "Issue not found!" });
  } finally {
    restoreIssue();
  }
});

test("every issue route is mounted behind authentication and an authorization guard", () => {
  const layers = issueRouter.stack.filter((layer) => layer.route);

  assert.equal(layers.length, 5, "expected five issue routes");

  for (const layer of layers) {
    const handlerNames = layer.route.stack.map((entry) => entry.name);
    assert.ok(
      handlerNames.includes("authorizeRepoOwner") ||
        handlerNames.includes("authorizeIssueOwner"),
      `route ${layer.route.path} is missing an authorization guard`
    );
  }

  // `authenticate` is mounted router-wide, so it appears as a non-route layer.
  const routerWideHandlers = issueRouter.stack
    .filter((layer) => !layer.route)
    .map((layer) => layer.handle.name);

  assert.ok(
    routerWideHandlers.includes("authenticate"),
    "issue router is missing router-wide authentication"
  );
});
