const pool = require("../database/db");

/* Create user book relationship model class to contact database
 This class handles an individual user's relationship with specific books, 
 rather than general book data.
 The UserBook is used by users but can be accessed by admin. 
 */

class UserBook
{
    /**
     * @description Add new book to user library
     * @param {string} userId - App ID for user
     * @param {string} bookId - Same ID as in database
     * @param {string} shelf - Status for user's relationship with book
     * @return {object} - Book added to user library
     */
    static async addBookToLibrary(userId, bookId, shelf)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO user_books (user_id, book_id, shelf)
                VALUES ($1, $2, $3) RETURNING book_id`, [userId, bookId, shelf]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            if (error.code === "23505")
            {
                throw new Error("This book is already in your library");
            }
            throw new Error("Failed to add book to your library");
        }
    }

    // ============= READ =============
    /**
     * @description Get all books from the user's library
     * @param {string} userId - App ID for user
     * @return {object} - All books from user's library
     */
    static async getAllUserBooks(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT DISTINCT ON (ub.book_id) ub.*, b.title, b.page_count, b.description, 
                b.publication_year, b.publisher, b.cover_url, b.isbn_number, b.print_language, a.author_name
                FROM user_books ub
                JOIN books b ON ub.book_id = b.book_id
                LEFT JOIN book_authors ba ON ba.book_id = b.book_id
                LEFT JOIN authors a ON a.author_id = ba.author_id
                WHERE ub.user_id = $1`, [userId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to retrieve books");
        }
    }

    /**
     * @description Get books from user library via properties
     * @param {string} userId - App ID for user
     * @param {object} filters - Store properties for books
     * @return {object} - Books from user's library
     */
    /*
    static async getUserBooksByProperty(userId, filters = {})
    {
        TO BE IMPLEMENTED LATER IN DEVELOPMENT
    } */

    /**
     * @description Get books on a specific shelf
     * @param {string} userId - App ID for user
     * @param {string} shelf - Shelf for books
     * @return {object} - Books on specific shelf in user's library
     */
    static async getBooksByShelf(userId, shelf)
    {
        try
        {
            const result = await pool.query(
                `SELECT DISTINCT ON (ub.book_id) ub.*, b.title, b.page_count, b.description, b.publication_year, b.publisher, b.cover_url, a.author_name
                FROM user_books ub
                JOIN books b ON ub.book_id = b.book_id
                LEFT JOIN book_authors ba ON ba.book_id = b.book_id
                LEFT JOIN authors a ON a.author_id = ba.author_id
                WHERE ub.user_id = $1 AND shelf = $2`, [userId, shelf]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error(`You have no books on the ${shelf} shelf`);
        }
    }

    /**
     * @description Get a singular book title from a user's library
     * @param {string} userId - ID of user
     * @param {string} bookId - Required for specifics of user-book relationship
     * @returns {object} - Specific book in a user's library
     */
    static async getUserBook(userId, bookId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * from user_books 
                WHERE user_id = $1 AND book_id = $2`, [userId, bookId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("This book doesn't exist in this library");
        }
    }

    /**
     * @description Get progress count for a specific user-book relationship
     * @param {string} userId - ID of user
     * @param {string} startDate - Date of goal start
     * @param {string} endDate - Date of goal end
     * @param {string} measure - Pages or books
     * @param {string} genre - (optional) Genre of book
     */
    static async getProgressCount(userId, startDate, endDate, measure, genre = null)
    {
        try
        {
            let query;
            const params = [userId, startDate, endDate];

            if (measure === "books")
            {
                query = `
                    SELECT COUNT(*) AS progress
                    FROM user_books ub
                    JOIN books b ON ub.book_id = b.book_id
                    WHERE ub.user_id = $1
                    AND ub.shelf = 'finished'
                    AND ub.date_finished BETWEEN $2 AND $3
                `;
            }
            else if (measure === "pages")
            {
                query = `
                    SELECT COALESCE(SUM(b.page_count), 0) AS progress
                    FROM user_books ub
                    JOIN books b ON ub.book_id = b.book_id
                    WHERE ub.user_id = $1
                    AND ub.shelf = 'finished'
                    AND ub.date_finished BETWEEN $2 AND $3
                `;
            }
            else
            {
                throw new Error("Invalid measure type!");
            }

            if (genre)
            {
                query += `
                    AND ub.book_id IN (
                        SELECT bg.book_id FROM book_genres bg
                        JOIN genres g ON bg.genre_id = g.genre_id
                        WHERE g.genre_name = $4
                    )
                `;
                params.push(genre);
            }

            const result = await pool.query(query, params);
            return parseInt(result.rows[0].progress, 10);
        }
        catch (error)
        {
            throw new Error("Progress for this goal could not be obtained");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update book properties in user library
     * @param {string} userId - App ID for user
     * @param {string} bookId - Book ID
     * @param {object} filters - Update properties for book
     * @return {object} - Updated book with properties
     */
    static async updateUserBook(userId, bookId, updates = {})
    {
        if (Object.keys(updates).length === 0)
        {
            throw new Error("No fields to update");
        }

        let query = `UPDATE user_books SET `;
        const params = [userId, bookId];
        let paramCount = 2;
        const setClauses = [];

        if (updates.shelf) // Check if shelf is being updated
        {
            paramCount++;
            setClauses.push(`shelf = $${paramCount}`);
            params.push(updates.shelf);
        }

        if (updates.rating) // Check if rating is being updated
        {
            paramCount++;
            setClauses.push(`rating = $${paramCount}`);
            params.push(updates.rating);
        }

        if (updates.review) // Check if review is being updated
        {
            paramCount++;
            setClauses.push(`review = $${paramCount}`);
            params.push(updates.review);
        }

        if (updates.pageNumber) // Check if page number is being updated
        {
            paramCount++;
            setClauses.push(`page_number = $${paramCount}`);
            params.push(updates.pageNumber);
        }

        if ('dateStarted' in updates) // Check if date started is being updated
        {
            paramCount++;
            setClauses.push(`date_started = $${paramCount}`);
            params.push(updates.dateStarted);
        }

        if ('dateFinished' in updates) // Check if date finished is being updated
        {
            paramCount++;
            setClauses.push(`date_finished = $${paramCount}`);
            params.push(updates.dateFinished);
        }

        if (setClauses.length === 0)
        {
            throw new Error("No valid fields to update");
        }

        try
        {
            query += setClauses.join(', ');
            query += ` WHERE user_id = $1 AND book_id = $2 RETURNING book_id`;

            const result = await pool.query(query, params);
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to update book");
        }
    }

    // ============= DELETE =============
    /**
     * @description Remove book from user library
     * @param {string} userId - App ID for user
     * @param {string} bookId - Same ID as in database
     * @return {object} - Book added to user library
     */
    static async removeBookFromLibrary(userId, bookId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM user_books WHERE user_id = $1 AND book_id = $2
                RETURNING book_id`, [userId, bookId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete book");
        }
    }
}

module.exports = UserBook;