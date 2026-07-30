const { sanitizeString } = require("../validators/bookValidator");

/**
 * @description - Sanitize raw html input on backend (used to sanitize every request body before reaching route handler)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function sanitizeBody(req, res, next)
{
    if (req.body)
    {
        for (const key in req.body)
        {
            req.body[key] = sanitizeString(req.body[key]);
        }
    }

    next();
}

module.exports = {sanitizeBody};