/**
 * Book Middleware
 */

/**
 * @description Validate book request - USED BY ADMIN SIDE ROUTE - This is for adding books admin side to the global database
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateAddBook(req, res, next)
{
    const {bookId} = req.body; // Obtain bookId

    // Ensure book ID is present and correct type (ID is required)
    if (!bookId || typeof bookId !== 'string')
    {
        return res.status(400).json({error: "Invalid book ID"});
    }

    next();
}

/**
 * @description Validate book search request - used in both admin and user side functions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} - Calls next() if valid, returns 400 if invalid
 */
function validateSearchBooks(req, res, next)
{
    const {searchParam, searchTerm} = req.query; // Get required information
    const validParams = new Set(['title', 'author', 'isbn']);
    if (!searchParam || !validParams.has(searchParam))
    {
        return res.status(400).json({error: "Invalid search parameters"});
    }

    if (!searchTerm || searchTerm.length > 200)
    {
        return res.status(400).json({error: "Invalid search term"});
    }

    next();
}

module.exports = {validateAddBook,
                  validateSearchBooks
};