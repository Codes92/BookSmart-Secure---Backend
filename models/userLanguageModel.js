const pool = require("../database/db");

/* Create user languages class to contact database
 */

class UserLanguages
{
    // ============= CREATE =============
    /**
     * @description Create user languages linked to a user ID
     * @param {string} userId - User ID
     * @param {string} languageId - Language saved in DB
     * @return {object} - Return user languages
     */
    static async addLanguage(userId, languageId)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO user_languages (user_id, language_id) VALUES ($1, $2) RETURNING user_id`,
                [userId, languageId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to add language");
        }
    }

    // ============= FIND =============
    /**
     * @description Find user languages via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - Correct languages
     */
    static async findLanguagesById(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM user_languages WHERE user_id = $1`, [userId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Unable to find languages via ID");
        }
    }

    // ============= DELETE =============
    /**
     * @description Remove user language
     * @param {string} userId - User ID
     * @param {string} languageId - Language saved in DB
     * @returns {object} - Returns deleted user language
     */
    static async removeLanguage(userId, languageId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM user_languages WHERE user_id = $1 AND language_id = $2 RETURNING user_id`, 
                [userId, languageId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete language");
        }
    }
}

module.exports = UserLanguages;