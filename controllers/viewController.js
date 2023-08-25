const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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

    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;"
    )
        .render('tour', {
            title: `${tour.name} tour`,
            tour
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
