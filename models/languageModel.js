const pool = require("../database/db");

class Language
{
    /**
     * @description Find all languages in the language table
     * @return {object} - All languages
     */
    static async getAllLanguages()
    {
        try
        {
            const result = await pool.query(
                `SELECT * FROM languages`
            );
            return result.rows || [];
        }
        catch (error)
        {
            throw new Error("Failed to retrieve languages");
        }
    }
}

module.exports = Language;