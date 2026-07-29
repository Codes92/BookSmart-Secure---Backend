/**
 * Recommendation Middleware
 */

const { isValidRecommendationStatus, isValidRecommendationId } = require("../validators/recommendationValidator");

/**
 * @description Validate recommendation update
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUpdateRecommendation(req, res, next)
{
    const status = req.body.status;
    if (!status)
    {
        return res.status(400).json({error: "Recommendation status required"});
    }

    if (!isValidRecommendationStatus(status))
    {
        return res.status(400).json({error: "Invalid recommendation status"});
    }

    next();
}

/**
 * @description Validate recommendation ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateRecommendationID(req, res, next)
{
    const recommendationId = parseInt(req.params.recommendationId);

    if (!isValidRecommendationId(recommendationId))
    {
        return res.status(400).json({error: "Invalid recommendation ID"});
    }

    next();
}

module.exports = {validateUpdateRecommendation,
                  validateRecommendationID};