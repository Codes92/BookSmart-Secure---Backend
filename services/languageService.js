/**
 * Service functions for languages
 */

const Language = require("../models/languageModel");

/**
 * @description Return list of all available languages
 * @returns {object} - List of languages
 */
async function getAllAvailableLanguages()
{
    try
    {
        const result = await Language.getAllLanguages();
        return result;
    }
    catch (error)
    {
        throw new Error("Failed to retrieve languages");
    }
}

module.exports = {getAllAvailableLanguages};