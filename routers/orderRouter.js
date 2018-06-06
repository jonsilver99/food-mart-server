'use strict';
const orderRouter = require('express').Router();
const orderController = require('../controllers/orderController');
const resHandler = require('../handlers/responseHandler');

// process and save new order
orderRouter.post('/', (req, res, next) => {
    let orderData = req.body;
    orderController.processNeworder(orderData)
        .then(successMsg => {
            resHandler.success(res, 201, successMsg, null)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Order error - failed to create new order. Please refer to console for exact reason', err)
        })
})


// get items in order (only items)
orderRouter.get('/:uid/items', (req, res, next) => {
    let uid = req.params.uid;
    orderController.getorderItems(uid, true)
        .then(itemsInorder => {
            resHandler.success(res, 200, 'Items in order fetched', itemsInorder)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Order error - failed to get items in order. Please refer to console for exact reason', err)
        })
})

// get user's orders history
orderRouter.get('/:uid/ordersHistory', (req, res, next) => {
    let uid = req.params.uid;
    orderController.getAllUserOrders(uid)
        .then(ordersHistory => {
            resHandler.success(res, 200, 'Orders history fetched', ordersHistory)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Order error - failed to get Orders history. Please refer to console for exact reason', err)
        })
})

// get delivery dates
orderRouter.get('/deliverydates/all', (req, res, next) => {
    let startDate = req.query.startDate;
    orderController.getAllDeliveryDates(startDate)
        .then(deliveryDates => {
            resHandler.success(res, 200, 'Delivery dates fetched', deliveryDates)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Fetch error - failed to get delivery dates Please refer to console for exact reason', err)
        })
})

// aggregate orders by dates
orderRouter.get('/bydates', (req, res, next) => {
    let startDate = req.query.startDate;
    orderController.aggregateOrdersByDates(startDate)
        .then(ordersByDates => {
            resHandler.success(res, 200, 'Orders by dates fetched', ordersByDates)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Fetch error - failed to get orders by dates Please refer to console for exact reason', err)
        })
})

module.exports = orderRouter;