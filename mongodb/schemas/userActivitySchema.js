'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');

/** User activity **/
const UserActivitySchema = new Schema({
    User_id: { type: Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
    PurchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'order' }],
    WishList: [{ type: Schema.Types.ObjectId, ref: 'product' }],
    RecentlyViewd: [{ type: Schema.Types.ObjectId, ref: 'product' }],
    LastLogin: { type: Date, default: null }
});
UserActivitySchema.plugin(uniqueValidator);

UserActivitySchema.methods.checkRecentlyViewdArr = function () {
    if (this.RecentlyViewd.length > 5) {
        this.RecentlyViewd.pop();
        this.save();
    }
    return
}

module.exports = UserActivitySchema;