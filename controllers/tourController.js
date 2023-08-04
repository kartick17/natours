const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
    req.query = {
        ...req.query,
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,price,ratingsAverage,summary,difficulty'
    }
    console.log(req.query);
    next();
}

exports.createTour = factory.createOne(Tour);

exports.getAllTours = catchAsync(async (req, res, next) => {
    // Execute query
    const feature = new APIFeatures(Tour, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await feature.query;

    // Send Response
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
        return next(new AppError('No tour found with that Id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                tours: { $push: '$name' }
            }
        },
        {
            $sort: { numTours: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'easy' } }
        // }
    ])

    res.status(200).json({
        status: 'success',
        length: stats.length,
        data: {
            stats
        }
    });
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        length: plan.length,
        data: {
            plan
        }
    });
})