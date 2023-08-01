const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, 'Review can not be empty!']
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
        require: [true, 'Review must be belong to a tour']
    },
    user: {
        // References reviews with user by user id
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Review must be belong to a user']
    }
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;