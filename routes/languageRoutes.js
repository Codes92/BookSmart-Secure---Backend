/* Routes for languages */
const express = require("express");
const router = express.Router();

const { getAllAvailableLanguages } = require("../services/languageService");

router.get("/", async (req, res) => {
    try
    {
        const result = await getAllAvailableLanguages();
        res.json({result});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

module.exports = router;