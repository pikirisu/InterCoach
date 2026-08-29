import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import jwt from "jsonwebtoken";
import { User } from "../src/modules/auth/user.model.js";
import { Resume } from "../src/modules/resume/resume.model.js";
import { JobDescription } from "../src/modules/jobDescription/jobDescription.model.js";

let app;
let server;
let baseUrl;
let tokenCounter = 0;

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await response.json();

  return { response, json };
};

const signToken = ({ userId, sessionVersion, secret, expiresIn, type }) =>
  jwt.sign(
    {
      _id: userId,
      sessionVersion,
      tokenId: `${type}-${++tokenCounter}`,
    },
    secret,
    { expiresIn },
  );

const signAccessToken = (userId, sessionVersion) =>
  signToken({
    userId,
    sessionVersion,
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    type: "access",
  });

const signRefreshToken = (userId, sessionVersion) =>
  signToken({
    userId,
    sessionVersion,
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    type: "refresh",
  });

const withPatchedModelMethods = async (Model, methods, callback) => {
  const originals = new Map();

  for (const [methodName, implementation] of Object.entries(methods)) {
    originals.set(methodName, Model[methodName]);
    Model[methodName] = implementation;
  }

  try {
    return await callback();
  } finally {
    for (const [methodName, original] of originals) {
      Model[methodName] = original;
    }
  }
};

const authHeaderForUser = (userId, sessionVersion) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${signAccessToken(userId, sessionVersion)}`,
});

const withAuthenticatedUser = (userId, sessionVersion, callback) =>
  withPatchedModelMethods(
    User,
    {
      findById: () => ({ _id: userId, sessionVersion }),
    },
    callback,
  );

const withPatchedUserMethods = async (methods, callback) => {
  const originals = new Map();

  for (const [methodName, implementation] of Object.entries(methods)) {
    originals.set(methodName, User[methodName]);
    User[methodName] = implementation;
  }

  try {
    return await callback();
  } finally {
    for (const [methodName, original] of originals) {
      User[methodName] = original;
    }
  }
};

test.before(async () => {
  process.env.ACCESS_TOKEN_SECRET ||= "test-access-token-secret";
  process.env.ACCESS_TOKEN_EXPIRY ||= "15m";
  process.env.REFRESH_TOKEN_SECRET ||= "test-refresh-token-secret";
  process.env.REFRESH_TOKEN_EXPIRY ||= "7d";

  ({ default: app } = await import("../src/app.js"));

  server = app.listen(0);
  await once(server, "listening");

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("healthcheck returns server and database status", async () => {
  const { response, json } = await requestJson("/api/v1/health");

  assert.equal(response.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.statusCode, 200);
  assert.equal(json.message, "Healthcheck passed");
  assert.equal(json.data.status, "ok");
  assert.equal(typeof json.data.database.readyState, "number");
  assert.equal(typeof json.data.database.status, "string");
});

test("register validation errors use the central error envelope", async () => {
  const { response, json } = await requestJson("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: "missing-fields@example.com" }),
  });

  assert.equal(response.status, 400);
  assert.equal(json.success, false);
  assert.equal(json.statusCode, 400);
  assert.equal(json.message, "All fields are required");
  assert.ok(Array.isArray(json.errors));
  assert.equal(Object.hasOwn(json, "data"), false);
});

test("protected resume routes reject missing bearer token", async () => {
  const { response, json } = await requestJson("/api/v1/resumes");

  assert.equal(response.status, 401);
  assert.equal(json.success, false);
  assert.equal(json.statusCode, 401);
  assert.equal(json.message, "Unauthorized");
});

test("refresh endpoint requires a refresh token", async () => {
  const { response, json } = await requestJson("/api/v1/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 401);
  assert.equal(json.success, false);
  assert.equal(json.statusCode, 401);
  assert.equal(json.message, "Refresh token is required");
});

test("refresh endpoint rotates the stored refresh token", async () => {
  const userId = "507f1f77bcf86cd799439011";
  const sessionVersion = 3;
  const incomingRefreshToken = signRefreshToken(userId, sessionVersion);
  const safeUser = {
    _id: userId,
    name: "Test User",
    email: "testuser@example.com",
  };
  const fakeUser = {
    _id: userId,
    sessionVersion,
    refreshToken: incomingRefreshToken,
    generateAccessToken() {
      return signAccessToken(this._id, this.sessionVersion);
    },
    generateRefreshToken() {
      return signRefreshToken(this._id, this.sessionVersion);
    },
    async save() {},
  };
  let findByIdCalls = 0;

  await withPatchedUserMethods(
    {
      findById() {
        findByIdCalls += 1;

        if (findByIdCalls === 1) {
          return fakeUser;
        }

        return {
          select: async () => safeUser,
        };
      },
    },
    async () => {
      const { response, json } = await requestJson(
        "/api/v1/auth/refresh-token",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: incomingRefreshToken }),
        },
      );

      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.statusCode, 200);
      assert.equal(json.message, "Access token refreshed successfully");
      assert.equal(json.data.user.email, safeUser.email);
      assert.equal(typeof json.data.accessToken, "string");
      assert.equal(typeof json.data.refreshToken, "string");
      assert.notEqual(json.data.refreshToken, incomingRefreshToken);
      assert.equal(fakeUser.refreshToken, json.data.refreshToken);
      assert.equal(Object.hasOwn(json.data.user, "password"), false);
      assert.equal(Object.hasOwn(json.data.user, "refreshToken"), false);
      assert.equal(Object.hasOwn(json.data.user, "sessionVersion"), false);
    },
  );
});

test("refresh token reuse invalidates the current session", async () => {
  const userId = "507f1f77bcf86cd799439012";
  const sessionVersion = 4;
  const staleRefreshToken = signRefreshToken(userId, sessionVersion);
  const fakeUser = {
    _id: userId,
    sessionVersion,
    refreshToken: signRefreshToken(userId, sessionVersion),
    async save() {},
  };

  await withPatchedUserMethods(
    {
      findById: () => fakeUser,
    },
    async () => {
      const { response, json } = await requestJson(
        "/api/v1/auth/refresh-token",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: staleRefreshToken }),
        },
      );

      assert.equal(response.status, 401);
      assert.equal(json.success, false);
      assert.equal(json.statusCode, 401);
      assert.equal(json.message, "Invalid refresh token");
      assert.equal(fakeUser.refreshToken, "");
      assert.equal(fakeUser.sessionVersion, sessionVersion + 1);
    },
  );
});

test("logout invalidates the current access-token session", async () => {
  const userId = "507f1f77bcf86cd799439013";
  const sessionVersion = 9;
  const accessToken = signAccessToken(userId, sessionVersion);
  const fakeUser = {
    _id: userId,
    sessionVersion,
    refreshToken: signRefreshToken(userId, sessionVersion),
    async save() {},
  };

  await withPatchedUserMethods(
    {
      findById: () => fakeUser,
    },
    async () => {
      const logoutResult = await requestJson("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      assert.equal(logoutResult.response.status, 200);
      assert.equal(logoutResult.json.success, true);
      assert.equal(logoutResult.json.statusCode, 200);
      assert.equal(logoutResult.json.message, "User logged out successfully");
      assert.equal(logoutResult.json.data.userId, userId);
      assert.equal(fakeUser.refreshToken, "");
      assert.equal(fakeUser.sessionVersion, sessionVersion + 1);

      const protectedResult = await requestJson("/api/v1/resumes", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      assert.equal(protectedResult.response.status, 401);
      assert.equal(protectedResult.json.success, false);
      assert.equal(protectedResult.json.message, "Unauthorized");
    },
  );
});

test("protected job-description routes reject missing bearer token", async () => {
  const { response, json } = await requestJson("/api/v1/job-descriptions");

  assert.equal(response.status, 401);
  assert.equal(json.success, false);
  assert.equal(json.message, "Unauthorized");
});

test("job description create validation requires title and text", async () => {
  const userId = "507f1f77bcf86cd799439021";
  const sessionVersion = 0;

  await withAuthenticatedUser(userId, sessionVersion, async () => {
    const { response, json } = await requestJson("/api/v1/job-descriptions", {
      method: "POST",
      headers: authHeaderForUser(userId, sessionVersion),
      body: JSON.stringify({ title: "Backend Engineer" }),
    });

    assert.equal(response.status, 400);
    assert.equal(json.success, false);
    assert.equal(json.message, "Title and job description text are required");
  });
});

test("job description detail rejects a malformed id before touching the database", async () => {
  const userId = "507f1f77bcf86cd799439022";
  const sessionVersion = 0;

  await withAuthenticatedUser(userId, sessionVersion, async () => {
    const { response, json } = await requestJson("/api/v1/job-descriptions/not-an-id", {
      headers: authHeaderForUser(userId, sessionVersion),
    });

    assert.equal(response.status, 400);
    assert.equal(json.success, false);
    assert.equal(json.message, "Invalid job description id");
  });
});

test("job description detail returns 404 for another user's document", async () => {
  const userId = "507f1f77bcf86cd799439023";
  const sessionVersion = 0;
  const jobDescriptionId = "507f1f77bcf86cd799439099";

  await withAuthenticatedUser(userId, sessionVersion, () =>
    withPatchedModelMethods(
      JobDescription,
      {
        findOne: () => null,
      },
      async () => {
        const { response, json } = await requestJson(
          `/api/v1/job-descriptions/${jobDescriptionId}`,
          {
            headers: authHeaderForUser(userId, sessionVersion),
          },
        );

        assert.equal(response.status, 404);
        assert.equal(json.success, false);
        assert.equal(json.message, "Job description not found");
      },
    ),
  );
});

test("protected match routes reject missing bearer token", async () => {
  const { response, json } = await requestJson(
    "/api/v1/matches/resume/507f1f77bcf86cd799439099",
  );

  assert.equal(response.status, 401);
  assert.equal(json.success, false);
  assert.equal(json.message, "Unauthorized");
});

test("match creation rejects a malformed resume id before touching the database", async () => {
  const userId = "507f1f77bcf86cd799439024";
  const sessionVersion = 0;
  const jobDescriptionId = "507f1f77bcf86cd799439099";

  await withAuthenticatedUser(userId, sessionVersion, async () => {
    const { response, json } = await requestJson(
      `/api/v1/matches/resume/not-an-id/job-description/${jobDescriptionId}`,
      {
        method: "POST",
        headers: authHeaderForUser(userId, sessionVersion),
      },
    );

    assert.equal(response.status, 400);
    assert.equal(json.success, false);
    assert.equal(json.message, "Invalid resume id");
  });
});

test("match creation rejects a resume owned by another user", async () => {
  const userId = "507f1f77bcf86cd799439025";
  const sessionVersion = 0;
  const resumeId = "507f1f77bcf86cd799439098";
  const jobDescriptionId = "507f1f77bcf86cd799439099";

  await withAuthenticatedUser(userId, sessionVersion, () =>
    withPatchedModelMethods(
      Resume,
      {
        findById: () => ({
          select: async () => ({
            _id: resumeId,
            user: "507f1f77bcf86cd799439000",
            extractedText: "Experienced engineer.",
          }),
        }),
      },
      async () => {
        const { response, json } = await requestJson(
          `/api/v1/matches/resume/${resumeId}/job-description/${jobDescriptionId}`,
          {
            method: "POST",
            headers: authHeaderForUser(userId, sessionVersion),
          },
        );

        assert.equal(response.status, 403);
        assert.equal(json.success, false);
        assert.equal(json.message, "Not authorized");
      },
    ),
  );
});

test("unknown routes return a normalized 404", async () => {
  const { response, json } = await requestJson("/api/v1/nope");

  assert.equal(response.status, 404);
  assert.equal(json.success, false);
  assert.equal(json.statusCode, 404);
  assert.match(json.message, /Route not found/);
});
