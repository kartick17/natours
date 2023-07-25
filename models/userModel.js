const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Enter your password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        validate: {
            // This only works on Create and Save
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password and confirm password should be same!'
        }
    },
    passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.confirmPassword = undefined;
    next();
})

// Match entered password and database passwor are equal or not on user login
userSchema.methods.checkPassword = async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
}

// Check if user changed password after jwt token generated
userSchema.methods.changePasswordAfter = function (JWTIssuedTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(JWTIssuedTimestamp, changedTimestamp);
        return changedTimestamp > JWTIssuedTimestamp;
    }
    return false;
}


const User = mongoose.model('User', userSchema);

module.exports = User;