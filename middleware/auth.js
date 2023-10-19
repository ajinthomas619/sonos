const user = require('../models/usermodel');

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await user.findById(req.session.user_id);

            // Check if user exists and is active
            if (userData && userData.is_active === "true") {
                next(); // User is active, proceed to the next middleware
            } else {
                req.session.destroy(); // User is not active or does not exist, destroy the session
                res.redirect('/login'); // Redirect to login page
            }
        } else {
            res.redirect('/login'); // User is not logged in, redirect to login page
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/login'); // Handle errors by redirecting to login page
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/'); // Redirect to home page if the user is already logged in
        } else {
            next(); // User is not logged in, proceed to the next middleware
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}
