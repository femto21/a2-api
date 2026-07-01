import jwt from "jsonwebtoken";

function getTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.slice(6)) : null;
}

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = bearerToken;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Authentication token is missing.",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT payload:", req.user);
    next();
  } catch {
    return res.status(401).json({
      status: 401,
      message: "Authentication token is invalid or expired.",
    });
  }
}
