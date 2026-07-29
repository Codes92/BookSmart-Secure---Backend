/**
 * Service functions for user languages
 */

const UserLanguages = require("../models/userLanguageModel");

/**
 * @description Add language linked to user to database
 * @param {string} userId - User ID
 * @param {string} languageId - Language ID from language table
 * @returns {object} - Created language in database
 */
async function addUserLanguage(userId, languageId)
{
    try
    {
        const result = await UserLanguages.addLanguage(userId, languageId);
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to add language");
    }
}

/**
 * @description Get languages linked to user in database
 * @param {string} userId - User ID
 * @returns {object} - User languages
 */
async function getUserLanguages(userId)
{
    try
    {
        const userLanguages = await UserLanguages.findLanguagesById(userId);
        return userLanguages;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve languages");
    }
}

/**
 * @description Delete user language from database
 * @param {string} userId - User ID linked to language
 * @param {string} languageId - Language ID
 * @returns {object} - Deleted language
 */
async function deleteUserLanguage(userId, languageId)
{
    try
    {
        const deletedLanguage = await UserLanguages.removeLanguage(userId, languageId);
        if (!deletedLanguage)
        {
            throw new Error("Language not found in list");
        }

        return deletedLanguage;
    }
    catch (error)
    {
        if (error.message === "Language not found in list")
        {
            throw error;   
        }
        throw new Error("Unable to delete language");
    }
}

module.exports = {addUserLanguage,
                  getUserLanguages,
                  deleteUserLanguage
};