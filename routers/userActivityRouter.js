'use strict';
const uActivityRouter = require('express').Router()
const uActivityController = require('../controllers/userActivityController');
const resHandler = require('../handlers/responseHandler');

uActivityRouter.get('/:uid', (req, res, next) => {
    let uid = req.params.uid;
    uActivityController.fetchUserActivity(uid)
        .then(result => {
            resHandler.success(res, 200, 'User activity fetched', result)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Fetching err - failed to fetch user activity, Please refer to console for exact reason', err)
        })
})

// recently viewed items update
uActivityRouter.put('/:uid/RecentlyViewd', (req, res, next) => {
    let uid = req.params.uid;
    let productId = req.body.productId;

    uActivityController.updateRecentlyViewed(uid, productId)
        .then(result => {
            resHandler.success(res, 200, 'Recently viewd list updated', result)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Update err - failed to update Recently viewd list', err)
        })
})

// Last login date
uActivityRouter.put('/:uid/LastLogin', (req, res, next) => {
    let uid = req.params.uid;
    let date = req.body.date;
    
    uActivityController.updateLastLogin(uid, date)
        .then(result => {
            resHandler.success(res, 200, 'Last login updated', result)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Update err - failed to update Wish list', err)
        })
})

// wish list update
uActivityRouter.put('/:uid/WishList', (req, res, next) => {
    let uid = req.params.uid;
    let productId = req.body.productId;
    
    uActivityController.updateWishList(uid, productId)
        .then(result => {
            resHandler.success(res, 200, 'Wish list updated', result)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Update err - failed to update Wish list', err)
        })
})


module.exports = uActivityRouter;