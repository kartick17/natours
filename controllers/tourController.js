const multer = require('multer');
const sharp = require('sharp');
const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorate = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true);
    else
        cb(new AppError('Not an image! Please upload only image', 400));
}

const upload = multer({
    storage: multerStorate,
    fileFilter: multerFilter
})

// Upload multiple photos in multiple fields
exports.uploadTourPhoto = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])

// upload.array('images', 5)           // Upload multiple photos but same field
// upload.single('image')              // Upload single photo

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover Image
    req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Other images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tours-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    )
    next();
})

exports.aliasTopTours = (req, res, next) => {
    req.query = {
        ...req.query,
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,price,ratingsAverage,summary,difficulty'
    }
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
    const { distance, latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide latiture and longitude in the format lat, lng', 400))
    }

    const radius = +distance / 6378.1;

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'sucess',
        result: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide latiture and longitude in the format lat, lng', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat]
                },
                distanceField: 'distance',
                distanceMultiplier: 0.001
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})