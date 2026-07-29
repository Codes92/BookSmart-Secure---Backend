/**
 * Service functions for genres
 */

const Genre = require("../models/genreModel");

/**
 * @description Return list of all available genres
 * @returns {object} - List of genres
 */
async function getAllAvailableGenres()
{
    try
    {
        const result = await Genre.getAllGenres();
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to retrieve genres");
    }
}

module.exports = {getAllAvailableGenres};