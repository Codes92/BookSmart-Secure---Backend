/* Routes for authentication */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");
const { validateRecommendationID, validateUpdateRecommendation } = require("../middleware/recommendationMiddleware");
const { deleteUserRecommendation, getAllUserRecommendations, getUserRecommendation, updateUserRecommendationStatus, createBookRecommendation } = require("../services/recommendationService");
const { recommendationLimiter } = require("../middleware/rateLimiter");


router.post("/", isLoggedIn, recommendationLimiter, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        
        const createRecommendation = await createBookRecommendation(userId);

        res.json({createRecommendation});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.get("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId; 

        const allRecommendations = await getAllUserRecommendations(userId);
        res.json({allRecommendations});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.get("/:recommendationId", isLoggedIn, validateRecommendationID, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const recommendationId = req.params.recommendationId;

        const recommendation = await getUserRecommendation(userId, recommendationId);
        res.json({recommendation});
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            return res.status(404).send(error.message);
        }
        if (error.message === "Unauthorized")
        {
            return res.status(403).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.patch("/:recommendationId", isLoggedIn, validateRecommendationID, validateUpdateRecommendation, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const recommendationId = parseInt(req.params.recommendationId);
        const status = req.body.status;

        const updateRecommendation = await updateUserRecommendationStatus(userId, recommendationId, status);
        res.json({updateRecommendation});        
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            return res.status(404).send(error.message);
        }
        if (error.message === "Unauthorized")
        {
            return res.status(403).send(error.message);
        }
        if (error.message === "No update made")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.delete("/:recommendationId", isLoggedIn, validateRecommendationID, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const recommendationId = req.params.recommendationId;
        const deletedRecommendation = await deleteUserRecommendation(userId, recommendationId);

        res.json({deletedRecommendation});
    }
    catch (error)
    {
        if (error.message === "This recommendation does not exist")
        {
            return res.status(404).send(error.message);
        }
        if (error.message === "Unauthorized")
        {
            return res.status(403).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;