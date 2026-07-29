/* Routes for profile */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");
const {validateUserProfile, validateUpdateProfile} = require("../middleware/profileMiddleware");

const {createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile} = require("../services/profileService");

router.post("/", isLoggedIn, validateUserProfile, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const profileData = req.body;

        const profile = await createUserProfile(userId, profileData);
        res.status(201).json({profile});
    }
    catch (error)
    {
        if (error.message === "This profile already exists")
        {
            return res.status(409).send(error.message);
        }
        if (error.message === "Failed to create profile")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.get("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        
        const profile = await getUserProfile(userId);
        res.json({profile});
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.patch("/", isLoggedIn, validateUpdateProfile, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const updates = req.body.updates;

        const profile = await updateUserProfile(userId, updates);
        res.json({profile});
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            return res.status(404).send(error.message);
        }
        if (error.message === "No updates made")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message); 
    }
});

router.delete("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;

        const deletedProfile = await deleteUserProfile(userId);
        res.json({deletedProfile});
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;