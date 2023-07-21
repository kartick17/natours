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

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        // stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don,t show error details
    else {
        // 1) Log error
        // console.error(err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!!'
        });
    }
}


module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (error.kind === 'ObjectId') error = handeCastErrorDB(error);
        if (error.code === 11000) error = handelDuplicateFieldsErrorDB(error);
        if (error.errors) error = handelValidationErrorDB(error);

        sendErrorProd(error, res);
    }
});
