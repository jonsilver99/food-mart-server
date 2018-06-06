'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');

/** Products **/
const ProductSchema = new Schema({
    ProductName: { type: String, required: true, unique: true },
    ProductPicture: { type: String, required: true, unique: true },
    Category: { type: Schema.Types.ObjectId, ref: 'categories', required: true },
    Description: { type: String, required: true },
    UnitPrice: { type: Number, required: true },
    UnitsInStock: { type: Number, default: 0 },
    UnitsOnOrder: { type: Number, default: 0 },
    UnitsSold: { type: Number, default: 0 },
    Discount: { type: Number, min: 0, max: 90, default: 0 },
    DateAdded: { type: Date, default: Date.now }
});

ProductSchema.plugin(uniqueValidator);

ProductSchema.pre('save', function (next) {
    // resolve price after discount
    this.Discount = this.Discount / 100
    this.UnitPrice = this.UnitPrice - this.UnitPrice * this.Discount;
    next();
})

module.exports = ProductSchema