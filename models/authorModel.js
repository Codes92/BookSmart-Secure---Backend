const pool = require("../database/db");

/* Create book author class to contact database
 */

class Author
{
    static async findOrCreateAuthor(authorName)
    {
        try
        {
            const result = await pool.query(
                `SELECT author_id FROM authors WHERE author_name = $1`, [authorName]
            );
            if (result.rows.length > 0)
            {
                return result.rows[0] || null;
            }
            else
            {
                const insert = await pool.query(
                    `INSERT INTO authors (author_name) VALUES ($1) RETURNING author_id`, [authorName]
                );
                return insert.rows[0] || null;
            }
        }
        catch (error)
        {
            throw new Error("Failed to retrieve author name");
        }
    }
}

module.exports = Author;