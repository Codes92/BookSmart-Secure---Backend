/* Routes for authentication */
const express = require("express");
const router = express.Router();

const { validateRegistration, validateLogin } = require("../middleware/userMiddleware");
const { registerUser, loginUser } = require("../services/authService");
const { registrationLimiter } = require("../middleware/rateLimiter");


// Import services and middleware functions

// =============== Registration ===============
// ============================================
router.post("/register", registrationLimiter, validateRegistration, async (req, res) => {
    try
    {
        const {token, userId} = await registerUser(req.body.email, req.body.password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({userId, message: "Registration Successful"});
    }
    catch (error)
    {
        console.log(error)
        res.status(400).json({error: error.message});
    }
});

// ================== Login ===================
// ============================================

router.post('/login', loginUser, validateLogin, async (req, res) => {
    try
    {
        const {token, userId} = await loginUser(req.body.email, req.body.password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({userId, message: "Login Successful"});
    }
    catch (error)
    {
        console.log(error)
        res.status(400).json({error: error.message});
    }
});

module.exports = router;