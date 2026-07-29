/**
 * Service functions for preferences
 */

const UserPreferences = require("../models/userPreferencesModel");

/**
 * @description Add profile linked to user to database
 * @param {string} userId - User ID
 * @param {object} preferences - User preference object containing length and pace
 * @returns {object} - Created profile in database
 */
async function createUserPreferences(userId, preferences)
{
    try
    {
        const exists = await UserPreferences.preferencesExist(userId);
        if (exists)
        { 
            throw new Error("Your preferences already exist");
        }
    }
    catch (error)
    {
        if (error.message === "Your preferences already exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether preferences exist");
    }

    try
    {
        const {prefLength, prefPace} = preferences;
        const result = await UserPreferences.createPreferences(userId, prefLength, prefPace);

        return result;
    }
    catch (error)
    {
        throw new Error("Failed to create preferences");
    }
}

/**
 * @description Get preferences linked to user in database
 * @param {string} userId - User ID
 * @returns {object} - User preferences
 */
async function getUserPreferences(userId)
{
    try
    {
        const exists = await UserPreferences.preferencesExist(userId);
        if (!exists)
        { 
            throw new Error("Your preferences do not exist");
        }
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether preferences exists");
    }

    try
    {
        const profile = await UserPreferences.findPreferencesById(userId);
        return profile;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve preferences");
    }
}

/**
 * @description Update preference properties in database
 * @param {string} userId - User ID stored in database
 * @param {object} updates - Properties to be updated
 * @returns {object} - Updated preferences
 */
async function updateUserPreferences(userId, updates)
{
    try
    {
        const exists = await UserPreferences.preferencesExist(userId);
        if (!exists)
        { 
            throw new Error("Your preferences do not exist");
        }
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether preferences exists");
    }

    if (Object.keys(updates).length === 0)
    {
        throw new Error("No updates made");
    }

    try
    {
        const result = await UserPreferences.updatePreferences(userId, updates);
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to update preferences");
    }
}

/**
 * @description Delete user preferences from database
 * @param {string} userId - User ID linked to profile
 * @returns {object} - Deleted preferences
 */
async function deleteUserPreferences(userId)
{
    try
    {
        const exists = await UserPreferences.preferencesExist(userId);
        if (!exists)
        { 
            throw new Error("Your preferences do not exist");
        }
    }
    catch (error)
    {
        if (error.message === "Your preferences do not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether preferences exists");
    }

    try
    {
        const deleted = await UserPreferences.deletePreferences(userId);
        return deleted;
    }
    catch (error)
    {
        throw new Error("Failed to delete preferences");
    }
}

module.exports = {createUserPreferences,
                  getUserPreferences,
                  updateUserPreferences,
                  deleteUserPreferences
};