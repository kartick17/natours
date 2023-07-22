const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

const jwtSign = id => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    // Create JWT token
    const token = jwtSign(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check email and password exists
    if (!email || !password)
        return next(new AppError('Please provide email and password', 400));


    // 2) Check user exists and password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.checkPassword(password, user.password)))
        return next(new AppError('Incorrect email or password', 401));

    // 3) If email and password are valid then send token
    const token = jwtSign(user._id);
    res.status(200).json({
        status: 'sucess',
        token
    })
})