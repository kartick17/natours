const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

// AWS s3 configuration
const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET_NAME,
    signatureVersion: 'v4',
    region: process.env.AWS_REGION
});

// Check file is image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else
        cb(new AppError('Not an image! Please upload only image', 400));
}

// Create storage using s3-multer
const multerS3Config = multerS3({
    s3: s3Config,
    bucket: 'natours-image',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        multerFilter(req, file, cb);
        const ext = file.mimetype.split('/')[1];
        file.originalname = `tours-${Date.now()}.${ext}`
        cb(null, file.originalname)
    }
});

// Upload file in s3 bucket
const upload = multer({
    storage: multerS3Config,
    limits: {
        fileSize: 1024 * 1024 * 1 // we are allowing only 1 MB files
    }
})

// Upload multiple photos in multiple fields
exports.uploadTourPhoto = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])

// upload.array('images', 5)           // Upload multiple photos but same field
// upload.single('image')              // Upload single photo

exports.addTourPhoto = (req, res, next) => {
    req.body.imageCover = req.files.imageCover[0].location;

    req.body.images = [];
    req.files.images.forEach(img => req.body.images.push(img.location));

    console.log(req.body);
    next();
}

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