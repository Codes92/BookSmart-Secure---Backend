const pool = require("../database/db");

/* Create user preferences class to contact database
 */

class UserPreferences
{
    // ============= Exist =============
    /* Quick check to know if a preferences exist in the db before inserting
    */
    /**
     * @description Check whether preferences exists in database
     * @param {string} userId - UserId linked to profile
     * @returns {boolean} - True or false whether preferences exist
     */
    static async preferencesExist(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT 1 FROM user_preferences WHERE user_id = $1`, [userId]
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
     * @description Create user preferences linked to a user ID
     * @param {string} userId - User ID
     * @param {string} prefLength - Preferred length of books
     * @param {string} prefPace - Preferred pace of reader
     * @return {object} - Return user preferences
     */
    static async createPreferences(userId, prefLength, prefPace)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO user_preferences (user_id, preferred_length, reading_pace) 
                VALUES ($1, $2, $3) RETURNING user_id`,
                [userId, prefLength, prefPace]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            if (error.code === "23505")
            {
                throw new Error("You have already created your preferences");
            }
            throw new Error("Failed to create preferences");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update user profile
     * @param {string} userId
     * @param {object} updates - Properties to be updated
     * @return {object} - Return updated user profile
     */
    static async updatePreferences(userId, updates = {})
    {
        if (Object.keys(updates).length === 0)
        {
            throw new Error("No updates made");
        }

        let query = `UPDATE user_preferences SET `; // Base query
        const params = [userId]; // Changes made to user preferences
        let paramCount = 1; // Count number of changes to be made (length of params array)
        const setClauses = [];

        if (updates.prefLength !== undefined)
        {
            paramCount++;
            setClauses.push(`preferred_length = $${paramCount}`);
            params.push(updates.prefLength);
        }

        if (updates.prefPace !== undefined)
        {
            paramCount++;
            setClauses.push(`reading_pace = $${paramCount}`);
            params.push(updates.prefPace);
        }

        if (setClauses.length === 0)
        {
            throw new Error("No valid fields to update");
        }

        try
        {
            // join setClauses and WHERE statement to make full query
            query += setClauses.join(', ');
            query += ` WHERE user_id = $1 RETURNING user_id`;

            const result = await pool.query(query, params);
            return result.rows;
        }
        catch (error)
        {
            throw new Error("Preferences update failed");
        }
    }

    // ============= FIND =============
    /**
     * @description Find user preferences via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - Correct preferences
     */
    static async findPreferencesById(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM user_preferences WHERE user_id = $1`, [userId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Unable to find preferences via ID");
        }
    }

    // ============= DELETE =============
    /**
     * @description Delete user preferences
     * @param {string} userId - User ID
     * @returns {object} - Returns deleted user preferences
     */
    static async deletePreferences(userId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM user_preferences WHERE user_id = $1 RETURNING user_id`, [userId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete preferences");
        }
    }
}

module.exports = UserPreferences;