const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandeler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// 1) MIDDLEWARE
app.use(express.json());


if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})


// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.url} on this server`, 404));
})

app.use(globalErrorHandeler);



module.exports = app;