/* Routes for user languages */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");

const { addUserLanguage, getUserLanguages, deleteUserLanguage } = require("../services/userLanguageService");

router.post("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const languageId = req.body.languageId;

        const addLanguage = await addUserLanguage(userId, languageId);
        res.status(201).json({addLanguage});
    }
    catch (error)
    {
        if (error.message === "Failed to add language")
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

        const userLanguages = await getUserLanguages(userId);
        return res.json({userLanguages});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.delete("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const languageId = req.body.languageId;

        const deletedLanguage = await deleteUserLanguage(userId, languageId);
        return res.json({deletedLanguage});
    }
    catch (error)
    {
        if (error.message === "Language not found in list")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;