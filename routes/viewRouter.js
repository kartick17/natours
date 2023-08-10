const express = require('express');
const viewController = require('./../controllers/viewController');

const router = express();

router.get('/', viewController.getOverview)
router.get('/tour', viewController.getTour)

module.exports = router;