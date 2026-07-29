/** Verify and sanitize book user input
 * When a user adds a book to their library manually or via and API, the input
 * needs to be validated to prevent XSS or crashing the app
 */

const validator = require("validator"); // Contains ISBN checking method

// ===================== BOOK VALIDATION ======================= \\
// ============================================================= \\

/**
 * @description Remove HTML code and whitespaces from string input (extra layer against XSS)
 * @param {string} input - User input
 * @returns {string} - Sanitized string 
 */
function sanitizeString(input)
{
    // Avoid handling cases of non-string input
    if (!input || typeof input !== "string")
    {
        return input;
    }

    // Remove embedded HTML from user input and remove whitespaces
    return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * @description Validate a book title (limited length input also helps protect against malicious injection)
 * @param {string} bookTitle - Book title
 * @returns {boolean} - Confirms whether book title is valid
 */
function isValidBookTitle(bookTitle)
{
    // Sanitize string first
    const sanitizedTitle = sanitizeString(bookTitle);
    // Enforce reasonable length on title
    return sanitizedTitle.length > 0 && sanitizedTitle.length <= 255;
}

/**
 * @description Validate a book author
 * @param {string} bookAuthor - Book author
 * @returns {boolean} - Confirms whether book author input is valid
 */
function isValidAuthor(bookAuthor)
{
    // Sanitize string first
    const sanitizedAuthor = sanitizeString(bookAuthor);
    // Enforce reasonable length on author name
    return sanitizedAuthor.length > 0 && sanitizedAuthor.length <= 255;
}

/**
 * @description Validate an ISBN number
 * @param {string} isbn - ISBN number
 * @returns {boolean} - Confirms whether ISBN input is valid
 */
function isValidIsbn(isbn)
{
    return validator.isISBN(isbn);
}

/**
 * @description Validate page count
 * @param {number} pageCount - Number of pages of book
 * @returns {boolean} - Confirm acceptable number of pages
 */
function isValidPageCount(pageCount)
{
    if (!pageCount)
    {
        return true;
    }

    // Page count must not be any non-integer number
    return Number.isInteger(pageCount) && pageCount >= 0 && pageCount <= 5000;
}

/**
 * @description Validate publication year
 * @param {number} pubYear - Year of publication of book
 * @returns {boolean} - Confirm acceptable publication range
 */
function isValidPublicationYear(pubYear)
{
    const currentYear = new Date().getFullYear();
    return Number.isInteger(pubYear) && pubYear >= 1450 && pubYear <= currentYear;
}

/**
 * @description Validate publisher
 * @param {string} publisher - Publisher of book
 * @returns {boolean} - Confirm acceptable publisher
 */
function isValidPublisher(publisher)
{
    const sanitizedPublisher = sanitizeString(publisher);
    return sanitizedPublisher.length >= 0 && sanitizeString.length <= 50;
}

/**
 * @description Validate book description
 * @param {string} description - User/API description of book
 * @returns {boolean} - Confirm acceptable description
 */
function isValidDescription(description)
{
    if (!description) // Description optional
    {
        return true;
    }

    if (typeof description !== 'string')
    {
        return false;
    }
    // Remove HTML from string
    const sanitizedDescription = sanitizeString(description);
    // Limit description length to 5000 characters
    return sanitizedDescription.length <= 5000;
}

/**
 * @description Validate book shelf
 * @param {string} shelf - User reading status
 * @returns {boolean} - Confirm acceptable status
 */
function isValidShelf(shelf)
{
    // Acceptable shelf values
    const validShelves = new Set(['want to read', 'reading', 'finished', 'did not finish']);
    // Ensure input only belongs to one of the accepted values
    return typeof shelf === 'string' && validShelves.has(shelf);
}

/**
 * @description Validate book rating 
 * @param {number} rating - User rating of book
 * @returns {boolean} - Confirm acceptable rating
 */
function isValidRating(rating)
{
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * @description Validate user review input
 * @param {string} review - User review of book
 * @returns {boolean} - Confirm acceptable review
 */
function isValidReview(review)
{
    if (!review)
    {
        return true; // Review optional
    }
    // Remove HTML from string
    const sanitizedReview = sanitizeString(review);
    return sanitizedReview.length <= 5000; // Match schema limit
}

/**
 * This function should not be used unless a book is already in the user library
 * @description Validate page number (If user decides to register one)
 * @param {number} pageNumber - Current page number of book
 * @returns {boolean} - Confirm acceptable page number
 */
function isValidPageNumber(pageNumber)
{
    return Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber < 5000;
}

/**
 * @description Validate acceptable dates
 * @param {string} dateString
 * @returns {boolean} - Confirm acceptable date
 */
function isValidDate(dateString)
{
    const date = new Date(dateString);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    // Check the date is an actual date, is a number, is after 1450 and is not a future date beyond 2 years
    return date instanceof Date && !isNaN(date) && date.getFullYear() >= 1450 && date <= futureDate;
}

/**
 * This genre validation is used when the user adds a book from Google Books API
 * @description Validate acceptable genres from Google API
 * @param {string} genre - genre
 * @returns {boolean} - Confirm acceptable genre
 */
function isValidAPIGenre(genre)
{
    // Sanitize input from external sources WITHOUT FAIL
    const sanitizedGenre = sanitizeString(genre);

    // Check length
    return sanitizedGenre.length > 0 && sanitizedGenre.length <= 50;
}

/**
 * This genre validation is used when a user wishes to add a book to their library manually
 * @description Validate acceptable genres from user inputted book
 * @param {string} genre - genre
 * @returns {boolean} - Confirm acceptable genre
 */
function isValidUserGenre(genre)
{
    if (typeof genre !== 'string')
    {
        return false;
    }
    
    // Set enables O(1) lookup
    const validGenres = new Set(['Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 
							 'Romance', 'Thriller', 'Historical Fiction', 'Biography', 'Autobiography', 
                             'History', 'Self-Help', 'Science', 'Philosophy', 'Poetry', 'Graphic Novel',
							 'Children', 'Young Adult', 'Horror', 'Crime', 'Adventure', 'Classic', 'Humour', 
							  'Travel', 'Memoir', 'Cookery', 'Art', 'Psychology', 'Business', 'Politics',
                             'Religion', 'Manga', 'Foreign Language', 'Textbook']);
    return validGenres.has(genre);
}

/**
 * @description Validate language
 * @param {string} language - Language of book
 * @returns {boolean} - Confirm validated language
 */
function isValidLanguage(language)
{
    if (!language) // Language optional
    {
        return true;
    }

    const sanitizedLanguage = sanitizeString(language);
    return sanitizedLanguage.length >= 1 && sanitizedLanguage.length <= 50;
}

module.exports = {
    sanitizeString,
    isValidBookTitle,
    isValidAuthor,
    isValidIsbn,
    isValidPageCount,
    isValidPublicationYear,
    isValidPublisher,
    isValidDescription,
    isValidShelf,
    isValidRating,
    isValidReview,
    isValidPageNumber,
    isValidDate,
    isValidAPIGenre,
    isValidUserGenre,
    isValidLanguage
}