'use strict';
const dbCollections = require('../../mongodb/dbModels');
const utils = require('../utils');

const illegalChars = require('./illegalChars');
const illegalProductChars = require('./illegalProductChars');
const requiredFields = require('./requiredFields');
const maxLengths = require('./maxLengths');
const lenientProductFields = require('./lenientProductFields');

class InputValidator {

    static processData(data) {
        let errors = {}
        // if no data given
        if (!data) {
            errors.noInput = 'no input given'
            return errors
        }

        // assure data is a flat object
        if (data && typeof (data) === 'object') data = utils.flattenObject(data)
        else data = { data: data }

        // validate all fields
        for (let fieldName in data) {
            let validationStatus = this.isValid(fieldName, data[fieldName])
            if (validationStatus !== 'valid') {
                errors[fieldName] = validationStatus
            }
        }

        return (Object.keys(errors).length === 0 && errors.constructor === Object) ? 'all data is valid' : errors;
    }

    static isValid(fieldName, fieldValue) {
        let fieldErrors = [];
        if (requiredFields.includes(fieldName)) {
            if (this.hasNoValue(fieldValue)) {
                fieldErrors.push('No input given');
            }
        }

        if (lenientProductFields.includes(fieldName)) {
            if (this.ilegalValue(fieldValue, illegalProductChars)) {
                fieldErrors.push('Input contains ilegal chars');
            }
        }
        else {
            if (this.ilegalValue(fieldValue, illegalChars)) {
                fieldErrors.push('Input contains ilegal chars');
            }
        }


        if (this.invalidLength(fieldValue, maxLengths[fieldName])) {
            fieldErrors.push('input is too long ');
        }

        return (fieldErrors.length > 0) ? fieldErrors : 'valid';
    }


    static hasNoValue(input) {
        return (input == null || input == '') ? true : false;
    }

    static ilegalValue(input, ilegal) {
        return (ilegal.test(input)) ? true : false;
    }

    static invalidLength(input, maxLengthAllowed) {
        return (input.length > maxLengthAllowed) ? true : false;
    }

    static sanitizeValues(input, replaceValue) {
        let sanitized = input.replace(sanitizeChars, replaceValue)
        return sanitized;
    }

    static assertFileIsImage(file) {
        if (!file.mimetype.includes('image', 0)) {
            throw new Error('Unsupported image format')
        }
    }

    static assertUniqueValue(collection, fieldName, fieldValue) {
        let validation = this.processData({ collection: collection, fieldName: fieldName, fieldValue: fieldValue });
        if (validation != "all data is valid") {
            return Promise.reject({ invalidInput: validation })
        }
        let query = {};
        if (isNaN(fieldValue)) {
            let regex = new RegExp("^" + fieldValue + "$", 'gi')
            query[fieldName] = regex;
        } else {
            query[fieldName] = parseInt(fieldValue);
        }
        return new Promise((resolve, reject) => {
            dbCollections[collection].find(query).limit(1).lean()
                .then(alreadyExists => {
                    if (alreadyExists.length > 0) {
                        resolve('Already Exists');
                    } else {
                        resolve('Unique');
                    }
                })
                .catch(err => {
                    reject({ message: 'Failed to assert unique value in db', errData: err });
                })
        })
    }
}

module.exports = InputValidator;