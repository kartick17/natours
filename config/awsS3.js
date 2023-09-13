const AWS = require('aws-sdk');
const sharp = require('sharp');
const multer = require('multer');
const multerS3 = require('multer-s3');

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
        // console.log(file);
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

// exports.uploadTourPhoto = upload.array('imageCover', 3)

// upload.array('images', 5)           // Upload multiple photos but same field
// upload.single('image')              // Upload single photo

const resizePhoto = async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `users-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next();
}

module.exports = upload;