/** Business logic layer between routes and models 
    Handles the following operations for authentication:
    - Takes data from routes
    - Performs business logic (hashing, JWT creation, validation)
    - Calls database models
    - Returns processed results
 */

// Argon2 for salting + hashing passwords
const argon2 = require("argon2");
// JWT for returning login token
const jwt = require("jsonwebtoken");

// Import User model to contact database
const User = require("../models/userModel");

/**
 * @description Complete user registration
 * @param {string} email - email address for registration
 * @param {string} password - password for registration
 * @returns {{token: string, userId: string}}
 */
async function registerUser(email, password)
{
    // Check whether user exists
    if (await User.findByEmail(email))
    {
        throw new Error("Register a different email address");
    }
    try
    {
        // Hash password
        const hash = await argon2.hash(password);

        // Call user model to database
        const newUser = await User.createUser(email, hash);
        // Create token upon registration to enable immediate login (improved UX)
        const token = jwt.sign({userId: newUser.user_id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        return {token: token, userId: newUser.user_id};
    }
    catch (error)
    {
        throw new Error("Registration failed");
    }
}

// Dummy hash enables burn time so that existing user checks take the same time as not
let DUMMY_HASH;
(async() => {DUMMY_HASH = await argon2.hash("dummy_password");})();

/**
 * @description Complete user login (post registration)
 * @param {string} email - email address for login
 * @param {string} password - password for login
 * @returns {{token: string, userId: string}}
 */
async function loginUser(email, password)
{
    const user = await User.findByEmail(email);

    // Check user exists
    if (!user)
    {
        if (DUMMY_HASH)
        {
            // If the user doesn't exist, use the dummy hash as the user and compare against entered password
            await argon2.verify(DUMMY_HASH || await argon2.hash("dummy_password"), password);
            // As per OWASP, provide minimal information about why a login attempt fail
            throw new Error("Invalid credentials");
        }
        else // (If login is VERY fast such that the IIFE is still computing, DUMMY_HASH may be undefined and thus a backup dummy hash is needed)
        {
            await argon2.verify(await argon2.hash("backup_dummy_hash"), password);
            throw new Error("Invalid credentials");
        }
    }

    try
    {
        // Compare passwords
        const match = await argon2.verify(user.password_hash, password);
        if (!match)
        {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({userId: user.user_id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        return {token: token, userId: user.user_id};
    }
    catch (error)
    {
        if (error.message === "Invalid credentials")
        {
            throw error;
        }
        throw new Error("Login failed");
    }
}

module.exports = {registerUser,
                  loginUser}