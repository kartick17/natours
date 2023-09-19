const AWS = require('aws-sdk');
const sharp = require('sharp');
const multer = require('multer');
const multerS3 = require('multer-s3-transform');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

let type, height, width;

// AWS s3 configuration
const s3Config = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.AWS_BUCKET_NAME,
  signatureVersion: 'v4',
  region: process.env.AWS_REGION,
});

// Check file is image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    if (file.fieldname === 'photo') {
      type = 'users';
      height = 2000;
      width = 2000;
    } else {
      type = 'tours';
      height = 1333;
      width = 2000;
    }

    cb(null, true);
  } else cb(new AppError('Not an image! Please upload only image', 400));
};

// Create storage using s3-multer
const multerS3Config = multerS3({
  s3: s3Config,
  bucket: 'natours-image',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  shouldTransform: function (req, file, cb) {
    cb(null, /^image/i.test(file.mimetype));
  },
  transforms: [
    {
      id: 'original',
      key: function (req, file, cb) {
        multerFilter(req, file, cb);
        file.originalname = `${type}-${Date.now()}.jpeg`;
        // console.log(file.originalname);
        cb(null, file.originalname);
      },
      transform: function (req, file, cb) {
        //Perform desired transformations
        cb(null, sharp().resize(width, height).jpeg());
      },
    },
  ],
});

// Upload file in s3 bucket
const upload = multer({
  storage: multerS3Config,
  limits: {
    fileSize: 1024 * 1024 * 3, // we are allowing only 1 MB files
  },
});

// exports.uploadTourPhoto = upload.array('imageCover', 3)

// upload.array('images', 5)           // Upload multiple photos but same field
// upload.single('image')              // Upload single photo

// Resize user photo when upload in local storage
const resizePhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `users-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

module.exports = { upload, s3Config };
