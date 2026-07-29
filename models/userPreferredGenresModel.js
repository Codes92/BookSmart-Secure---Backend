const pool = require("../database/db");

/* Create user genre class to contact database
 */

class UserPreferredGenres
{
    // ============= CREATE =============
    /**
     * @description Create user genres linked to a user ID
     * @param {string} userId - User ID
     * @param {string} genreId - Genre saved in DB
     * @return {object} - Return user genre
     */
    static async addGenre(userId, genreId)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO user_preferred_genres (user_id, genre_id) VALUES ($1, $2) RETURNING user_id`,
                [userId, genreId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to add genre");
        }
    }

    // ============= FIND =============
    /**
     * @description Find user genre preferrences via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - Correct genre preferrences
     */
    static async findGenresById(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM user_preferred_genres WHERE user_id = $1`, [userId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find preferred genres via ID");
        }
    }

    // ============= DELETE =============
    /**
     * @description Remove user genre preference
     * @param {string} userId - User ID
     * @param {string} genreId - Genre saved in DB
     * @returns {object} - Returns deleted genre
     */
    static async removeGenre(userId, genreId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM user_preferred_genres WHERE user_id = $1 AND genre_id = $2 RETURNING user_id`, 
                [userId, genreId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete genre");
        }
    }
}

module.exports = UserPreferredGenres;