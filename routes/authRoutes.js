/* Routes for authentication */
const express = require("express");
const router = express.Router();

const { validateRegistration, validateLogin } = require("../middleware/userMiddleware");
const { isLoggedIn, validatePasswordChange } = require("../middleware/authMiddleware");

const { registerUser, loginUser, deleteUserAccount, changePassword } = require("../services/authService");
const { registrationLimiter, passwordChangeLimiter, accountDeleteLimiter } = require("../middleware/rateLimiter");


// Import services and middleware functions

// =============== Registration ===============
// ============================================
router.post("/register", registrationLimiter, validateRegistration, async (req, res) => {
    try
    {
        const {token, userId} = await registerUser(req.body.email, req.body.username, req.body.password);

        res.cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({userId, message: "Registration Successful"});
    }
    catch (error)
    {
        res.status(400).json({error: error.message});
    }
});

// ================== Login ===================
// ============================================

router.post('/login', validateLogin, async (req, res) => {
    try
    {
        const {token, userId} = await loginUser(req.body.email, req.body.password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({userId, message: "Login Successful"});
    }
    catch (error)
    {
        res.status(400).json({error: error.message});
    }
});

// ================== Logout ===================
// =============================================

router.post("/logout", async (req, res) => {
    try
    {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.json({message: "Logout successful"});
    }
    catch (error)
    {
        res.status(400).json({error: "Logout failed"});
    }
});

router.get('/me', isLoggedIn, async (req, res) => {
    
    res.json({ userId: req.user.userId });

});

// ================== Delete ===================
// =============================================
router.delete("/account", isLoggedIn, accountDeleteLimiter, async(req, res) => {
    try
    {
        await deleteUserAccount(req.user.user_id);

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.json({message: "Account deletion successful"});
    }
    catch (error)
    {
        res.status(400).json({error: "Deletion failed"});
    }
});

// ================== Change Password ===================
// ======================================================
router.patch("/password", isLoggedIn, passwordChangeLimiter, validatePasswordChange, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        await changePassword(userId, currentPassword, newPassword);

        res.json({message: "Password change successful"});
    }
    catch (error)
    {
        if (error.message === "Invalid password")
        {
            return res.status(401).json({error: "Invalid password"});
        }
        res.status(400).json({error: "Password change failed"});
    }
});

module.exports = router;