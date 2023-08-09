const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
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

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide latiture and longitude in the format lat, lng', 400))
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centersphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'sucess',
        result: tours.length,
        data: {
            data: tours
        }
    })
})