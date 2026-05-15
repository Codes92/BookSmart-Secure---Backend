const { validateEmail } = require("../validators/emailValidator");
const { validatePassword, checkPwnedPassword } = require("../validators/passwordValidator");


/**
 * @description Validate registration middleware
 * @return {object{boolean, string}} - Email validated or not with message
 */
async function validateRegistration(req, res, next)
{
    const {email, password} = req.body;

    if (!email || !password)
    {
        return res.status(400).json({error: "Email and password required"});
    }

    try
    {
        const emailResult = await validateEmail(email);
        // Check email is valid --> validateEmail returns {valid: boolean, message: string}
        if (!emailResult.valid)
        {
            return res.status(400).json({error: emailResult.message});
        }

        req.body.email = emailResult.trimmed;
    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({error: "Registration failed"});
    }

    try
    {
        const passwordResult = validatePassword(password);
        if (!passwordResult.valid)
        {
            return res.status(400).json({error: passwordResult.message});
        }
    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({error: "Registration failed"});
    }

    try
    {
        const pwnedCheck = await checkPwnedPassword(password);
        if (!pwnedCheck.valid)
        {
            return res.status(400).json({error: pwnedCheck.message});
        }
    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({error: "Registration failed"});
    }

    next();
}

async function validateLogin(req, res, next)
{
    const {email, password} = req.body;

    if (!email || !password)
    {
        return res.status(400).json({error: "Email and password required"});
    }

    if (email.length > 255 || password.length > 128)
    {
        return res.status(400).json({error: "Invalid input"});
    }

    try
    {
        const emailResult = await validateEmail(email);
        if (!emailResult.valid)
        {
            return res.status(400).json({error: emailResult.message});
        }

        req.body.email = emailResult.trimmed;
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json({error: "Login failed"});
    }

    next();
}

module.exports = {validateRegistration, 
                  validateLogin};