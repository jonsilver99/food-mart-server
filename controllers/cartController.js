'use strict';
const Cart = require('../mongodb/dbModels').Cart;
const inputValidator = require('../handlers/inputValidator/inputValidator');
const cartHandler = require('../handlers/cartHandler');

class CartController {
    static createNewCart(uid) {
        let newCart = new Cart({ User_id: uid })
        return newCart.save()
            .then(savedCart => {
                console.log('Saved new cart', savedCart);
                return savedCart
            })
            .catch(err => {
                throw err
            })
    }

    static closeCart(cid) {
        return Cart.findByIdAndUpdate(cid, { $set: { DateClosed: Date.now() } }, { new: true })
            .lean()
            .then(closedCart => {
                console.log('Cart closed', closedCart);
                return closedCart;
            })
            .catch(err => {
                throw err
            })
    }

    static fetchActiveCart(uid) {
        return new Promise((resolve, reject) => {
            Cart.find({ User_id: uid, DateClosed: null }, null, { limit: 1 })
                .populate('ItemsInCart.Product')
                .lean()
                .then(cart => {
                    resolve(cart[0]);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static getCartItems(cid, populated) {
        if (populated) {
            return Cart.findById(cid, null, { select: 'ItemsInCart' })
                .populate('ItemsInCart.Product')
                .lean()
                .then(result => result['ItemsInCart'])
        } else {
            return Cart.findById(cid, null, { select: 'ItemsInCart' })
                .lean()
                .then(result => result['ItemsInCart'])
        }
    }

    static async addToCart(cid, newItem) {
        // validate input
        if (inputValidator.processData({ cid: cid, newItem: newItem }) != "all data is valid") {
            return Promise.reject({ invalidInput: 'Method recieved invalid or illegal input!' })
        }

        // get items currently in cart
        let currentItemsArr = await this.getCartItems(cid).catch(err => { throw err })
        let newItemsArr;

        // check if newItem already exists in currentItemsArr - if it does, update its quantity property, if not - add it
        let existsIndex = cartHandler.getItemIndex(currentItemsArr, newItem)
        if (existsIndex !== false) {
            newItemsArr = cartHandler.changeItemQty(currentItemsArr, newItem, existsIndex, true)
        }
        else {
            newItemsArr = cartHandler.addItem(currentItemsArr, newItem)
        }
        // update cart
        return await this.updateAndReturnItems(cid, newItemsArr)
            .catch(err => {
                throw err
            })
    }

    static updateAndReturnItems(cid, updatedItems) {
        return Cart.findByIdAndUpdate(cid, { $set: { ItemsInCart: updatedItems } }, { new: true })
            .select('ItemsInCart')
            .populate('ItemsInCart.Product')
            .lean()
            .then(updated => {
                return updated['ItemsInCart'];
            })
    }
}

module.exports = CartController;