const pool = require("../database/db");

class Goal
{
    // ============= Exist =============
    /* Quick check to know if a goal exists in the db before inserting
        One of the findBy functions could fulfill the role, but a focused function
        is more reliable and faster
    */
    /**
     * @description Find user goal via user ID
     * @param {string} goalId - Goal ID stored in database
     * @return {object} - Specific goal
     */
    static async getUserGoal(goalId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM goals WHERE goal_id = $1`, [goalId]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to retrieve goal");
        }
    }

    // ============= CREATE =============
     /**
     * @description Insert a new goal to goals table
     * @param {string} userId - User ID
     * @param {string} goalPeriod - Timeframe to achieve goal
     * @param {string} goalMeasure - The goal
     * @param {string} targetNumber - Number of pages or books etc
     * @param {string} genreId - Genre ID
     * @param {string} startDate
     * @param {string} endDate
     * @return {object} - Newly created user goal in database
     */
    static async createUserGoal(userId, goalPeriod, goalMeasure, targetNumber,
                                genreId, startDate, endDate)
    {
        try
        {
            const result = await pool.query(
                `INSERT INTO goals (user_id, goal_period, goal_measure, target_number,
                                    genre_id, start_date, end_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING goal_id`,
                [userId, goalPeriod, goalMeasure, targetNumber,
                                    genreId, startDate, endDate]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to create new goal");
        }
    }

    // ============= READ =============
    /**
     * @description Find all user goals via user ID
     * @param {string} userId - User ID stored in database
     * @return {object} - List of goals - complete and incomplete
     */
    static async getAllUserGoals(userId)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM goals WHERE user_id = $1`, [userId]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to retrieve user goals");
        }
    }

    /**
     * @description Find all goals via user ID
     * @param {string} userId - User ID stored in database
     * @param {string} status - Status of goals
     * @return {object} - List of goals according to status
     */
    static async getUserGoalsByStatus(userId, status)
    {
        try
        {
            const result = await pool.query(
              `SELECT * FROM goals WHERE user_id = $1 AND goal_status = $2`, [userId, status]
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error(`Failed to retrieve goals by ${status}`);
        }
    }

    /**
     * @description Find all active goals via user ID, period and measure
     * @param {string} userId - User ID stored in database
     * @param {string} goalPeriod - Period of goal
     * @param {string} goalMeasure - Measure of goal
     * @return {object} - List of goals according to ^^
     */
    static async getActiveByPeriodAndMeasure(userId, goalPeriod, goalMeasure)
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM goals WHERE user_id = $1 AND goal_period = $2 AND goal_measure = $3 and goal_status = 'active'`,
                [userId, goalPeriod, goalMeasure]
            );
            return result.rows[0] || null;
        }
        catch (error)
        {
            throw new Error("Failed to retrieve goal");
        }
    }

    // ============= UPDATE =============
    /**
     * @description Update the information of a goal in the database
     * @param {string} goalId - Goal ID stored in database
     * @param {object{string}} updates - The fields to be changed
     * @return {object} - Updated goal record in database
     */
    static async updateUserGoal(goalId, updates = {})
    {
        if (Object.keys(updates).length === 0)
        {
            throw new Error("No updates made");
        }

        let query = `UPDATE goals SET `; // Base query
        const params = [goalId]; // Changes made to this book
        let paramCount = 1; // Count number of changes to be made (length of params array)
        const setClauses = [];

        if (updates.goalPeriod) // Check if goal period is being updated
        {
            paramCount++;
            setClauses.push(`goal_period = $${paramCount}`);
            params.push(updates.goalPeriod);
        }

        if (updates.goalMeasure) // Check if goal measure is being updated
        {
            paramCount++;
            setClauses.push(`goal_measure = $${paramCount}`);
            params.push(updates.goalMeasure);
        }

        if (updates.targetNumber) // Check if target number is being updated
        {
            paramCount++;
            setClauses.push(`target_number = $${paramCount}`);
            params.push(updates.targetNumber);
        }

        if (updates.currentProgress) // Check if current progress is being updated
        {
            paramCount++;
            setClauses.push(`current_progress = $${paramCount}`);
            params.push(updates.currentProgress);
        }

        if (updates.genreId) // Check if genre ID is being updated
        {
            paramCount++;
            setClauses.push(`genre_id = $${paramCount}`);
            params.push(updates.genreId);
        }

        if (updates.startDate) // Check if start date is being updated
        {
            paramCount++;
            setClauses.push(`start_date = $${paramCount}`);
            params.push(updates.startDate);
        }

        if (updates.endDate) // Check if end date is being updated
        {
            paramCount++;
            setClauses.push(`end_date = $${paramCount}`);
            params.push(updates.endDate);
        }

        if (updates.goalStatus) // Check if goal_status is being updated
        {
            paramCount++;
            setClauses.push(`goal_status = $${paramCount}`);
            params.push(updates.goalStatus);
        }

        if (setClauses.length === 0)
        {
            throw new Error("No valid fields to update");
        }

        try
        {
            // join setClauses and WHERE statement to make full query
            query += setClauses.join(', ');
            query += ` WHERE goal_id = $1 RETURNING goal_id`;
            
            const result = await pool.query(query, params);
            return result.rows;
        }
        catch (error)
        {
            throw new Error("Goal update failed");
        }
    }

    // ============= DELETE =============
   /**
     * @description Delete a user goal in the database
     * @param {string} goalId - Goal ID stored in database
     * @return {object} - Deleted goal
     */
    static async deleteUserGoal(goalId)
    {
        try
        {
            const result = await pool.query(
                `DELETE FROM goals WHERE goal_id = $1 RETURNING goal_id`, [goalId]
            );
            return result.rows[0];
        }
        catch (error)
        {
            throw new Error("Failed to delete goal");
        }
    }
}

module.exports = Goal;