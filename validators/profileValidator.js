/** Verify and sanitize user profile input
 * When a user creates or updates their profile, the input
 * needs to be validated to prevent XSS or crashing the app
 */

const { countries } = require("countries-list");
const { sanitizeString } = require("./bookValidator");

// ===================== PROFILE VALIDATION ======================= \\
// ================================================================ \\
/* ALL PROFILE VALIDATORS RETURN TRUE IF EMPTY, AS PROFILE INFO IS OPTIONAL */

/**
 * @description Validate age
 * @param {number} age - Age of user
 * @returns {boolean} - Confirm acceptable age
 */
function isValidAge(age)
{
    if (!age)
    {
        return true;
    }

    // Page count must not be any non-integer number
    return Number.isInteger(age) && age >= 0 && age <= 120;
}

/**
 * @description Validate country
 * @param {string} country - Country of user 
 * @returns {boolean} - Confirm acknowledged country
 */
function isValidCountry(country)
{
    if (!country)
    {
        return true;
    }

    // Get list of country names
    // Asking in API simply isn't worth it when countries rarely change
    const countrySet = new Set(Object.values(countries).map(c => c.name));

    return countrySet.has(country);
}

/**
 * @description Validate occupation
 * @param {string} occupation - Occupation of user 
 * @returns {boolean} - Confirm acknowledged occupation
 */
function isValidOccupation(occupation)
{
    if (!occupation)
    {
        return true;
    }

    const sanitizedOccupation = sanitizeString(occupation);
    return sanitizedOccupation.length >= 0 && sanitizedOccupation.length <= 100;
}

/**
 * @description Validate biography
 * @param {string} biography - Biography of user 
 * @returns {boolean} - Confirm acknowledged biography
 */
function isValidBiography(biography)
{
    if (!biography)
    {
        return true;
    }

    const sanitizedBiography = sanitizeString(biography);
    return sanitizedBiography.length >= 0 && sanitizedBiography.length <= 5000;
}

module.exports = {isValidAge,
                  isValidCountry,
                  isValidOccupation,
                  isValidBiography
}