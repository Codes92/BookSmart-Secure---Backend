/* Routes for books */
const express = require("express");
const router = express.Router();

const {isLoggedIn, isAdmin} = require("../middleware/authMiddleware");
const { validateSearchBooks, validateAddBook } = require("../middleware/bookMiddleware");

const { deleteBook, getBook, searchBooks, addBook } = require("../services/bookService");

router.post("/", isLoggedIn, isAdmin, validateAddBook, async(req, res) => {
    try
    {
        const {bookId} = req.body;
        const newBook = await addBook(bookId);
        res.status(201).json({newBook});
    }
    catch (error)
    {
        if (error.message === "This book already exists in the database")
        {
            return res.status(409).send(error.message);
        }
        if (error.message === "Google Books API rate limit exceeded")
        {
            return res.status(429).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.get("/search", isLoggedIn, validateSearchBooks, async(req, res) => {
    try
    {
        const {searchParam, searchTerm} = req.query;
        const searchResults = await searchBooks(searchParam, searchTerm);
        res.json({searchResults});
    }
    catch (error)
    {
        if (error.message === "Invalid search parameter")
        {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.get("/:bookId", isLoggedIn, async(req, res) => {
    try
    {
        const bookId = req.params.bookId;
        const book = await getBook(bookId);
        res.json({book});
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

router.delete("/:bookId", isLoggedIn, isAdmin, async(req, res) => {
    try
    {
        const bookId = req.params.bookId;
        const deletedBook = await deleteBook(bookId);
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