const jwt = require("jsonwebtoken");

/**
 * Verify JWT from `Authorization: Bearer <token>` header.
 * On success sets `req.userId` to the token subject and calls `next()`.
 * On failure returns 401.
 */
function authenticate(req, res, next) {
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader) {
		return res.status(401).json({ message: "No token provided" });
	}

	const token = authHeader.startsWith("Bearer ")
		? authHeader.slice(7).trim()
		: authHeader;

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
		// payload may contain `id` or `_id` depending on how token was signed
		req.userId = payload.id || payload._id || payload.userId;
		next();
	} catch (err) {
		console.error("JWT verification failed:", err && err.message);
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

module.exports = authenticate;
