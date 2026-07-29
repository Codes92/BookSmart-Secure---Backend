/**
 * Goal Middleware
 */

const { isValidDate } = require("../validators/bookValidator");
const { isValidGoalPeriod, isValidGoalMeasure, isValidTargetNumber, isValidCurrentProgress, isValidGoalStatus } = require("../validators/goalValidator");

/**
 * @description Validate profile request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateCreateGoal(req, res, next)
{
    const {goalPeriod, goalMeasure, targetNumber,
           startDate, endDate, genreId} = req.body;

    if (!goalPeriod)
    {
        return res.status(400).json({error: "Goal period required"});
    }

    if (!goalMeasure)
    {
        return res.status(400).json({error: "Goal measure required"});
    }

    if (!targetNumber)
    {
        return res.status(400).json({error: "Target number required"});
    }

    if (!startDate)
    {
        return res.status(400).json({error: "Start date required"});
    }

    if (!endDate)
    {
        return res.status(400).json({error: "End date required"});
    }
    
    if (!isValidGoalPeriod(goalPeriod))
    {
        return res.status(400).json({error: "Invalid goal period"});
    }

    if (!isValidGoalMeasure(goalMeasure))
    {
        return res.status(400).json({error: "Invalid goal measure"});
    }

    if (!isValidTargetNumber(targetNumber, goalMeasure))
    {
        return res.status(400).json({error: "Invalid target measure"});
    }

    if (!isValidDate(startDate))
    {
        return res.status(400).json({error: "Invalid start date"});
    }

    if (!isValidDate(endDate))
    {
        return res.status(400).json({error: "Invalid end date"});
    }

    next();
}

/**
 * @description Validate profile request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateUpdateGoal(req, res, next)
{
    const validFields = new Set(['goalPeriod', 'goalMeasure', 'targetNumber', 'currentProgress',
                                 'startDate', 'endDate', 'genreId', 'goalStatus'
    ]);

    if (!req.body.updates)
    {
        return res.status(400).json({error: "No updates made"});
    }

    if (req.body.updates)
    {
        const invalidFields = Object.keys(req.body.updates).filter(key => !validFields.has(key));
        if (invalidFields.length > 0)
        {
            return res.status(400).json({error: "Invalid fields in update"});
        }
    }

    const {goalPeriod, goalMeasure, targetNumber, currentProgress,
           startDate, endDate, genreId, goalStatus} = req.body.updates;
    
    if (goalPeriod && !isValidGoalPeriod(goalPeriod))
    {
        return res.status(400).json({error: "Invalid goal period"});
    }

    if (goalMeasure && !isValidGoalMeasure(goalMeasure))
    {
        return res.status(400).json({error: "Invalid goal measure"});
    }
    
    if (targetNumber&& !isValidTargetNumber(targetNumber, goalMeasure))
    {
        return res.status(400).json({error: "Invalid target measure"});
    }

    if (currentProgress && !isValidCurrentProgress(currentProgress, goalMeasure))
    {
        return res.status(400).json({error: "Invalid current progress"});
    }
    
    if (startDate && !isValidDate(startDate))
    {
        return res.status(400).json({error: "Invalid start date"});
    }

    if (endDate && !isValidDate(endDate))
    {
        return res.status(400).json({error: "Invalid end date"});
    }

    if (goalStatus && !isValidGoalStatus(goalStatus))
    {
        return res.status(400).json({error: "Invalid goal status"});
    }

    next();
}

module.exports = {validateCreateGoal,
                  validateUpdateGoal
};