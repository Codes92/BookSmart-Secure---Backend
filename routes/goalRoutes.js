/* Routes for goals */
const express = require("express");
const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");
const { validateCreateGoal, validateUpdateGoal } = require("../middleware/goalMiddleware");

const { createGoal, getUserGoals, getGoalsByStatus, updateGoal, deleteGoal } = require("../services/goalService");

router.post("/", isLoggedIn, validateCreateGoal, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const goalData = req.body;

        const addGoal = await createGoal(userId, goalData);
        res.status(201).json({addGoal});
    }
    catch (error)
    {
        if (error.message === "This goal already exists")
        {
            return res.status(409).send(error.message);
        }
        if (error.message === "Failed to create goal")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.get("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;

        const userGoals = await getUserGoals(userId);
        res.json({userGoals});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.get("/goals-status", isLoggedIn, async (req, res) => {

    try
    {
        const userId = req.user.userId;
        const goalStatus = req.query.status;
        if (!goalStatus || !['active', 'completed', 'failed'].includes(goalStatus))
        {
            return res.status(400).json({error: "Invalid or missing status"});
        }

        const goalsByStatus = await getGoalsByStatus(userId, goalStatus);
        res.json({goalsByStatus});
    }
    catch (error)
    {
        res.status(500).send(error.message);
    }
});

router.patch("/", isLoggedIn, validateUpdateGoal, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const goalId = req.body.goalId;
        const updates = req.body.updates;

        const updatedGoal = await updateGoal(userId, goalId, updates);
        res.json({updatedGoal});
    }
    catch (error)
    {
        if (error.message === "This goal does not exist")
        {
            return res.status(404).send(error.message);
        }
        if (error.message === "Unauthorized")
        {
            return res.status(403).send(error.message);
        }
        if (error.message === "No updates made")
        {
            return res.status(400).send(error.message);
        }
        res.status(500).send(error.message);
    }
});

router.delete("/", isLoggedIn, async (req, res) => {
    try
    {
        const userId = req.user.userId;
        const goalId = req.body.goalId;

        const deletedGoal = await deleteGoal(userId, goalId);
        res.json({deletedGoal});
    }
    catch (error)
    {
        if (error.message === "This goal does not exist")
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