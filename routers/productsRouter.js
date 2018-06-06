'use strict';
const productsRouter = require('express').Router()
const resHandler = require('../handlers/responseHandler');
const productController = require('../controllers/productController');

productsRouter.get('/', (req, res, next) => {

    let category = req.query.category;
    let page = parseInt(req.query.page);

    productController.getGalleryProducts(category, page)
        .then(products => {
            resHandler.success(res, 200, 'Products fetched', products)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Products error: failed to fetch gallery page products. Please refer to console for exact reason.', err)
        })
})

productsRouter.get('/stock/:param', (req, res, next) => {
    let param = req.params.param;
    productController.getStockProducts(param)
        .then(products => {
            resHandler.success(res, 200, 'All products fetched', products)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Products error: failed to fetch stock products. Please refer to console for exact reason.', err)
        })
})

productsRouter.get('/featuredproducts', (req, res, next) => {
    productController.getFeaturedProducts()
        .then(products => {
            resHandler.success(res, 200, 'Featured products fetched', products)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Products error: failed to fetch featured products. Please refer to console for exact reason.', err)
        })
})

productsRouter.get('/search', (req, res, next) => {
    let query = req.query
    let fieldName;
    let fieldValue;
    let page = parseInt(req.query.page);
    for (var key in query) {
        if (query.hasOwnProperty(key) && key != 'dontCache' && key != 'page') {
            fieldName = key
            fieldValue = query[key]
        }
    }
    productController.searchProductBy(fieldName, fieldValue, page)
        .then(products => {
            resHandler.success(res, 200, 'Searched products fetched', products)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Products error: failed while searching products. Please refer to console for exact reason.', err)
        })
})

productsRouter.post('/', (req, res, next) => {
    const prodData = req.body;
    const prodPicture = req.files.ProductPicture;
    if (!prodData || !prodPicture) {
        resHandler.error(res, 400, "Product data is missing", null)
    }
    else {
        productController.createNewProduct(prodData, prodPicture)
            .then(txtResult => {
                resHandler.success(res, 201, txtResult, null)
            })
            .catch(err => {
                resHandler.error(res, 500, 'Error: Failed during product creation process. Please refer to console for exact reason.', err)
            })
    }
})

productsRouter.put('/:prodId', (req, res, next) => {
    let _id = req.params.prodId
    let updateData = req.body
    productController.updateProduct(_id, updateData)
        .then(updated => {
            resHandler.success(res, 200, 'Product updated!', null)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Error: Failed during product upldate process. Please refer to console for exact reason.', err)
        })
})

module.exports = productsRouter;