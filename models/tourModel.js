const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A ture must have a name'],
        unique: true,
        trim: true,
        maxLength: [50, 'A tour name have less than or equal 50 character'],
        minLength: [10, 'A tour name have more than or equal 10 character'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A ture must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A ture must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A ture must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy or medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be equal or above 1.0'],
        max: [5, 'Rating must be equal or below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A ture must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A ture must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A ture must have a cover image']
    },
    images: [],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTours: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            // Reference tours with guides by guide id
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        // Show virtual properties in output (In JSON & Object)
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Add indexing for read performance
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: -1 })
tourSchema.index({ startLocation: 1 })

// Add virtual properties into document(But this is not added into database)
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

// Virtual Populates(This propertie show in output but not added into database)
// Connet two model by this model id and another model parent referencing(Foreign key) using virtual populates 
tourSchema.virtual('reviews', {         // reviews - virtual field/propertie name
    ref: 'Review',                      // Review - model name
    foreignField: 'tour',               // Another model field name to be referenced(Review.tour)
    localField: '_id'                   // This model field name to be referenced(Tour._id)
})

///////////// Document Middleware /////////////////
// Middleware: runs before and after .save() and .create()

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// Get guides id from document and store all guides data into tour document
// tourSchema.pre('save', async function (next) {
//     const guidesPromice = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromice);
//     next();
// })

// tourSchema.pre('save', function(next) {
//     console.log('Will save document...');
//     next();
// })

// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// })

///////////// Query Middleware /////////////////

// tourSchema.pre('find', function() {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTours: { $ne: true } });
    this.start = Date.now();
    // console.log(this.start);
    next();
})

// Populaing tour guides.(Replace guide id with guide data in tour documents)
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

// Return all tours excludes secret tours from find query
tourSchema.post(/^find/, function (doc, next) {
    this.find({ secretTours: { $ne: true } });
    // console.log(`Query took ${Date.now() - this.start}ms`);
    next();
})

///////////// Aggregate Middleware /////////////////

// Return all tours excludes secret tours from aggregate pipline query
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
    // console.log(this.pipeline());
    next()
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;