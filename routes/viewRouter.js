const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController')

const router = express();

router.use(authController.isLoggedIn)

router.get('/', viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)
router.get('/login', viewController.getLoginForm)
router.get('/me', viewController.getUserAccount)

module.exports = router;