/** Verify and sanitize user goal input
 * When a user creates or updates their goals, the input
 * needs to be validated to prevent XSS or crashing the app
 */

/**
 * @description Validate goal period
 * @param {string} goalPeriod - Length of period of goal
 * @returns {boolean} - Confirm acceptable range
 */
function isValidGoalPeriod(goalPeriod)
{
    if (!goalPeriod)
    {
        return true;
    }

    const goalPeriodSet = new Set(["daily", "weekly", "monthly", "yearly"]);

    return goalPeriodSet.has(goalPeriod);
}

/**
 * @description Validate goal measure
 * @param {string} goalMeasure - Measure of goal
 * @returns {boolean} - Confirm acceptable type
 */
function isValidGoalMeasure(goalMeasure)
{
    if (!goalMeasure)
    {
        return true;
    }

    const goalMeasureSet = new Set(["pages", "books"]);

    return goalMeasureSet.has(goalMeasure);
}

/**
 * @description Validate target number
 * @param {number} targetNumber - Target number
 * @param {string} goalMeasure - Type of goal 
 * @returns {boolean} - Confirm acceptable input
 */
function isValidTargetNumber(targetNumber, goalMeasure)
{
    if (!targetNumber)
    {
        return true;
    }

    if (goalMeasure === "pages")
    {
        return Number.isInteger(targetNumber) && targetNumber >= 1 && targetNumber <= 10000;
    }
    else if (goalMeasure === "books")
    {
        return Number.isInteger(targetNumber) && targetNumber >= 1 && targetNumber <= 500;
    }

    return false;
}

/**
 * @description Validate goal status
 * @param {string} goalStatus - Status of goal
 * @returns {boolean} - Confirm acceptable status
 */
function isValidGoalStatus(goalStatus)
{
    if (!goalStatus)
    {
        return true;
    }

    const goalStatusSet = new Set(["active", "completed", "failed"]);

    return goalStatusSet.has(goalStatus);
}

/**
 * @description Validate current progress
 * @param {number} currentProgress - Target number
 * @param {string} goalMeasure - Type of goal
 * @returns {boolean} - Confirm acceptable input
 */
function isValidCurrentProgress(currentProgress, goalMeasure)
{
    if (!currentProgress)
    {
        return true;
    }

    if (goalMeasure === "pages")
    {
        return Number.isInteger(currentProgress) && currentProgress >= 0 && currentProgress <= 10000;
    }
    else if (goalMeasure === "books")
    {
        return Number.isInteger(currentProgress) && currentProgress >= 0 && currentProgress <= 500;
    }

    return false;
}

module.exports = {isValidGoalPeriod,
                  isValidGoalMeasure,
                  isValidTargetNumber,
                  isValidGoalStatus,
                  isValidCurrentProgress
};