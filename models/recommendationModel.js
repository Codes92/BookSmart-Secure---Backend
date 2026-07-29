const pool = require("../database/db");

class Recommendations
{
    // ============= EXISTS =============
    /**
     * @description Checks if a book is eligible for recommendation to not recommend books already finished
     * @param {string} userId - User ID stored in database
     * @return {object} - List of books with 'finished' shelf status and 'pending' recommendations
     */
    static async getEligibleForRecommendation(userId)
    {
        try
        {
            const finishedBooks = await pool.query(
                `SELECT b.* FROM books b
                JOIN user_books ub ON ub.book_id = b.book_id
                WHERE ub.user_id = $1 AND shelf = 'finished'`, [userId]
            );
            
            const recommendedBooks = await pool.query(
                `SELECT b.* FROM books b
                JOIN recommendations r ON r.book_id = b.book_id
                WHERE r.user_id = $1 AND status = 'pending'`, [userId]
            );

            return {
                finishedBooks: finishedBooks.rows || [],
                pendingRecommendations: recommendedBooks.rows || []
            };
        }
        catch (error)
        {
            throw new Error ("Failed to check recommendation eligibility");
        }
    }

    // ============= CREATE =============
    /**
     * @description Insert a new recommendations to recommendations table
     * @param {string} userId - User ID
     * @param {string} bookId - ID of recommended book
     * @param {string} reason - Store reason in database to provide back to user
     * @return {object} - Newly created user recommendation in database
     */
    static async createRecommendation(userId, bookId, reason)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO recommendations (user_id, book_id, reason)
                VALUES ($1, $2, $3) RETURNING user_id, book_id`, [userId, bookId, reason]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to create recommendation");
        }
    }

    // ============= READ =============
    /**
     * @description Find all user recommendations via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - List of recommendations - pending, accepted, and dismissed
     */
    static async getUserRecommendations(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT r.*, b.title, a.author_name 
                FROM recommendations r 
                JOIN books b ON b.book_id = r.book_id
                LEFT JOIN book_authors ba ON ba.book_id = b.book_id
                LEFT JOIN authors a ON a.author_id = ba.author_id
                WHERE r.user_id = $1`, [userId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to retrieve recommendations");
        }
    }

    /**
     * @description Find a recommendation via its ID
     * @param {string} recommendationId - Recommendation ID stored in database
     * @return {object} - Single book recommendation
     */
    static async getRecommendationById(recommendationId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM recommendations WHERE recommendation_id = $1`, [recommendationId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to retrieve recommendation via ID");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update the status of a recommendation
     * @param {string} recommendationId - Recommendation ID stored in database
     * @param {string} status - Current status of a recommendation
     * @return {object} - Updated status of recommendation
     */
    static async updateRecommendationStatus(recommendationId, status)
    {
        try
        {
            const result = await pool.query(
                `UPDATE recommendations 
                SET status = $2, dismissed_at = CASE WHEN $3 = 'dismissed'
                THEN CURRENT_TIMESTAMP ELSE dismissed_at END
                WHERE recommendation_id = $1
                RETURNING recommendation_id`, [recommendationId, status, status]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to update recommendation status");
        }
    }

    // ============= DELETE =============
    // Important function as user's can only be re-recommended a book if the record doesn't exist in the db
    /**
     * @description Delete a user recommendation in the database
     * @param {string} recommendationId - Recommendation ID stored in database
     * @return {object} - Deleted recommendation
     */
    static async deleteRecommendation(recommendationId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM recommendations WHERE recommendation_id = $1
                RETURNING recommendation_id`, [recommendationId] 
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete recommendation");
        }
    }
}

module.exports = Recommendations;