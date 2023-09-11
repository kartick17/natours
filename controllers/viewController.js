const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.alerts = (req, res, next) => {
    const alert = req.query;
    if (alert === 'booking')
        res.locals.alert = 'Your booking was successful!';

    next();
}

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Render that template using tour data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if (!tour)
        return next(new AppError('There is no tour with that name', 404))

    res.status(200)
        .render('tour', {
            title: `${tour.name} tour`,
            tour
        })
})

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all booking 
    const booking = await Booking.find({ user: req.user.id });

    // 2) Find tours with the return IDs
    let tours = [];
    if (booking) {
        const tourIDs = booking.map(el => el.tour._id);
        tours = await Tour.find({ _id: { $in: tourIDs } })
    }

    res.status(200)
        .render('overview', {
            title: 'My tours',
            tours
        })
})

exports.getLoginForm = (req, res) => {
    res.status(200)
        .render('login', {
            title: 'Log into your account'
        })
}

exports.getSignupForm = (req, res) => {
    res.status(200)
        .render('signup', {
            title: 'Create new account'
        })
}

exports.getUserAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        });

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
})

exports.resetPassword = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'Reset password',
        token: req.params.token
    })
}

exports.forgotPassword = (req, res) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgot Password'
    })
}