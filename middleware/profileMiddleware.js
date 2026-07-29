/**
 * Profile Middleware
 */

const {isValidAge, isValidCountry, isValidOccupation, isValidBiography} = require("../validators/profileValidator");

/**
 * @description Validate profile request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUserProfile(req, res, next)
{
    const {age, country, occupation, biography} = req.body;
   
    if (!isValidAge(age))
    {
        return res.status(400).json({error: "Invalid age data"});
    }

    if (!isValidCountry(country))
    {
        return res.status(400).json({error: "Invalid country data"});
    }

    if (!isValidOccupation(occupation))
    {
        return res.status(400).json({error: "Invalid occupation data"});
    }

    if (!isValidBiography(biography))
    {
        return res.status(400).json({error: "Invalid biography data"});
    }

    next();
}

/**
 * @description Validate profile request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUpdateProfile(req, res, next)
{
    const updates = req.body.updates;

    if (!updates)
    {
        return res.status(400).json({error: "No updates made"});
    }

    // Prevent any field outside age, country, occupation and biography from reaching service
    const validFields = new Set(['age', 'country', 'occupation', 'biography']);

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
        if (updates.age)
        {
            if (!isValidAge(updates.age))
            {
                return res.status(400).json({error: "Invalid age data"});
            }
        }
        if (updates.country)
        {
            if (!isValidCountry(updates.country))
            {
                return res.status(400).json({error: "Invalid country data"});
            }
        }
        if (updates.occupation)
        {
            if (!isValidOccupation(updates.occupation))
            {
                return res.status(400).json({error: "Invalid occupation data"});
            }
        }
        if (updates.biography)
        {
            if (!isValidBiography(updates.biography))
            {
                return res.status(400).json({error: "Invalid biography data"});
            }
        }
    }
    next();
}

module.exports = {validateUserProfile,
                  validateUpdateProfile
};