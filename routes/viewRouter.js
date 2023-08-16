const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController')

const router = express();

router.use(authController.isLoggedIn)

router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/me', authController.protect, viewController.getUserAccount)

module.exports = router;