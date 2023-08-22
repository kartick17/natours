const express = require('express');
const bookingController = require('./../controllers/bookingCotroller');
const authController = require('./../controllers/authController');

const router = express.Router()

router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

module.exports = router;