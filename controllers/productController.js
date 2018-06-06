'use strict';
const AWS = require('../external-services/aws-service');
const Product = require('../mongodb/dbModels').Product
const resHandler = require('../handlers/responseHandler');
const inputValidator = require('../handlers/inputValidator/inputValidator');
const prodHandler = require('../handlers/productsHandler');

class ProductsController {

    static getStockProducts(param) {
        let query = {}
        let options = null
        switch (param) {
            case 'allProducts': {
                break;
            }
            case 'topSellers': {
                options = { sort: { UnitsSold: -1 }, limit: 12 }
                break;
            }
            case 'lowOnStock': {
                query = { UnitsInStock: { $lt: 10 } }
                options = { sort: { UnitsInStock: 1 } }
                break;
            }
        }

        return new Promise((resolve, reject) => {
            Product.find(query, null, options)
                .lean()
                .then(products => {
                    resolve(products);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    static getGalleryProducts(category, page) {
        let result = {
            ProductsInThisPage: null,
            TotalPages: [],
        }
        return new Promise((resolve, reject) => {
            Product.find({ Category: category }, null, { skip: (page - 1) * 15, limit: 15, sort: { $natural: 1 } })
                .lean()
                .then(products => {
                    result.ProductsInThisPage = products
                    return Product.count({ Category: category })
                })
                .then(prodCount => {
                    let numOfPages = Math.ceil(prodCount / 15);
                    for (let i = 0; i < numOfPages; i++) {
                        result.TotalPages.push(i + 1)
                    }
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static async getFeaturedProducts() {
        try {
            let bestSellers = await this.aggregateFromAllCategories("UnitsSold", -1, 2)
            let newest = await this.aggregateFromAllCategories("DateAdded", -1, 4)
            let featuredProducts = prodHandler.resolveFeaturedProducts(bestSellers, newest)
            return Promise.resolve(featuredProducts);
        }
        catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    }

    static searchProductBy(fieldName, fieldValue, page) {
        if (inputValidator.processData({ fieldName: fieldName, fieldValue: fieldValue, page: page }) != "all data is valid") {
            return Promise.reject({ invalidInput: 'Method recieved invalid or illegal input!' })
        }
        let result = {
            ProductsInThisPage: null,
            TotalPages: [],
        }
        let dbQuery = {};
        if (isNaN(fieldValue)) {
            // let regex = new RegExp("^" + fieldValue, 'gi')
            let regex = new RegExp(fieldValue, 'gi')
            dbQuery[fieldName] = regex;
        } else {
            dbQuery[fieldName] = parseInt(fieldValue);
        }
        return new Promise((resolve, reject) => {
            Product.find(dbQuery, null, { skip: (page - 1) * 15, limit: 15, sort: { $natural: 1 } })
                .then(products => {
                    result.ProductsInThisPage = products
                    return Product.count(dbQuery)
                })
                .then(prodCount => {
                    let numOfPages = Math.ceil(prodCount / 15);
                    for (let i = 0; i < numOfPages; i++) {
                        result.TotalPages.push(i + 1)
                    }
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static aggregateFromAllCategories(sortParam, sortOrder, limit) {
        //sortParam --> product property to sort by
        //sortOrder --> ascending (1) or descending (-1)
        //limit --> num of results to slice from the array
        let query = [
            {
                "$match": { "UnitsInStock": { $gt: 0 } }
            },
            {
                "$sort": { [sortParam]: sortOrder }
            },
            {
                "$group": {
                    "_id": "$Category",
                    "products": { "$push": "$$ROOT" }
                }
            },
            {
                "$project": {
                    "products": { "$slice": ["$products", limit] }
                }
            }
        ]
        return new Promise((resolve, reject) => {
            Product.aggregate(query)
                .then(categories => {
                    resolve(categories)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static async createNewProduct(prodData, prodPicture) {
        try {
            let validation = inputValidator.processData(prodData);
            if (validation != "all data is valid") {
                return Promise.reject({ invalidInput: validation })
            }
            // assert file is an image
            inputValidator.assertFileIsImage(prodPicture);
            //save picture to s3, get back a url to and add that url to prodData
            let picURL = await AWS.uploadFileToS3Bucket(prodPicture);
            prodData.ProductPicture = picURL;
            let newProduct = new Product(prodData)
            let savedProd = await newProduct.save()
                .then(savedProduct => savedProduct)
                .catch(err => { throw (err) })

            if (!savedProd) throw ({ message: 'Failed to create product' })

            return Promise.resolve(`Product: ${savedProd.ProductName} created`)
        } catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    }

    static updateProduct(productId, updateData) {
        // validate input
        if (inputValidator.processData({ productId: productId, updateData: updateData }) != "all data is valid") {
            return Promise.reject({ invalidInput: 'Method recieved invalid or illegal input!' })
        }
        return new Promise((resolve, reject) => {
            let update = { $set: updateData }
            Product.findByIdAndUpdate(productId, update, { new: true })
                .lean()
                .then(updated => resolve(updated))
                .catch(err => { reject(err) })
        })
    }
}

module.exports = ProductsController;