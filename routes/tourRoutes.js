const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

// router.param('id', checkId);

// Nested routes(If review found in URL so redirect to review route)
router.use('/:tourId/reviews', reviewRoutes);

router.route('/best-5-economical')
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours
    )

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlng')
    .get(tourController.getToursWithin)

router.route('/distances/:latlng')
    .get(tourController.getDistances)

router.route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
    )

router.route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    )

module.exports = router;