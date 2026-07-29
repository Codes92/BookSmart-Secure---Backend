const pool = require("../database/db");

/* Create user profile class to contact database
 */

class UserProfile
{
    // ============= Exist =============
    /* Quick check to know if a profile exists in the db before inserting
    */
    /**
     * @description Check whether a profile exists in database
     * @param {string} userId - UserId linked to profile
     * @returns {boolean} - True or false whether the profile exists
     */
    static async profileExists(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT 1 FROM profiles WHERE user_id = $1`, [userId]
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
     * @description Create a new user profile linked to registered user
     * @param {string} userId - User ID
     * @param {string} age - User age
     * @param {string} country - User country
     * @param {string} occupation - User occupation
     * @param {string} biography - User biography
     * @return {object} - Return user profile
     */
    static async createProfile(userId, age, country, occupation, biography)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO profiles (user_id, age, country, occupation, biography) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [userId, age, country, occupation, biography]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            if (error.code === "23505")
            {
                throw new Error("You have already created a profile");
            }
            throw new Error("Failed to create profile");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update user profile
     * @param {string} userId
     * @param {object} updates - Properties to be updated
     * @return {object} - Return updated user profile
     */
    static async updateProfile(userId, updates = {})
    {
        if (Object.keys(updates).length === 0)
        {
            throw new Error("No fields to update");
        }

        let query = `UPDATE profiles SET `; // Base query
        const params = [userId]; // Changes made to profile
        let paramCount = 1; // Count number of changes to be made (length of params array)
        const setClauses = [];

        if (updates.age !== undefined)
        {
            paramCount++;
            setClauses.push(`age = $${paramCount}`);
            params.push(updates.age);
        }

        if (updates.country !== undefined)
        {
            paramCount++;
            setClauses.push(`country = $${paramCount}`);
            params.push(updates.country);
        }

        if (updates.occupation !== undefined)
        {
            paramCount++;
            setClauses.push(`occupation = $${paramCount}`);
            params.push(updates.occupation);
        }

        if (updates.biography !== undefined)
        {
            paramCount++;
            setClauses.push(`biography = $${paramCount}`);
            params.push(updates.biography);
        }

        if (setClauses.length === 0)
        {
            throw new Error("No valid fields to update");
        }

        try
        {
            // join setClauses and WHERE statement to make full query
            query += setClauses.join(', ');
            query += ` WHERE user_id = $1 RETURNING *`;

            const result = await pool.query(query, params);
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Profile update failed");
        }
    }

    /**
     * @description Increment a user's number of books read
     * @param {userId} - ID of user (link to profile)
     * @returns {object} - Incremented books
     */
    static async incrementBooksRead(userId)
    {
        try
        {
            const result = await pool.query(
                `UPDATE profiles 
                SET books_read = books_read + 1 WHERE user_id = $1 RETURNING books_read`, [userId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to update books read count");
        }
    }

    /**
     * @description Decrement a user's number of books read
     * @param {userId} - ID of user (link to profile)
     * @returns {object} - Decremented books
     */
    static async decrementBooksRead(userId)
    {
        try
        {
            const result = await pool.query(
                `UPDATE profiles SET books_read = GREATEST(books_read - 1, 0) 
                WHERE user_id = $1 RETURNING books_read`, [userId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to update books read count");
        }
    }

    // ============= FIND =============
    /**
     * @description Find a profile via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - Correct profile
     */
    static async findById(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT p.*, u.username
                FROM profiles p
                JOIN users u ON p.user_id = u.user_id
                WHERE p.user_id = $1`, [userId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Unable to find profile via ID");
        }
    }

    /**
     * 
     */

    // ============= DELETE =============
    /**
     * @description Delete a user profile
     * @param {string} userId - User ID
     * @returns {object} - Returns deleted user ID
     */
    static async deleteProfile(userId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM profiles WHERE user_id = $1 RETURNING user_id`, [userId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete profile");
        }
    }

    
}

module.exports = UserProfile;