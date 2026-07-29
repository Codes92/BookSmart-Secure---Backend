/**
 * User model to directly contact database
 * From this model, backend can:
 *      - create a new User
 *      - find a user by email
 *      - find a user by id
 */

const pool = require("../database/db");

// Create User class
class User
{
    /**
     * @description Insert a new user to database
     * @param {string} email - Email address
     * @param {string} username - Username
     * @param {string} password_hash - Password
     * @return {object} - Return new user ID
     */
    static async createUser(email, username, password_hash)
    {
        try
        {
            // Return only the user ID (RETURNING * exposes too much)
            const result = await pool.query(
                // Ensure to prevent SQL injection with $1, $2 etc...
                `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING user_id`,
                [email, username, password_hash]
            );
            return result.rows[0];
        }
        catch (error)
        {
            // PostgreSQL unique violation code (something added twice)
            if (error.code === "23505")
            {
                if (error.constraint === "users_username_unique")
                {
                    throw new Error("Username already in use");
                }
                throw new Error("Email already in use");
            }
            throw error; // Re-throw other errors   
        }
    };

    /**
     * @description Find a user via email
     * @param {string} email - Email address
     * @return {object} - Return user ID and password hash
     */
    static async findByEmail(email)
    {
        try
        {
            const result = await pool.query(
                `SELECT user_id, password_hash FROM users WHERE email = $1`, [email]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Database error during email lookup");
        }
    }

    /**
     * @description Find a user via user ID
     * @param {string} userId - User ID
     * @return {object} - Return user ID and password hash
     */
    static async findById(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT user_id, password_hash FROM users WHERE user_id = $1`, [userId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Database error during ID lookup");
        }
    }

    /**
     * @description Find a user by username
     * @param {string} username - Username
     * @returns {object} - Return user ID and password hash
     */
    static async findByUsername(username)
    {
        try
        {
            const result = await pool.query(
                `SELECT user_id, password_hash FROM users WHERE username = $1`, [username]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Database error during username lookup");
        }
    }

    /**
     * @description Change a user password in db with ID
     * @param {string} userId - userId
     * @param {string} password_hash - password hash
     * @return {object} - Return user ID and password hash
     */
    static async changePasswordById(userId, password_hash)
    {
        try
        {
            const result = await pool.query(
                `UPDATE users
                SET password_hash = $2
                WHERE user_id = $1 RETURNING user_id`, [userId, password_hash]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to change password");
        }
    }

    /**
     * @description Enable users to delete their account
     * @param {string} userId - User ID
     * @return {object} - Return user ID and password hash
     */
    static async deleteAccount(userId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM users WHERE user_id = $1 RETURNING user_id`, [userId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete account");
        }
    }
}

module.exports = User;