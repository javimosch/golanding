module.exports = () => {
  const basicAuth = require("express-basic-auth");
  let basicAuthMiddleware = (req, res, next) => next();
  if (process.env.AUTH_USER && process.env.AUTH_PASSWORD) {
    // Basic Authentication Middleware
    basicAuthMiddleware = basicAuth({
      users: { [process.env.AUTH_USER]: process.env.AUTH_PASSWORD },
      challenge: true,
      realm: "Proxyflare",
    });
  }
  return basicAuthMiddleware;
};
