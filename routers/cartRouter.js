'use strict';
const cartRouter = require('express').Router()
const cartController = require('../controllers/cartController');
const resHandler = require('../handlers/responseHandler');

// create new active cart for user
cartRouter.post('/:uid', (req, res, next) => {
    let uid = req.params.uid;
    cartController.createNewCart(uid)
        .then(newCart => {
            resHandler.success(res, 201, 'New cart created', newCart)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Cart error - failed to create new cart. Please refer to console for exact reason', err)
        })
})

// get user's cart
cartRouter.get('/:uid', (req, res, next) => {
    let uid = req.params.uid;
    cartController.fetchActiveCart(uid)
        .then(cart => {
            resHandler.success(res, 200, 'Cart fetched', cart)
        })
        .catch(err => {
            resHandler.error(res, 500, "Cart error - failed to get user's cart. Please refer to console for exact reason", err)
        })
})

// get items in cart (only items)
cartRouter.get('/:uid/items', (req, res, next) => {
    let uid = req.params.uid;
    cartController.getCartItems(uid, true)
        .then(itemsInCart => {            
            resHandler.success(res, 200, 'Items in cart fetched', itemsInCart)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Cart error - failed to get items in cart. Please refer to console for exact reason', err)
        })
})

// add item to cart
cartRouter.put('/:cid/add', (req, res, next) => {
    let cid = req.params.cid;
    let newItem = req.body;

    cartController.addToCart(cid, newItem)
        .then(updatedItems => {
            resHandler.success(res, 200, 'Item added to cart!', updatedItems)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Update err - failed to add item to cart', err)
        })
})

// update items in cart
cartRouter.put('/:cid/update', (req, res, next) => {
    let cid = req.params.cid;
    let updatedItems = req.body;

    cartController.updateAndReturnItems(cid, updatedItems)
        .then(updatedCart => {
            resHandler.success(res, 200, 'Items in cart updated!', updatedCart)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Update err - failed to update items in cart', err)
        })
})


module.exports = cartRouter;