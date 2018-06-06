'use strict';
const UserActivity = require('../mongodb/dbModels').UserActivity;
const inputValidator = require('../handlers/inputValidator/inputValidator');

class UserActivityController {
    static createNewUserActivity(uid) {
        let userActivity = new UserActivity({ User_id: uid })
        return userActivity.save()
            .then(userActivity => {
                console.log('Saved new user activity object', userActivity);
                return userActivity
            })
            .catch(err => {
                throw err
            })
    }

    static fetchUserActivity(uid) {
        return new Promise((resolve, reject) => {
            UserActivity.find({ User_id: uid }, null, { limit: 1 })
                .populate('WishList RecentlyViewd')
                .lean()
                .then(UserActivity => {
                    resolve(UserActivity[0]);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static updateRecentlyViewed(uid, productId) {
        // validate input
        if (inputValidator.processData({ uid: uid, productId: productId }) != "all data is valid") {
            return Promise.reject({ invalidInput: 'Method recieved invalid or illegal input!' })
        }
        let query = { User_id: uid, RecentlyViewd: { $nin: [productId] } };
        let update = {
            "$push": {
                "RecentlyViewd": { $each: [productId], $position: 0, $slice: 3 }
            }
        }
        let options = { "select": "RecentlyViewd", "new": true }
        return new Promise((resolve, reject) => {
            UserActivity.findOneAndUpdate(query, update, options)
                .populate("RecentlyViewd")
                .lean()
                .then(activity => {
                    if (!activity) return resolve(null)
                    let result = activity["RecentlyViewd"]
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static updateLastLogin(uid, date) {
        // validate input
        if (inputValidator.processData({ uid: uid, date: date }) != "all data is valid") {
            return Promise.reject({ invalidInput: 'Method recieved invalid or illegal input!' })
        }
        return new Promise((resolve, reject) => {
            UserActivity.findOneAndUpdate({ User_id: uid }, { $set: { LastLogin: date } }, { new: true })
                .lean()
                .then(activity => {
                    resolve(activity);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static updateWishList(uid, productId) {
        // ~~~~~~~~~first sanitize all input!!!
    }
}

module.exports = UserActivityController;