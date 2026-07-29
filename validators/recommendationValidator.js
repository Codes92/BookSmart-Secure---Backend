/** Verify and sanitize user input from recommendations
 * Of particular importance give recommendations rely on AI input
 */
const {sanitizeString} = require("./bookValidator");

// ===================== RECOMMENDATION VALIDATION ======================= \\
// ======================================================================= \\

/**
 * @description Validate recommendation status
 * @param {string} status - Recommendation status
 * @returns {boolean} - Confirm acceptable status
 */
function isValidRecommendationStatus(status)
{
    if (!status)
    {
        return false;
    }

    // Pending can not be chosen as a status
    const validRecommendationSet = new Set(['accepted', 'dismissed']);

    return validRecommendationSet.has(status);
}

/**
 * @description Validate recommendation ID
 * @param {number} recommendationId - Recommendation ID
 * @returns {boolean} - Confirm acceptable ID
 */
function isValidRecommendationId(recommendationId)
{
    return Number.isInteger(recommendationId) && recommendationId > 0;
}

/**
 * @description Validate recommendation reason
 * @param {string} reason - Recommendation reason
 * @returns {boolean} - Confirm acceptable reason
 */
function isValidReason(reason)
{
    if (!reason)
    {
        return true;
    }

    const sanitizedReason = sanitizeString(reason);

    return sanitizedReason.length >= 1 && sanitizedReason.length <= 1000;
}

module.exports = { isValidRecommendationStatus,
                   isValidRecommendationId,
                   isValidReason
};