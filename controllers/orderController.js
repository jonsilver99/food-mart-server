'use strict';
const inputValidator = require('../handlers/inputValidator/inputValidator');
const cartController = require('./cartController');
const productController = require('./productController');
const uActivityController = require('./userActivityController');
const orderHandler = require('../handlers/orderHandler')
const DeliveryDatesHandler = require('../handlers/deliveryDatesHandler')
const mockPaymentService = require('../external-services/mock-payment-service')
const Order = require('../mongodb/dbModels').Order;

class OrderController {
    static async processNeworder(orderData) {
        try {
            // validate input
            let validation = inputValidator.processData(orderData)
            if (validation != "all data is valid") {
                return Promise.reject({ invalidInput: validation })
            }
            // assert ordered items are in stock
            let itemsInOrder = await cartController.getCartItems(orderData.Cart_id, true)
            if (!orderHandler.canSupply(itemsInOrder)) throw ({ message: "Requested quantity exceeds stock" });

            // assert delivery date is available
            let deliveryDate = await this.getDeliveryDate(orderData.DeliveryDate)
            if (deliveryDate.numOfOrders > 2) throw ({ message: "Delivery date fully booked" });

            // resolve payment
            let paymentResolution = await this.processPayment(orderData.Payment, orderData.GrandTotal)
            if (!paymentResolution) throw ({ message: "Failed to process payment" });
            orderData.Payment = paymentResolution;

            // save order in database
            await this.createNewOrder(orderData)

            // close user's current cart
            await cartController.closeCart(orderData.Cart_id)

            // create new cart for user
            await cartController.createNewCart(orderData.User_id)

            // update stock for each purchased product
            await this.updateStock(itemsInOrder)

            // success
            return Promise.resolve('Order processed successfully!')
        } catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    }

    static processPayment(payment, grandTotal) {
        if (payment.Type == 'Credit') {
            delete payment.CredentialEmail
            delete payment.CredentialPassword
            return mockPaymentService.processCredit(payment)
        }
        else if (payment.Type == 'Paypal' || payment.Type == 'Bitcoin') {
            delete payment.CardBrand
            delete payment.CardNumber
            return mockPaymentService.processVirtual(payment)
        }
    }

    static createNewOrder(orderData) {
        return new Promise((resolve, reject) => {
            let neworder = new Order(orderData)
            neworder.save()
                .then(savedorder => {
                    console.log('Saved order', savedorder);
                    resolve(savedorder)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static updateStock(itemsInOrder) {
        if (!Array.isArray(itemsInOrder)) itemsInOrder = [itemsInOrder]
        let updates = [];
        let purchasedProduct;
        let purchasedUnits;

        for (let i = 0; i < itemsInOrder.length; i++) {
            purchasedProduct = itemsInOrder[i].Product
            purchasedUnits = itemsInOrder[i].Qty
            purchasedProduct.UnitsInStock -= purchasedUnits
            purchasedProduct.UnitsSold += purchasedUnits
            updates.push(purchasedProduct);
        }
        return Promise.all(updates.map(prod => {
            let updateData = {
                UnitsInStock: prod.UnitsInStock,
                UnitsSold: prod.UnitsSold
            }
            return productController.updateProduct(prod._id, updateData)
        }))
            .then(results => {
                console.log('Update results', results);
                return results;
            })
    }

    static getDeliveryDate(date) {
        let selectedDay = DeliveryDatesHandler.getFullDate(date);
        let nextDay = DeliveryDatesHandler.getNextDayFullDate(date);
        return Order.find({ 'DeliveryDate': { '$gte': selectedDay, '$lt': nextDay } })
            .count()
            .then(orderCount => {
                return { date: selectedDay, numOfOrders: orderCount }
            })
            .catch(err => { throw err })
    }

    static getAllDeliveryDates(startDate) {
        if (startDate) startDate = DeliveryDatesHandler.getFullDate(startDate)
        else startDate = DeliveryDatesHandler.getFullDate(Date.now())
        let query = [
            { "$match": { "DeliveryDate": { $gte: startDate } } },
            {
                "$project": {
                    _id: 0,
                    "date": {
                        "$concat": [
                            { "$substr": [{ "$year": "$DeliveryDate" }, 0, 4] }, "-",
                            { "$substr": [{ "$month": "$DeliveryDate" }, 0, 2] }, "-",
                            { "$substr": [{ "$dayOfMonth": "$DeliveryDate" }, 0, 2] }
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "Count": { "$sum": 1 },
                    "orders": { "$push": "$$ROOT" }
                }
            }
        ]
        return new Promise((resolve, reject) => {
            Order.aggregate(query)
                .then(deliverDates => {
                    const sortedDates = DeliveryDatesHandler.sortDeliveryDates(deliverDates)
                    console.log('Sorted delivery dates', sortedDates);
                    resolve(sortedDates)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static aggregateOrdersByDates(startDate) {
        let query = [
            { "$sort": { "DateIssued": -1 } },
            {
                "$project": {
                    _id: 0,
                    "date": {
                        "$concat": [
                            { "$substr": [{ "$year": "$DateIssued" }, 0, 4] }, "-",
                            { "$substr": [{ "$month": "$DateIssued" }, 0, 2] }, "-",
                            { "$substr": [{ "$dayOfMonth": "$DateIssued" }, 0, 2] }
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "numOfOrders": { "$sum": 1 },
                }
            }
        ]
        if (startDate) {
            query.unshift({ "$match": { "DateIssued": { $gte: new Date(startDate) } } })
        }
        return new Promise((resolve, reject) => {
            Order.aggregate(query)
                .then(ordersByDates => {
                    resolve(ordersByDates)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static getAllUserOrders(uid) {
        return new Promise((resolve, reject) => {
            Order.find({ User_id: uid }, null, { sort: { DateIssued: -1 } })
                .populate({
                    path: 'Cart_id',
                    select: 'ItemsInCart',
                    populate: {
                        path: 'ItemsInCart.Product'
                    }
                })
                .lean()
                .then(userOrders => {
                    userOrders.forEach((order) => {
                        order.Cart = { ItemsInCart: order.Cart_id.ItemsInCart }
                        delete order.Cart_id;
                    });
                    console.log(userOrders);
                    resolve(userOrders)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }


}

module.exports = OrderController;