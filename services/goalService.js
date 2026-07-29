/**
 * Service functions for goals
 */

const Goal = require("../models/goalModel");
const UserBook = require("../models/userBookModel");

/**
 * @description Add goal linked to user to database
 * @param {string} userId - User ID
 * @param {object} goalData - Goal object containing fields for goal
 * @returns {object} - Created goal in database
 */
async function createGoal(userId, goalData)
{
    const {goalPeriod, goalMeasure, targetNumber, 
            genreId, startDate, endDate} = goalData;

    try
    {
        const overlappingGoal = await Goal.getActiveByPeriodAndMeasure(userId, goalPeriod, goalMeasure);
        if (overlappingGoal)
        {
            throw new Error("This goal already exists");
        }
    }
    catch (error)
    {
        if (error.message === "This goal already exists")
        {
            throw error;
        }
        throw new Error("Unable to check whether goal exists");
    }

    try
    {
        const newGoal = await Goal.createUserGoal(userId, goalPeriod, goalMeasure, targetNumber, 
            genreId, startDate, endDate);

        return newGoal;
    }
    catch (error)
    {
        throw new Error("Failed to create goal");
    }
}

/**
 * @description Get goals linked to user to database
 * @param {string} userId - User ID
 * @returns {object} - User goals
 */
async function getUserGoals(userId)
{
    try
    {
        const goals = await Goal.getAllUserGoals(userId);
        const goalsWithProgress = await Promise.all(
            goals.map(async (goal) => {
                const progress = await UserBook.getProgressCount(
                    userId,
                    goal.start_date,
                    goal.end_date,
                    goal.goal_measure,
                    goal.genre
                );
                return {...goal, current_progress: progress};
            })
        );

        return goalsWithProgress;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve goals");
    }
}

/**
 * @description Get goals linked to user to database by status
 * @param {string} userId - User ID
 * @param {string} status - Status type of goal
 * @returns {object} - User goals by status
 */
async function getGoalsByStatus(userId, status) 
{
    try
    {
        const goals = await Goal.getUserGoalsByStatus(userId, status);
        const goalsWithProgress = await Promise.all(
            goals.map(async (goal) => {
                const progress = await UserBook.getProgressCount(
                    userId,
                    goal.start_date,
                    goal.end_date,
                    goal.goal_measure,
                    goal.genre
                );
                return {...goal, current_progress: progress};
            })
        );

        return goalsWithProgress;
    }
    catch (error)
    {
        throw new Error(`Unable to retrieve goals by ${status}`)
    }
}

/**
 * @description Update user goal properties in database
 * @param {string} userId - User ID stored in database
 * @param {string} goalId - Goal ID
 * @param {object} updates - Properties to be updated
 * @returns {object} - Updated user goal
 */
async function updateGoal(userId, goalId, updates)
{
    try
    {
        const goal = await Goal.getUserGoal(goalId);
        if (!goal)
        {
            throw new Error("This goal does not exist");
        }

        if (goal.user_id !== userId)
        {
            throw new Error("Unauthorized");
        }
    }
    catch (error)
    {
        if (error.message === "This goal does not exist")
        {
            throw error;
        }
        else if (error.message === "Unauthorized")
        {
            throw error;
        }
        throw new Error("Unable to check whether goal exists");
    }

    try
    {
        const result = await Goal.updateUserGoal(goalId, updates)
        return result;
    }
    catch (error)
    {
        if (error.message === "No updates made")
        {
            throw error;
        }
        throw new Error("Unable to update goal");
    }
}

/**
 * @description Delete a user goal in the database
 * @param {string} goalId - Goal ID stored in database
 * @return {object} - Deleted goal
 */
async function deleteGoal(userId, goalId)
{
    try
    {
        const goal = await Goal.getUserGoal(goalId);
        if (!goal)
        {
            throw new Error("This goal does not exist");
        }

        if (goal.user_id !== userId)
        {
            throw new Error("Unauthorized");
        }
    }
    catch (error)
    {
        if (error.message === "This goal does not exist")
        {
            throw error;
        }
        else if (error.message === "Unauthorized")
        {
            throw error;
        }
        throw new Error("Unable to check whether goal exists");
    }

    try
    {
        const result = await Goal.deleteUserGoal(goalId);
        return result;
    }
    catch (error)
    {
        throw new Error("Unable to delete goal");
    }
}

module.exports = {createGoal,
                  getUserGoals,
                  getGoalsByStatus,
                  updateGoal,
                  deleteGoal
};