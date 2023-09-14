const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRouter');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingCotroller = require('./controllers/bookingCotroller');
const globalErrorHandeler = require('./controllers/errorController');

const app = express();

// app.enable('trust proxy')

app.use(cors());

// app.use(function (req, res, next) {
//     res.header("Cross-Origin-Embedder-Policy", "require-corp");
//     res.header("Cross-Origin-Opener-Policy", "same-origin");
//     next();
// });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers(Added https)
// app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after an hour',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingCotroller.webhookCheckout,
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection(Remove all '$' and '.' from query)
app.use(mongoSanitize());

// Data sanitization against xss(Sanitize HTML and scripting language)
app.use(xss());

// Prevent parameter pollution(Remove duplicate parameter excludes whitelist)
app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 2) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.url} on this server`, 404));
// })

app.use(globalErrorHandeler);

module.exports = app;
