const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const authenticate = require("../middleware/authMiddleware");
const {
  authorizeSelf,
  authorizeRepoOwner,
} = require("../middleware/authorizeMiddleware");

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

test("authenticate rejects requests without a token", () => {
  const req = { headers: {} };
  const res = createResponseRecorder();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { message: "No token provided" });
});

test("authenticate accepts valid bearer tokens and sets req.userId", () => {
  process.env.JWT_SECRET_KEY = "test-secret";
  const token = jwt.sign({ id: "user-123" }, process.env.JWT_SECRET_KEY);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponseRecorder();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.userId, "user-123");
});

test("authorizeSelf rejects mismatched route ids", () => {
  const req = {
    userId: "owner-1",
    params: { id: "owner-2" },
    body: {},
  };
  const res = createResponseRecorder();
  let nextCalled = false;

  authorizeSelf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.payload.message, /Forbidden/);
});

test("authorizeSelf allows matching route ids", () => {
  const req = {
    userId: "owner-1",
    params: { id: "owner-1" },
    body: {},
  };
  const res = createResponseRecorder();
  let nextCalled = false;

  authorizeSelf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.payload, null);
});

test("authorizeRepoOwner rejects requests when no user is authenticated", async () => {
  const req = { userId: null, params: { id: "repo-1" } };
  const res = createResponseRecorder();
  let nextCalled = false;

  await authorizeRepoOwner(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { message: "Unauthorized" });
});
