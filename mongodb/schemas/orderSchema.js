'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');

/** User activity **/
const OrderSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    Cart_id: { type: Schema.Types.ObjectId, ref: 'cart', required: true },
    DateIssued: { type: Date, default: Date.now },
    DeliveryDate: { type: Date, required: true },
    SubTotal: { type: Number, required: true },
    ShippingAndHandling: { type: Number, required: true },
    GrandTotal: { type: Number, required: true },
    ShippingDetails: {
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        Phone: { type: String, required: true },
        City: { type: String, required: true },
        Street: { type: String, required: true },
    },
    Payment: {
        Type: { type: String, enum: ['Credit', 'Paypal', 'Bitcoin'], required: true },
        CardBrand: { type: String, enum: ['Visa', 'Master card', 'American express'] },
        LastFourDigits: { type: String, maxlength: 4 },
        Transaction_id: { type: String, require: true, unique: true },
    }
});

OrderSchema.plugin(uniqueValidator);

module.exports = OrderSchema;