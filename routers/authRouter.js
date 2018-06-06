'use strict';
const authRouter = require('express').Router()
const inputValidator = require('../handlers/inputValidator/inputValidator');
const resHandler = require('../handlers/responseHandler');
const authController = require('../controllers/authController');

// async form field validator - checks if values already exists in db
authRouter.get('/assertUniqueValue/:collection', (req, res, next) => {
    let collection = req.params.collection;
    let fieldName = req.query.fieldName;
    let fieldValue = req.query.fieldValue;
    return inputValidator.assertUniqueValue(collection, fieldName, fieldValue)
        .then(txtResult => {
            resHandler.success(res, 200, txtResult, null)
        })
        .catch(err => {
            resHandler.error(res, 500, 'Validation err - failed assert value is unique', err)
        })
})

// signup new user
authRouter.post('/signup', (req, res) => {
    const userData = req.body;

    if (!userData) {
        resHandler.error(res, 400, "No registration data found", null)
    }
    else {
        authController.signUp(userData)
            .then(txtResult => {
                resHandler.success(res, 201, txtResult, null)
            })
            .catch(err => {
                resHandler.error(res, 500, 'Signup error: Failed during sign-up process. Please refer to console for exact reason.', err)
            })
    }
})

authRouter.post('/signin', (req, res) => {
    //email and password
    const credentials = req.body;
    if (!credentials) {
        resHandler.error(res, 400, "No sign-in credentials found", null)
    } else {
        authController.signIn(credentials)
            .then(signInState => {
                // res.header('authorization', signInState.jwtToken)
                resHandler.success(res, 200, 'Signed in successfuly', signInState)
            })
            .catch(err => {
                if ('message' in err) {
                    if (err.message == "No User registration under those credentials" || err.message == "Incorrect credentials") {
                        return resHandler.error(res, 404, err.message, err)
                    }
                }
                //else//
                return resHandler.error(res, 500, 'Signin error: Failed during sign-in process. Please refer to console for exact reason.', err)
            })
    }
})

module.exports = authRouter;