// ===================== PASSWORD VALIDATION ======================= \\
// ================================================================= \\

const hibp = require("hibp");

/**
 * @description Validate password
 * @param {string} password - password
 * @return {object{boolean, message}} - Password validated or not with message
 */
function validatePassword(password)
{
    // Enforce min and max length of password
    const MIN_PASSWORD_LENGTH = 8;
    const MAX_PASSWORD_LENGTH = 128; // Enable passphrases

    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH)
    {
        return {valid: false, message: "Invalid password"};
    }

    return {valid: true};
}

/**
 * @description Check pwned password (common and previously breached passwords)
 * @param {string} password - password
 * @return {object{boolean, message}} - Password validated or not with message
 */
async function checkPwnedPassword(password)
{
    // Call hibp API
    const pwnedCheck = await hibp.pwnedPassword(password);

    if (pwnedCheck)
    {
        return {valid: false, message: "This is a commonly used password and may have been breached"};
    }

    return {valid: true};
}

module.exports = {validatePassword,
                  checkPwnedPassword}