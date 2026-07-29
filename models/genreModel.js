const pool = require("../database/db");

class Genre
{
    static async findOrCreateGenre(genreName)
    {
        try
        {
            const result = await pool.query(
                `SELECT genre_id FROM genres WHERE genre_name = $1`, [genreName]
            );
            if (result.rows.length > 0)
            {
                return result.rows[0] || null;
            }
            else
            {
                const insert = await pool.query(
                    `INSERT INTO genres (genre_name) VALUES ($1) RETURNING genre_id`, [genreName]
                );
                return insert.rows[0] || null;
            }
        }
        catch (error)
        {
            throw new Error("Failed to retrieve genre name");
        }
    }

    /**
     * @description Find all genres in the genre table
     * @return {object} - All genres
     */
    static async getAllGenres()
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM genres`
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to retrieve genres");
        }
    }
}

module.exports = Genre;