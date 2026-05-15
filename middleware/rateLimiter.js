const rateLimit = require("express-rate-limit");

const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 20 attempts per window
    message: {error: "Too many attempts, please try again later"}
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 20 attempts per window
    message: {error: "Too many attempts, please try again later"}
});

module.exports = {registrationLimiter,
                  loginLimiter};