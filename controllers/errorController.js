const AppError = require("../utils/appError");

const handeCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);
}

const handelDuplicateFieldsErrorDB = err => {
    const message = `Duplicate tour name: ${err.keyValue.name}`;
    return new AppError(message, 400);
}

const handelValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handelJWTError = () => {
    const message = 'Invalid token! Please log in again';
    return new AppError(message, 401);
}

const handelJWTExpiredError = () => {
    const message = 'Your token has expired! Please log in again';
    return new AppError(message, 401);
}

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // API
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            // stack: err.stack
        });
    }
    // Rendered Website
    console.error(err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // Programming or other unknown error: don,t show error details
        // Send generic message
        console.error(err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!!'
        });
    }

    // Rendered website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }
    // Programming or other unknown error: don,t show error details
    // Send generic message
    console.error(err);
    return res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
    });
}


module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (error.kind === 'ObjectId') error = handeCastErrorDB(error);
        if (error.code === 11000) error = handelDuplicateFieldsErrorDB(error);
        if (error.errors) error = handelValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handelJWTError();
        if (error.name === 'TokenExpiredError') error = handelJWTExpiredError();
        sendErrorProd(error, req, res);
    }
});
