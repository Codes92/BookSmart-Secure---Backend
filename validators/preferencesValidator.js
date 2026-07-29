/** Verify and sanitize user profile input
 * When a user creates or updates their preferences, the input
 * needs to be validated to prevent XSS or crashing the app
 */

/**
 * @description Validate preferred length
 * @param {string} prefLength - Preferred length of books
 * @returns {boolean} - Confirm acceptable range
 */
function isValidPrefLength(prefLength)
{
    if (!prefLength)
    {
        return true;
    }

    const bookLengthSet = new Set(["short", "medium", "long"]);

    return bookLengthSet.has(prefLength);
}

/**
 * @description Validate preferred pace
 * @param {string} prefPace - Preferred pace of reading
 * @returns {boolean} - Confirm acceptable pace range
 */
function isValidPrefPace(prefPace)
{
    if (!prefPace)
    {
        return true;
    }

    const bookLengthSet = new Set(["casual", "moderate", "avid"]);

    return bookLengthSet.has(prefPace);
}

module.exports = {isValidPrefLength,
                  isValidPrefPace
};