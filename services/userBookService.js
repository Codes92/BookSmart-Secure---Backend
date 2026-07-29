
const Book = require("../models/bookModel");
const UserBook = require("../models/userBookModel");
const { isValidShelf } = require("../validators/bookValidator");
const { addBook } = require("./bookService");
const { incrementBooksRead, decrementBooksRead } = require("./profileService");

/**
 * @description Add a book to a user library from books in the general library
 * @param {string} userId 
 * @param {string} bookId
 * @param {string} shelf - Status of book-user relationship
 * @returns {object} - Book added to library
 */
async function addToLibrary(userId, bookId, shelf)
{
    try
    {
        const exists = await Book.bookExists(bookId);
        if (!exists)
        {
            throw new Error("This book does not exist in the database");
        }
    }
    catch (error)
    {
        if (error.message === "This book does not exist in the database")
        {
            throw error;
        }
        throw new Error("Unable to check book exists");
    }

    try
    {
        const response = await UserBook.addBookToLibrary(userId, bookId, shelf);
        return response;
    }
    catch (error)
    {
        if (error.message === "This book is already in your library")
        {
            throw error;
        }
        throw new Error("Failed to add book to your library");
    }
}

/**
 * @description Add a book to a user library direct from Google Books API
 * @param {string} userId 
 * @param {string} bookId
 * @param {string} shelf - Status of book-user relationship
 * @returns {object} - Book added to library
 */
async function directAddToLibrary(userId, bookId, shelf)
{
    try
    {
        const exists = await Book.bookExists(bookId);
        if (!exists)
        {
            await addBook(bookId);
        }
        
        const result = await addToLibrary(userId, bookId, shelf);
        return result;
    }
    catch (error)
    {
        if (error.message == "This book is already in your library")
        {
            throw error;
        }
        throw new Error("Failed to add book directly to library");
    }
}

/**
 * @description Get all books from user library
 * @param {string} userId
 * @returns {object} - All books in user library
 */
async function getAllBooks(userId)
{
    try
    {
        const response = await UserBook.getAllUserBooks(userId);
        return response;
    }
    catch (error)
    {
        throw new Error("Unable to check books");
    }
}

/**
 * @description Get all books from user library by shelf
 * @param {string} userId
 * @param {string} shelf
 * @returns {object} - All books in user library according to shelf
 */
async function getAllBooksByShelf(userId, shelf)
{
    if(!isValidShelf(shelf))
    {
        throw new Error("Invalid shelf");
    }

    try
    {
        const response = await UserBook.getBooksByShelf(userId, shelf);
        return response;
    }
    catch (error)
    {
        throw new Error("Unable to check books");
    }
}

/**
 * @description Update book data in user library
 * @param {string} userId 
 * @param {string} bookId
 * @param {object} properties - Book data to be updated
 * @returns {object} - Update book
 */
async function updateUserBookInfo(userId, bookId, updates)
{
    try
    {
        const exists = await Book.bookExists(bookId);
        if (!exists)
        {
            throw new Error("This book does not exist in the database");
        }
    }
    catch (error)
    {
        if (error.message === "This book does not exist in the database")
        {
            throw error;
        }
        throw new Error("Unable to check book exists");
    }

    if (Object.keys(updates).length === 0)
    {
        throw new Error("No updates made");
    }

    let wasFinished = false;
    let becomesFinished = false;

    // Stamp dates based on shelf transition
    if (updates.shelf)
    {
        const currentBook = await UserBook.getUserBook(userId, bookId);
        wasFinished = currentBook?.shelf === "finished";
        becomesFinished = updates.shelf === "finished";

        if (updates.shelf === "want to read")
        {
            updates.dateStarted = null;
            updates.dateFinished = null;
        }

        if (updates.shelf === "reading")
        {
            updates.dateFinished = null;
            if (!currentBook?.date_started)
            {
                updates.dateStarted = new Date().toISOString();
            }
        }

        if (updates.shelf === "finished")
        {
            updates.dateFinished = new Date().toISOString();
            if (!currentBook?.date_started)
            {
                updates.dateStarted = new Date().toISOString();
            }
        }

        if (updates.shelf === "did not finish")
        {
            updates.dateFinished = null;
            if (!currentBook?.date_started)
            {
                updates.dateStarted = new Date().toISOString();
            }
        }
    }

    try
    {
        const response = await UserBook.updateUserBook(userId, bookId, updates);

        if (becomesFinished && !wasFinished)
        {
            await incrementBooksRead(userId);
        }
        else if (!becomesFinished && wasFinished)
        {
            await decrementBooksRead(userId);
        } 

        return response;
    }
    catch (error)
    {
        throw new Error("Unable to update book");
    }
}

/**
 * @description Remove a book from user library
 * @param {string} userId 
 * @param {string} bookId
 * @returns {object} - Book remove from library
 */
async function removeFromLibrary(userId, bookId) 
{
    try
    {
        const exists = await Book.bookExists(bookId);
        if (!exists)
        {
            throw new Error("This book does not exist in the database");
        }
    }
    catch (error)
    {
        if (error.message === "This book does not exist in the database")
        {
            throw error;
        }
        throw new Error("Unable to check book exists");
    }

    try
    {
        const response = await UserBook.removeBookFromLibrary(userId, bookId);
        return response;
    }
    catch (error)
    {
        throw new Error("Failed to remove book from your library");
    }
}

module.exports = {directAddToLibrary,
                  getAllBooks,
                  getAllBooksByShelf,
                  updateUserBookInfo,
                  removeFromLibrary
}