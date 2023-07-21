const express = require('express');
const { createTour, getTour, getAllTours, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan } = require('./../controllers/tourController');

const router = express.Router();

// router.param('id', checkId);

router.route('/best-5-economical').get(aliasTopTours, getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route('/')
    .get(getAllTours)
    .post(createTour)

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

module.exports = router;