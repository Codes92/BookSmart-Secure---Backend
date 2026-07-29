/** Code to check user's login status when moving around the app */

const pool = require("../database/db");

const jwt = require("jsonwebtoken");
const { validatePassword, checkPwnedPassword } = require("../validators/passwordValidator");

function isLoggedIn(req, res, next)
{
    const token = req.cookies.token;

    if (!token)
    {
        return res.status(401).json({error: "No token provided"});
    }

    try
    {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    }
    catch (err)
    {
        return res.status(401).json({error: "Invalid token"});
    }
}

async function isAdmin(req, res, next)
{
    try
    {
        const userId = req.user.userId;

        const query = await pool.query(
            `SELECT r.role_name from user_roles ur
            JOIN roles r ON r.role_id = ur.role_id
            WHERE user_id = $1`, [userId]
        );

        const result = query.rows || null;

        if (result)
        {
            for (let i = 0; i < result.length; ++i)
            {
                if (result[i].role_name === 'admin')
                {
                    return next();
                }
            }
        }
        return res.status(401).json({error: "Unauthorized"});
    }
    catch (error)
    {
        res.status(500).json({error: "Unable to obtain permission"});
    }
}

async function validatePasswordChange(req, res, next)
{
    const currentPassword = req.body.currentPassword;
    if (!currentPassword)
    {
        return res.status(400).json({error: "No current password provided"});
    }

    const newPassword = req.body.newPassword;
    if (!newPassword)
    {
        return res.status(400).json({error: "No new password provided"});
    }

    const pwnedPasswordCheck = await checkPwnedPassword(newPassword)
    if (!validatePassword(newPassword).valid || !pwnedPasswordCheck.valid)
    {
        return res.status(400).json({error: "Invalid password"});
    }

    if (newPassword === currentPassword)
    {
        return res.status(400).json({error: "New password must be different to previous"});
    }

    next();
}

module.exports = {isLoggedIn,
                  isAdmin,
                  validatePasswordChange
};