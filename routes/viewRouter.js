const express = require('express');
const viewController = require('./../controllers/viewController');

const router = express();

router.get('/', viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)
router.get('/login', viewController.getLoginForm)

module.exports = router;