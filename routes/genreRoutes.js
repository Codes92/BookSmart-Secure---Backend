/* Routes for genres */
const express = require("express");
const router = express.Router();

const { getAllAvailableGenres } = require("../services/genreService");

router.get("/", async (req, res) => {
    try
    {
        const result = await getAllAvailableGenres();
        res.json({result});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

module.exports = router;