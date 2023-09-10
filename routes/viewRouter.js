const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingCotroller');

const router = express();

router.use(authController.isLoggedIn)

router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)
router.get('/me', authController.protect, viewController.getUserAccount)
router.get('/my-tours', authController.protect, viewController.getMyTours)

router.use(authController.isAccessAccount)

router.get('/login', viewController.getLoginForm)
router.get('/signup', viewController.getSignupForm)
router.get('/reset-password/:token', viewController.resetPassword);
router.get('/forgot-password', viewController.forgotPassword);

// router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;