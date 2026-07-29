/** Verify and sanitize username input
 */

const { sanitizeString } = require("./bookValidator");

/**
 * @description Validate username
 * @param {string} username - Username
 * @return {object{boolean, string}} - Username validated or not with message
 */
function validateUsername(username)
{
    if (!username || typeof username !== "string")
    {
        return {valid: false, message: "Username must be a non-empty string"};
    }

    const trimmed = username.trim();

    const sanitizedUsername = sanitizeString(trimmed);

    if (sanitizedUsername.length < 1 && sanitizedUsername.length > 50)
    {
        return {valid: false, message: "Username must be between 1 and 50 characters"}
    }

    const allowedFormat = /^[a-zA-Z0-9_]+$/;
    if (!allowedFormat.test(sanitizedUsername))
    {
        return {valid: false, message: "Username can only contain letters, numbers, and underscores"}
    }

    return {valid: true, message: "", sanitized: sanitizedUsername};
}

module.exports = {validateUsername};