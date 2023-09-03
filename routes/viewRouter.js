const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController')

const router = express();

router.use(authController.isLoggedIn)

router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm)
router.get('/me', authController.protect, viewController.getUserAccount)
router.get('/reset-password/:token', viewController.resetPassword);
router.get('/forgot-password', viewController.forgotPassword);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;