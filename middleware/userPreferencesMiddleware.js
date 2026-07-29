/**
 * User Preferences Middleware
 */

const {isValidPrefLength, isValidPrefPace} = require("../validators/preferencesValidator");

/**
 * @description Validate preferences create request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUserPreferences(req, res, next)
{
    const {prefLength, prefPace} = req.body;

    if (!isValidPrefLength(prefLength))
    {
        return res.status(400).json({error: "Invalid preferences length data"});
    }

    if (!isValidPrefPace(prefPace))
    {
        return res.status(400).json({error: "Invalid preferences pace data"});
    }

    next();
}

/**
 * @description Validate preference update request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUpdatePreferences(req, res, next)
{
    const updates = req.body.updates;

    if (!updates)
    {
        return res.status(400).json({error: "No updates made"});
    }

    // Prevent any field outside preferred length and preferred pace from reaching service
    const validFields = new Set(['prefLength', 'prefPace']);

    if (updates)
    {
        const invalidFields = Object.keys(updates).filter(key => !validFields.has(key));
        if (invalidFields.length > 0)
        {
            return res.status(400).json({error: "Invalid fields in update"});
        }
    }

    if (updates)
    {
        if (updates.prefLength)
        {
            if (!isValidPrefLength(updates.prefLength))
            {
                return res.status(400).json({error: "Invalid preferred length data"});
            }
        }
        if (updates.prefPace)
        {
            if (!isValidPrefPace(updates.prefPace))
            {
                onsole.log("Invalid preferred pace data");
                return res.status(400).json({error: "Invalid preferred pace data"});
            }
        }
    }
    next();
}

module.exports = {validateUserPreferences,
                  validateUpdatePreferences};