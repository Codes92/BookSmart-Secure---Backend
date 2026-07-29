/**
 * Service functions for user preferred genres
 */

const UserPreferredGenres = require("../models/userPreferredGenresModel");

/**
 * @description Add genre linked to user to database
 * @param {string} userId - User ID
 * @param {string} genreId - Language ID from language table
 * @returns {object} - Created language in database
 */
async function addUserGenre(userId, genreId)
{
    try
    {
        const result = await UserPreferredGenres.addGenre(userId, genreId);
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to add genre");
    }
}

/**
 * @description Get genres linked to user in database
 * @param {string} userId - User ID
 * @returns {object} - User genres
 */
async function getUserGenres(userId)
{
    try
    {
        const userGenres = await UserPreferredGenres.findGenresById(userId);
        return userGenres;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve genres");
    }
}

/**
 * @description Delete user genre from database
 * @param {string} userId - User ID linked to genre
 * @param {string} genreId - Genre ID
 * @returns {object} - Deleted genre
 */
async function deleteUserGenre(userId, genreId)
{
    try
    {
        const deletedGenre = await UserPreferredGenres.removeGenre(userId, genreId);
        if (!deletedGenre)
        {
            throw new Error("Genre not found in list");
        }

        return deletedGenre;
    }
    catch (error)
    {
        if (error.message === "Genre not found in list")
        {
            throw error;   
        }
        throw new Error("Unable to delete genre");
    }
}

module.exports = {addUserGenre,
                  getUserGenres,
                  deleteUserGenre
};