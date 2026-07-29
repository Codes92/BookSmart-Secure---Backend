/* Routes for user preferences */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");
const { validateUpdatePreferences, validateUserPreferences } = require("../middleware/userPreferencesMiddleware");

const { createUserPreferences, getUserPreferences, updateUserPreferences, deleteUserPreferences } = require("../services/userPreferencesService");

router.post("/", isLoggedIn, validateUserPreferences, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const preferencesData = req.body;

        const addPreferences = await createUserPreferences(userId, preferencesData);
        res.status(201).json({addPreferences});
    }
    catch (error)
    {
        if (error.message === "Your preferences already exist")
        {
            return res.status(409).send(error.message);
        }
        if (error.message === "Failed to create preferences")
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
        
        const userPreferences = await getUserPreferences(userId);
        res.json({userPreferences});
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.patch("/", isLoggedIn, validateUpdatePreferences, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const updates = req.body.updates;

        const updatePreferences = await updateUserPreferences(userId, updates);
        res.json({updatePreferences});
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
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

        const deletedPreferences = await deleteUserPreferences(userId);
        res.json({deletedPreferences});
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;