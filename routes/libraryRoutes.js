/* Routes for books */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");

const { removeFromLibrary, updateUserBookInfo, getAllBooksByShelf, getAllBooks, directAddToLibrary } = require("../services/userBookService");

router.post("/", isLoggedIn, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const bookId = req.body.bookId;
        const shelf = req.body.shelf
        const addBook = await directAddToLibrary(userId, bookId, shelf);
        res.status(201).json({addBook});
    }
    catch (error)
    {
        if (error.message === "This book is already in your library")
        {
            return res.status(409).send(error.message);
        }
        if (error.message === "Failed to add book to your library")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.get("/", isLoggedIn, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const userLibrary = await getAllBooks(userId);
        res.json({userLibrary});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.get("/:shelf", isLoggedIn, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const shelf = req.params.shelf;
        const bookshelf = await getAllBooksByShelf(userId, shelf);
        res.json({bookshelf});
    }
    catch (error)
    {
        if (error.message === "Invalid shelf")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.patch("/:bookId", isLoggedIn, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const bookId = req.params.bookId;
        const updates = req.body.updates;
        const updatedBook = await updateUserBookInfo(userId, bookId, updates);
        res.json({updatedBook});
    }
    catch (error)
    {
        if (error.message === "This book does not exist in the database")
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

router.delete("/:bookId", isLoggedIn, async(req, res) => {
    try
    {
        const userId = req.user.userId;
        const bookId = req.params.bookId;
        const deletedBook = await removeFromLibrary(userId, bookId);
        res.json({deletedBook});
    }
    catch (error)
    {
        if (error.message === "This book does not exist in the database")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;