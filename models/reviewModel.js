const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;