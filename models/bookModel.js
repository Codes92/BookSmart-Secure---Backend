const pool = require("../database/db");

/* Create book model class to contact database
 This class handles new books general book metadata and finding specific books, 
 rather than the user's relations to a book
 The Book model is an admin-only model. Regular users do not have access to methods
 in this class
 */
 
class Book
{
    // ============= Exist =============
    /* Quick check to know if a book exists in the db before inserting
        One of the findBy functions could fulfill the role, but a focused function
        is more reliable and faster
    */
    /**
     * @description Check whether book entry exists in database
     * @param {string} bookId
     * @returns {boolean} - True or false whether the book exists
     */
    static async bookExists(bookId)
    {
        try
        {
            const result = await pool.query(
                `SELECT 1 FROM books WHERE book_id = $1`, [bookId]
            );
            // Return true or false bool value
            return result.rows.length > 0;
        }
        catch (error)
        {
            throw new Error("Existence check failed");
        }
    }

    // ============= CREATE =============
    /**
     * @description Insert a new book to database
     * @param {string} title - Book title
     * @param {string} isbnNumber - Worldwide ISBN Number
     * @param {string} pageCount - Number of pages in book
     * @param {string} description - Book description
     * @param {string} pubYear - Year of publication
     * @param {string} publisher - Publisher of book
     * @param {string} language - Original print language of book
     * @param {string} coverUrl - Cover image for book
     * @return {object} - Newly created book in database
     */
    static async createBook(bookId, title, isbnNumber, pageCount, description, 
                            pubYear, publisher, language, coverUrl)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO books (book_id, title, isbn_number, page_count, description, publication_year,
                                    publisher, print_language, cover_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING book_id, title`,
                [bookId, title, isbnNumber, pageCount, description, pubYear, publisher, language, coverUrl]
            );
            return result.rows[0]; // Return created book with id.
        }
        catch (error)
        {
            // PostgreSQL unique violation code (something added twice)
            if (error.code === "23505")
            {
                throw new Error("Book already exists in library");
            }

            throw new Error("Failed to create new book entry");
        }
    }

    // ============= FIND =============
    /**
     * @description Find a book via Google ID or original ID
     * @param {string} bookId - Book ID stored in database
     * @return {object} - Correct Book
     */
    static async findById(bookId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM books WHERE book_id = $1`, [bookId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Unable to find book via ID");
        }
    }

    /**
     * @description Find a book via title
     * @param {string} title - Book title stored in database
     * @return {object} - Correct Book
     */
    static async findByTitle(title)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM books WHERE title = $1`, [title]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find book via title");
        }
    }

    /**
     * @description Find a book via Worldwide ISBN number
     * @param {string} isbnNumber - ISBN number stored in database
     * @return {object} - Correct Book
     */
    static async findByIsbn(isbnNumber)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM books WHERE isbn_number = $1`, [isbnNumber]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Unable to find book via ISBN");
        }
    }

    /**
     * @description Find books via the ID of an author
     * @param {string} authorId - Author ID stored in database
     * @return {object} - List of books by author
     */
    static async findByAuthorId(authorId)
    {
        try
        {
            const result = await pool.query(
                `SELECT b.*
                FROM books b
                JOIN book_authors ba ON ba.book_id = b.book_id
                JOIN authors a ON ba.author_id = a.author_id
                WHERE a.author_id = $1`, [authorId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find books via author ID");
        }
    }

    /**
     * @description Find books via the name of an author
     * @param {string} authorName - Author name stored in database
     * @return {object} - List of books by author
     */
    static async findByAuthorName(authorName)
    {
        try
        {
            const result = await pool.query(
                `SELECT b.*
                FROM books b
                JOIN book_authors ba ON ba.book_id = b.book_id
                JOIN authors a ON a.author_id = ba.author_id
                WHERE a.author_name = $1`, [authorName]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find books via author name");
        }
    }

    /**
     * @description Find books via genre
     * @param {string} genre - Genre stored in database
     * @return {object} - List of books by genre
     */
    static async findByGenre(genre)
    {
        try
        {
            const result = await pool.query(
                `SELECT b.*
                FROM books b
                JOIN book_genres bg ON bg.book_id = b.book_id
                JOIN genres g ON g.genre_id = bg.genre_id
                WHERE g.genre_name = $1`, [genre]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find books via genre");
        }
    }

    /**
     * @description Find multiple books via ID
     * @param {object} books - Book IDs stored in database
     * @return {object} - List of books by ID
     */
    static async findMultipleBooksById(books = [])
    {
        if (books.length === 0)
        {
            throw new Error("No books to be searched for");
        }

        try
        {
            const result = await pool.query(
                `SELECT * FROM books WHERE book_id = ANY($1)`, [books]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Books unable to be found");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update the information of a book in the database
     * @param {string} bookId - Book ID stored in database
     * @param {object{string}} fields - The fields to be changed
     * @return {object} - Updated book record in database
     */
    static async updateBook(bookId, fields = {})
    {
        // Condition for no updates
        if (Object.keys(fields).length === 0)
        {
            throw new Error("No fields to update");
        }

        let query = `UPDATE books SET `; // Base query
        const params = [bookId]; // Changes made to this book
        let paramCount = 1; // Count number of changes to be made (length of params array)
        const setClauses = [];
        
        if (fields.title) // Check if title is being updated
        {
            paramCount++;
            setClauses.push(`title = $${paramCount}`);
            params.push(fields.title);
        }

        if (fields.isbnNumber) // Check if ISBN number is being updated
        {
            paramCount++;
            setClauses.push(`isbn_number = $${paramCount}`);
            params.push(fields.isbnNumber);
        }

        if (fields.pageCount) // Check if page count is being updated
        {
            paramCount++;
            setClauses.push(`page_count = $${paramCount}`);
            params.push(fields.pageCount);
        }

        if (fields.description) // Check if description is being updated
        {
            paramCount++;
            setClauses.push(`description = $${paramCount}`);
            params.push(fields.description);
        }

        if (fields.pubYear) // Check if publication year is being updated
        {
            paramCount++;
            setClauses.push(`publication_year = $${paramCount}`);
            params.push(fields.pubYear);
        }

        if (fields.publisher) // Check if publisher is being updated
        {
            paramCount++;
            setClauses.push(`publisher = $${paramCount}`);
            params.push(fields.publisher);
        }

        if (fields.language) // Check if language is being updated
        {
            paramCount++;
            setClauses.push(`language = $${paramCount}`);
            params.push(fields.language);
        }

        if (fields.coverUrl) // Check if language is being updated
        {
            paramCount++;
            setClauses.push(`cover_url = $${paramCount}`);
            params.push(fields.coverUrl);
        }

        if (setClauses.length === 0)
        {
            throw new Error("No valid fields to update");
        }

        try
        {
            // join setClauses and WHERE statement to make full query
            query += setClauses.join(', ');
            query += ` WHERE book_id = $1 RETURNING book_id`;

            const result = await pool.query(query, params);
            return result.rows;
        }
        catch (error)
        {
            throw new Error("Book update failed");
        }
    }

    // ============= DELETE =============
    /* Deleting a book must require its ID for improved safety, as some books may
        share other identifying information. The ID is unique.
        Cascading effects are handled by database
    */
   /**
     * @description Delete a book in the database
     * @param {string} bookId - Book ID stored in database
     * @return {object} - Deleted book
     */
    static async deleteBook(bookId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM books WHERE book_id = $1 RETURNING book_id`, [bookId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete book");
        }
    }

    // ============= Associations =============
    /* When a new book is created, the core book goes into the books table, but
       other data, such as the genre and author, is stored elsewhere, so these functions
       handle the process of adding and getting data from those separate tables */
    /**
     * @description Add the genre of a book to database
     * @param {string} bookId 
     * @param {string} genreId 
     * @returns {object} - Genre of book
     */
    static async addGenre(bookId, genreId)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO book_genres (book_id, genre_id)
                VALUES ($1, $2) RETURNING book_id, genre_id`, [bookId, genreId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to add book genre data");
        }
    }

    /**
     * @description Add the author of a book to database
     * @param {string} bookId 
     * @param {string} authorId
     * @returns {object} - Author of book
     */
    static async addAuthor(bookId, authorId)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO book_authors (book_id, author_id)
                VALUES ($1, $2) RETURNING book_id, author_id`, [bookId, authorId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to add book author data");
        }
    }

    /**
     * @description Get all genres of a specific book from database
     * @param {string} bookId
     * @returns {object} - Genres of book
     */
    static async getGenres(bookId)
    {
        try
        {
            const result = await pool.query(
                `SELECT g.* FROM genres g
                JOIN book_genres bg ON bg.genre_id = g.genre_id
                JOIN books b ON b.book_id = bg.book_id
                WHERE b.book_id = $1`, [bookId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to get book genres");
        }
    }

    /**
     * @description Get all authors of a specific book from database
     * @param {string} bookId
     * @returns {object} - Authors of book
     */
    static async getAuthors(bookId)
    {
        try
        {
            const result = await pool.query(
                `SELECT a.* FROM authors a
                JOIN book_authors ba ON ba.author_id = a.author_id
                JOIN books b ON b.book_id = ba.book_id
                WHERE b.book_id = $1`, [bookId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to get book authors");
        }
    }
}

module.exports = Book;