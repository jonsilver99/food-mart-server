'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');

/** Users **/
const UserSchema = new Schema({
    Role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    Identification: { type: Number, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Phone: { type: String, required: true, unique: true },
    City: { type: String, required: true },
    Street: { type: String, required: true },
});
UserSchema.plugin(uniqueValidator);

/*pre save*/
UserSchema.pre('save', function (next) {

    if (!this.isModified('Password')) return next()

    bcrypt.hash(this.Password, 10)
        .then(hashed => {
            this.Password = hashed;
            return next();
        })
        .catch(err => {
            return next(err);
        })
})

UserSchema.pre('init', function (user) {
    user.HasBeenInitialized = false;   
})

UserSchema.methods.matchPasswords = function (inputPassword) {
    return bcrypt.compare(inputPassword, this.Password)
        .then(matched => {
            return matched;
        })
        .catch(err => {
            return err;
        })
};

module.exports = UserSchema