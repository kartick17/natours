const sharp = require('sharp');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

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
        file.originalname = `users-${req.user.id}-${Date.now()}.${ext}`
        cb(null, file.originalname)
    }
});


// const multerStorate = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `users-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

// const multerStorate = multer.memoryStorage();

// For store file locally
// const upload = multer({
//     storage: multerStorate,
//     fileFilter: multerFilter
// });

// Upload file in s3 bucket
const upload = multer({
    storage: multerS3Config,
    // fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `users-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next();
})

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.confirmPassword) {
        next(
            new AppError('This route is not for passowrd update. Please use /updatePassword.', 400)
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    console.log(req.file.originalname);
    if (req.file) filteredBody.photo = req.file.location;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    })
}

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User)

// Don't update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);