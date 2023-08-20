const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const jwtSign = id => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
    // expiresIn: 100   //100s
});

const createSendToken = (user, statusCode, res) => {
    // Create JWT token
    const token = jwtSign(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + 31 * 24 * 60 * 60),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    if (req.body.role && req.body.role === 'admin') {
        return next(
            new AppError('User can not create admin profile', 400)
        )
    };

    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 200, res);
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
    createSendToken(user, 200, res);
    console.log(user);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and checkof it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please login to get access!!', 401)
        );
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token is no longer exists!!', 401)
        );
    }

    // 4) Check user changed password after the token was issued
    const changed = currentUser.changePasswordAfter(decoded.iat);
    if (changed) {
        return next(
            new AppError('User recently changed password! Please log in  again.', 401)
        );
    }

    // GRANT ACCESS USER TO PROTECTED ROUTE 
    req.user = currentUser;
    next();
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Verify loken
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check user changed password after the token was issued
            const changed = currentUser.changePasswordAfter(decoded.iat);
            if (changed) {
                return next();
            }

            // There is a logged in user
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // if current user.role == user then return error
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have to permission to perform this action', 403)
            );
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with this email address')
        )
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    try {
        // 3) Send it to user's email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'sucess',
            message: 'Token send to email!'
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpries = undefined;
        await user.save({ validateBeforeSave: false });

        console.log(err);
        return next(
            new AppError('There was a error sending email. Try again later!', 500)
        )
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpries: { $gt: Date.now() }
    })

    // 2) If token has not expired, and there is user, set the new password
    if (!user)
        return next(new AppError('Token is invalid or expried', 400));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpries = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check is posted current password is correct
    if (!user || !(await user.checkPassword(currentPassword, user.password)))
        return next(new AppError('Current password is incorrect! Forgot your password? So, go to forgot password', 401));

    // 3) If so, update password
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});