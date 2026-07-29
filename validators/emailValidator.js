const validator = require("validator");
const dns = require("dns");
dns.setServers(['8.8.8.8', '1.1.1.1']);
const emailDomains = require("disposable-email-domains");

// ===================== EMAIL VALIDATION ======================= \\
// ============================================================== \\

/**
 * @description Validate email
 * @param {string} email - Email address
 * @return {object{boolean, string}} - Email validated or not with message
 */
async function validateEmail(email)
{
    if (!email || typeof email !== "string")
    {
        return {valid: false, message: "Email must be a non-empty string"};
    }

    // Remove whitespaces from email input
    const trimmed = email.trim();

    // Check whether email is potentially valid
    if (!validator.isEmail(trimmed))
    {
        return {valid: false, message: "Invalid email address"};
    }

    /**
     * Check the email address is not disposable and meets MX requirements
     */
    // Check domain name is legitimate
    const atIndex = trimmed.indexOf('@'); // Find index of @
    const domain = trimmed.substring(atIndex + 1); // Domain = substring after @

    // If email address is in know disposable email address list, reject it.
    if (emailDomains.includes(domain))
    {
        return {valid: false, message: "Invalid email address"};
    }
    
    // Check the email has an existing mail server
    try
    {
        const domainRecords = await dns.promises.resolveMx(domain); // Check for mail server record
    }
    catch (error)
    {
        return {valid: false, message: "Invalid email address"};
    }

    return {valid: true, trimmed};
}

module.exports = {validateEmail};