const rateLimit = require("express-rate-limit");

const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {error: "Too many attempts, please try again later"}
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {error: "Too many attempts, please try again later"}
});

const recommendationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Recommendation calls are expensive - limit to 5 per hour
    message: {error: "Recommendation limit reached, please try again later"}
});

const passwordChangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {error: "Too many attempts, please try again later"}
});

const accountDeleteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {error: "Deletion limit reached, please try again later"}
});

const goalCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {error: "Goal creation limit reached, please try again later"}
});

const profileCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {error: "Profile creation limit reached, please try again later"}
});

module.exports = {registrationLimiter,
                  loginLimiter,
                  recommendationLimiter,
                  passwordChangeLimiter,
                  accountDeleteLimiter,
                  goalCreateLimiter,
                  profileCreateLimiter};