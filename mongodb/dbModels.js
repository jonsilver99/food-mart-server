'use strict';
const mongoose = require('mongoose');
const UserSchema = require('./schemas/userSchema');
const ProductSchema = require('./schemas/productSchema');
const UserActivitySchema = require('./schemas/userActivitySchema');
const CartSchema = require('./schemas/cartSchema');
const OrderSchema = require('./schemas/orderSchema');



module.exports = {
    User: mongoose.model('user', UserSchema),
    Product: mongoose.model('product', ProductSchema),
    UserActivity: mongoose.model('useractivity', UserActivitySchema),
    Cart: mongoose.model('cart', CartSchema),
    Order: mongoose.model('order', OrderSchema),
}