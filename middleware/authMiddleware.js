const jwt = require("jsonwebtoken");
// same secret used in authRoutes when making the token
const JWT_SECRET = "campus_secret_key";
const authMiddleware = (req, res, next) => {
  try {
    // grab the authorization header, no header = not logged in -> 401
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }
    // token comes like "Bearer abc123" so split n take 2nd part
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }
    // verify token w/ same secret, if fake/expired it throws -> catch sends 401
    const decoded = jwt.verify(token, JWT_SECRET);
    // save user info on req so every route can use req.user.role etc
    req.user = decoded; // { userId, name, role, department, semester }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
module.exports = authMiddleware;
