/**
 * Service functions for recommendation
 */

const Recommendation = require("../models/recommendationModel");
const Book = require("../models/bookModel");

const {searchBooks, addBook} = require("./bookService");

/**
 * @description Add profile linked to user to database
 * @param {string} userId - User ID
 * @returns {object} - Created profile in database
 */
async function createBookRecommendation(userId)
{
    try
    {
        const ineligibleBooks = await Recommendation.getEligibleForRecommendation(userId);

        const finishedBooks = ineligibleBooks.finishedBooks
            .map(b => `${b.title} ${b.rating ? `(${b.rating} stars)` : ''}`)
            .join('\n');
        
        const existingRecs = await Recommendation.getUserRecommendations(userId);
        const alreadyRecommended = existingRecs.map(r => r.title).join('\n');

        const prompt = `Recommend ONE book based on this reading history:
                        
                        FINISHED BOOKS: ${finishedBooks}

                        ALREADY RECOMMENDED (do NOT recommend these):
                        ${alreadyRecommended}

                        Provide a recommendation they'd enjoy. Return ONLY as valid JSON:
                        {"title": "book title", "author": "author name",
                        "reason": "Why they'd like it (2-3 sentences)",
                        "genre": "main genre"}
        `;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            signal: controller.signal,
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 300,
                messages: [{role: "user",
                            content: prompt
                }]
            })
        });

        clearTimeout(timeout);

        const data = await response.json();
        let aiResponse = data.content[0].text;
        aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const {title, author, reason: aiReason, genre} = JSON.parse(aiResponse);

        try
        {
            const searchResults = await searchBooks('title', `${title} ${author}`);
            if (!searchResults.items || searchResults.items.length === 0)
            {
                throw new Error("No books found for recommendation");
            }

            const googleBookId = searchResults.items[0].id;

            const exists = await Book.bookExists(googleBookId);
            if (!exists)
            {
                await addBook(googleBookId);
            }

            const newRecommendation = await Recommendation.createRecommendation(userId, googleBookId, aiReason);

            return newRecommendation;
        }
        catch (error)
        {   
            throw new Error("New recommendation failed");
        }
    }
    catch (error)
    {
        throw new Error("Unable to create new recommendation");
    }
}

/**
 * @description Find all user recommendations via user ID
 * @param {string} userId - User ID stored in database
 * @return {object} - List of recommendations - pending, accepted, and dismissed
 */
async function getAllUserRecommendations(userId)
{
    try
    {
        const recommendations = await Recommendation.getUserRecommendations(userId);
        return recommendations;
    }
    catch (error)
    {
        throw new Error("Unable to retrieve recommendations");
    }
}

/**
 * @description Find specific recommendation via recommendation ID
 * @param {string} userId - User ID stored in database
 * @param {string} recommendationId - Recommendation ID stored in database
 * @return {object} - Single recommendation
 */
async function getUserRecommendation(userId, recommendationId)
{
    try
    {
        const userRecommendation = await Recommendation.getRecommendationById(recommendationId);
        if (!userRecommendation)
        {
            throw new Error("This recommendation does not exist");
        }
        
        if (userRecommendation.user_id !== userId)
        {
            throw new Error("Unauthorized");
        }

        return userRecommendation;
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            throw error;
        }
        if (error.message === "Unauthorized")
        {
            throw error;
        }
        throw new Error("Unable to retrieve recommendation");
    }
}

/**
 * @description Update recommendation properties in database
 * @param {string} userId - User ID stored in database
 * @param {string} recommendationId - Recommendation ID stored in database
 * @param {string} status - Status of recommendation ID 
 * @returns {object} - Updated recommendation
 */
async function updateUserRecommendationStatus(userId, recommendationId, status)
{
    try
    {
        const userRecommendation = await Recommendation.getRecommendationById(recommendationId);
        if (!userRecommendation)
        {
            throw new Error("This recommendation does not exist");
        }

        if (userRecommendation.user_id !== userId)
        {
            throw new Error("Unauthorized");
        }
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            throw error;
        }
        else if (error.message === "Unauthorized")
        {
            throw error;
        }
        throw new Error("Unable to check whether recommendation exists");
    }

    try
    {
        const result = await Recommendation.updateRecommendationStatus(recommendationId, status)
        return result;        
    }
    catch (error)
    {
        if (error.message === "No update made")
        {
            throw error;
        }
        throw new Error("Unable to update recommendation status");
    }
}

 /**
 * @description Delete a user recommendation in the database
 * @param {string} userId - User ID
 * @param {string} recommendationId - Recommendation ID stored in database
 * @return {object} - Deleted recommendation
 */
async function deleteUserRecommendation(userId, recommendationId)
{
    try
    {
        const userRecommendation = await Recommendation.getRecommendationById(recommendationId);
        if (!userRecommendation)
        {
            throw new Error("This recommendation does not exist");
        }

        if (userRecommendation.user_id !== userId)
        {
            throw new Error("Unauthorized");
        }
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            throw error;
        }
        else if (error.message === "Unauthorized")
        {
            throw error;
        }
        throw new Error("Unable to check whether recommendation exists");
    }

    try
    {
        const result = await Recommendation.deleteRecommendation(recommendationId);
        return result
    }
    catch (error)
    {
        throw new Error("Unable to delete recommendation");
    }
}

module.exports = {createBookRecommendation,
                  getAllUserRecommendations,
                  getUserRecommendation,
                  updateUserRecommendationStatus,
                  deleteUserRecommendation
};