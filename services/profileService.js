/**
 * Service functions for profiles
 */

const UserProfile = require("../models/profileModel");

/**
 * @description Add profile linked to user to database
 * @param {string} userId - User ID
 * @param {object} profileData - Profile object containing age, country, occupation, biography
 * @returns {object} - Created profile in database
 */
async function createUserProfile(userId, profileData)
{
    try
    {
        const exists = await UserProfile.profileExists(userId);
        if (exists)
        { 
            throw new Error("This profile already exists");
        }
    }
    catch (error)
    {
        if (error.message === "This profile already exists")
        {
            throw error;
        }
        throw new Error("Unable to check whether profile exists");
    }

    try
    {
        const {age, country, occupation, biography} = profileData;
        const result = await UserProfile.createProfile(userId, age, country, occupation, biography);

        return result;
    }
    catch (error)
    {
        throw new Error("Failed to create profile");
    }
}

/**
 * @description Get profile linked to user to database
 * @param {string} userId - User ID
 * @returns {object} - User profile
 */
async function getUserProfile(userId)
{
    try
    {
        const exists = await UserProfile.profileExists(userId);
        if (!exists)
        { 
            throw new Error("This profile does not exist");
        }
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether profile exists");
    }

    try
    {
        const profile = await UserProfile.findById(userId);
        return profile;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve profile");
    }
}

/**
 * @description Update profile properties in database
 * @param {string} userId - User ID stored in database
 * @param {object} updates - Properties to be updated
 * @returns {object} - Updated profile
 */
async function updateUserProfile(userId, updates)
{
    try
    {
        const exists = await UserProfile.profileExists(userId);
        if (!exists)
        { 
            throw new Error("This profile does not exist");
        }
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether profile exists");
    }

    if (Object.keys(updates).length === 0)
    {
        throw new Error("No updates made");
    }

    try
    {
        const result = await UserProfile.updateProfile(userId, updates);
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to update profile");
    }
}

/**
 * @description Increment user books read in profile
 * @param {string} userId - User ID linked to profile
 * @returns {object} - Incremented category
 */
async function incrementBooksRead(userId)
{
    try
    {
        return await UserProfile.incrementBooksRead(userId);
    }
    catch (error)
    {
        throw new Error("Failed to update books read count");
    }
}

/**
 * @description Decrement user books read in profile
 * @param {string} userId - User ID linked to profile
 * @returns {object} - Decremented category
 */
async function decrementBooksRead(userId)
{
    try
    {
        return await UserProfile.decrementBooksRead(userId);
    }
    catch (error)
    {
        throw new Error("Failed to update books read count");
    }
}

/**
 * @description Delete profile from database
 * @param {string} userId - User ID linked to profile
 * @returns {object} - Deleted profile
 */
async function deleteUserProfile(userId)
{
    try
    {
        const exists = await UserProfile.profileExists(userId);
        if (!exists)
        { 
            throw new Error("This profile does not exist");
        }
    }
    catch (error)
    {
        if (error.message === "This profile does not exist")
        {
            throw error;
        }
        throw new Error("Unable to check whether profile exists");
    }

    try
    {
        const deleted = await UserProfile.deleteProfile(userId);
        return deleted;
    }
    catch (error)
    {
        throw new Error("Failed to delete profile");
    }
}

module.exports = {createUserProfile,
                  getUserProfile,
                  updateUserProfile,
                  incrementBooksRead,
                  decrementBooksRead,
                  deleteUserProfile
}