const catchAsync = require("../utils/catchAsync");
const Review = require("./../models/reviewModel");

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
});

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'sucess',
        data: {
            newReview
        }
    })
})