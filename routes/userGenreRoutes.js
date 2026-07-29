/* Routes for user languages */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");

const { addUserGenre, getUserGenres, deleteUserGenre } = require("../services/userPreferredGenresService");

router.post("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const genreId = req.body.genreId;

        const addGenre = await addUserGenre(userId, genreId);
        res.status(201).json({addGenre});
    }
    catch (error)
    {
        if (error.message === "Failed to add genre")
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

        const userGenres = await getUserGenres(userId);
        return res.json({userGenres});
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
        const genreId = req.body.genreId;

        const deletedGenre = await deleteUserGenre(userId, genreId);
        return res.json({deletedGenre});
    }
    catch (error)
    {
        if (error.message === "Genre not found in list")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;