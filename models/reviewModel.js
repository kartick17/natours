const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be equal or above 1.0'],
        max: [5, 'Rating must be equal or below 5.0']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    tour: {
        // References reviews with tour by tour id
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must be belong to a tour']
    },
    user: {
        // References reviews with user by user id
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must be belong to a user']
    }
})

// Static method for claculate average and number of rating for given tour and update that tour data when a review create, update and delete
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                noRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    console.log(stats);
    if (stats.length > 0) {
        // Saved the statistic to current tour
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].noRating
        })
    }
    else {
        // When no review found of that tour then set default values
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}

///////////// Document Middleware /////////////////

// Call calcAverageRatings() method after a new review has been created
reviewSchema.post('save', function () {
    // 'this' point to the current document
    // this.constructor point to current model(Review)
    this.constructor.calcAverageRatings(this.tour);
})


///////////// Query Middleware /////////////////

// Populating reviews document. (Replace user and tours data with id)
reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })

    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

// Create unique compound index to prevent duplicate reviews from same user on one tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// We do not access document directly. So retrieving and save the current document on this.r by using findOne
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // Here 'this' point to the current query
    this.r = await this.findOne();
    next();
})

// Call calcAverageRatings() method after a review has been updated or deleted
reviewSchema.post(/^findOneAnd/, async function () {
    this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;