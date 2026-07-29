
const Author = require("../models/authorModel");
const Book = require("../models/bookModel");
const Genre = require("../models/genreModel");

const { isValidBookTitle, isValidAuthor, isValidPageCount, isValidAPIGenre, isValidDescription, isValidPublisher, isValidIsbn, isValidLanguage, isValidDate } = require("../validators/bookValidator");

const googleBooksBaseURL = `https://www.googleapis.com/books/v1`;

/**
 * @description Search books from Google API
 * @param {string} searchParam 
 * @param {string} searchTerm 
 * @returns {object} - List of books returned from Google Books API
 */
async function searchBooks(searchParam, searchTerm)
{
    const validParams = new Set(['title', 'author', 'isbn']);

    if (!validParams.has(searchParam))
    {
        throw new Error("Invalid search parameter");
    }

    const prefixMap = {
        title: 'intitle',
        author: 'inauthor',
        isbn: 'isbn'
    };

    const prefix = prefixMap[searchParam];

    try
    {
        const response = await fetch(
            `${googleBooksBaseURL}/volumes?q=${prefix}:${searchTerm}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );

        if (!response.ok)
        {
            throw new Error(`Google Books API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
    catch(error)
    {
        if (error.message === "Google Books API error: 429")
        {
            throw new Error("Google Books API rate limit exceeded")
        }
        if (error.message === "Google Books API error: 400")
        {
            throw new Error("Book ID required");
        }
        throw new Error("Unable to retrieve books");
    }
}

/**
 * @description Add book to user library
 * @param {string} bookId - Book ID stored in library
 * @returns {object} -  
 */
async function addBook(bookId)
{
    try
    {
        const url = `${googleBooksBaseURL}/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;
        const bookDetails = await fetch(url);

        if (!bookDetails.ok)
        {
            throw new Error(`Google Books API error: ${bookDetails.status}`);
        }
        const data = await bookDetails.json();

        /* Extract all required book data
            Google Books API data is generally trustworthy, but all external data must be validated by default,
            and data can be malformed, too long or fields might be missing
        */
        const title = data.volumeInfo.title; // Extract book title
        const authors = data.volumeInfo.authors; // Authors
        const genres = data.volumeInfo.categories; // Genres
        const pageCount = data.volumeInfo.pageCount; // Page count
        const description = data.volumeInfo.description // Description
        const pubDate = data.volumeInfo.publishedDate // Published date
        const publisher = data.volumeInfo.publisher // Publisher
        const language = data.volumeInfo.language // Language
        const coverUrl = data.volumeInfo.imageLinks?.thumbnail || null; // Cover image

        // Extract ISBN number IF it exists
        const isbnObject = data.volumeInfo.industryIdentifiers;
        let isbn13;
        let isbn10;
        if (isbnObject)
        {
            for (let i = 0; i < isbnObject.length; ++i)
            {
                if (isbnObject[i].type === "ISBN_13")
                {
                    isbn13 = isbnObject[i].identifier;
                }
                else if (isbnObject[i].type === "ISBN_10")
                {
                    isbn10 = isbnObject[i].identifier;
                }
            }
        }
        // Validate ISBN
        if (isbn13 || isbn10)
        {
            if (!isValidIsbn(isbn13) && !isValidIsbn(isbn10))
            {
                throw new Error("Invalid ISBN number");
            }
        }
        
        // Logic to decide ISBN number;
        let isbn;
        if (isbn13)
        {
            isbn = isbn13;
        }
        else if (isbn10)
        {
            isbn = isbn10;
        }
        else
        {
            isbn = null;
        }

        /* Validate book data before entry */
        // Validate title
        if (!isValidBookTitle(title))
        {
            throw new Error("Invalid book title");
        }
    
        // Validate author
        if (authors)
        {
            for (let i = 0; i < authors.length; ++i)
            {
                if (!isValidAuthor(authors[i]))
                {
                    throw new Error("Invalid book author");
                }
            }
        }

        const processedGenres = [];
        // Validate genre
        if (genres)
        {
            for (let i = 0; i < genres.length; ++i)
            {
                let genre = genres[i];

                if (genre.length > 50)
                {
                    const truncateAt = genre.lastIndexOf(' ', 50);
                    genre = truncateAt > 0 ? genre.substring(0, truncateAt) : genre.substring(0, 50);
                }

                if (!isValidAPIGenre(genre))
                {
                    throw new Error("Invalid book genre");
                }

                processedGenres.push(genre);
            }
        }
     
        // Validate page count
        if (!isValidPageCount(pageCount))
        {
            throw new Error("Invalid book page count");
        }
      
        // Validate description
        if (!isValidDescription(description))
        {
            throw new Error("Invalid book description");
        }

        // Validate publisher
        if (!isValidPublisher(publisher))
        {
            throw new Error("Invalid book publisher");
        }

        // Validate language
        if(!isValidLanguage(language))
        {
            throw new Error("Invalid book language");
        }

        // Extract year date of publishing
        let dateSplit;
        if (pubDate)
        {
            dateSplit = parseInt(pubDate.split("-")[0]);
        }

        const createBook = await Book.createBook(bookId, title, isbn, pageCount, description, dateSplit, publisher, language, coverUrl);

        if (authors)
        {
            for (let i = 0; i < authors.length; ++i)
            {
                const author = await Author.findOrCreateAuthor(authors[i]);
                await Book.addAuthor(bookId, author.author_id);
            }
        }
        if (processedGenres.length > 0)
        {
            for (let i = 0; i < processedGenres.length; ++i)
            {
                const genre = await Genre.findOrCreateGenre(processedGenres[i]);
                await Book.addGenre(bookId, genre.genre_id);
            }
        }
        
        return createBook;
    }
    catch (error)
    {
        if (error.message.startsWith("Google Books API error"))
        {
            throw error;
        }
        else if (error.message === "Invalid ISBN number" || error.message === "Invalid book title" 
            || error.message === "Invalid book author" || error.message === "Invalid book genre"
            || error.message === "Invalid book page count" || error.message === "Invalid book description"
            || error.message === "Invalid book publisher" || error.message === "Invalid book language"
        )
        {
            throw error;
        }

        throw new Error("Unable to add book to library");
    }
}

/**
 * @description Retrieve book from database
 * @param {string} bookId - Book ID stored in library
 * @returns {object} - 
 */
async function getBook(bookId)
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
        throw new Error("Unable to check whether book exists");
    }

    try
    {
        const findBook = await Book.findById(bookId);
        const getAuthors = await Book.getAuthors(bookId);
        const getGenres = await Book.getGenres(bookId);

        const response = {findBook, getAuthors, getGenres};

        return response;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve book");
    }
}

/**
 * @description Update book properties in database
 * @param {string} bookId - Book ID stored in library
 * @param {object} fields - Properties to be updated
 * @returns {object} - 
 */
async function updateBook(bookId, fields)
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
        throw new Error("Unable to check whether book exists");
    }

    if (Object.keys(fields).length === 0)
    {
        throw new Error("Nothing to update");
    }

    try
    {
        const result = await Book.updateBook(bookId, fields);
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to update book");
    }
}

/**
 * @description Delete book from database
 * @param {string} bookId - Book ID stored in library
 * @returns {object} - Deleted Book
 */
async function deleteBook(bookId)
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
        throw new Error("Unable to check whether book exists");
    }

    try
    {
        const deleted = await Book.deleteBook(bookId);
        return deleted;
    }
    catch (error)
    {
        throw new Error("Failed to delete book");
    }
}

module.exports = {searchBooks,
                  addBook,
                  getBook,
                  updateBook,
                  deleteBook
};