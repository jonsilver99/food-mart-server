'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');

/** User activity **/
const CartSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    DateCreated: { type: Date, default: Date.now },
    DateClosed: { type: Date, default: null },
    ItemsInCart: [
        {
            Product: { type: Schema.Types.ObjectId, ref: 'product' },
            Qty: { type: Number },
        }
    ],
});

CartSchema.index({ User_id: 1, DateClosed: 1 }, { unique: true });
CartSchema.plugin(uniqueValidator);

module.exports = CartSchema;