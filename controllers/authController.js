'use strict';
const fs = require('fs');
const User = require('../mongodb/dbModels').User;
const resHandler = require('../handlers/responseHandler');
const inputValidator = require('../handlers/inputValidator/inputValidator');
const uActivityController = require('./userActivityController');
const cartController = require('./cartController');
const jwt = require('jsonwebtoken');
let jwtSecret = (() => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    else if (fs.existsSync('env/dev_vars.js')) return require('../env/dev_vars').JWT_SECRET;
    else return null;
})();

class AuthController {

    static async signUp(userData) {
        try {            
            let validation = inputValidator.processData(userData);
            if (validation != "all data is valid") {
                return Promise.reject({ invalidInput: validation })
            }
            let newUser = await this.createNewUser(userData)
            let newActivityRecord = await uActivityController.createNewUserActivity(newUser._id)
            let newCartRecord = await cartController.createNewCart(newUser._id)
            if (newUser && newActivityRecord && newCartRecord) {
                return Promise.resolve(`User: ${newUser.Identification} signed up succesfuly. You can now login`)
            } else {
                throw ({ message: 'Failed to create necessary records for new user' })
            }
        } catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    }

    static createNewUser(userData) {
        let newUser = new User(userData)
        return newUser.save()
            .then(savedUser => {
                console.log('Saved new user', savedUser);
                return savedUser
            })
            .catch(err => {
                throw (err)
            })
    }

    static async signIn(credentials) {
        try {
            let validation = inputValidator.processData(credentials);
            if (validation != "all data is valid") {
                return Promise.reject({ invalidInput: validation })
            }
            let matchedUser = await this.findUserByCredentials(credentials);
            const authToken = jwt.sign(matchedUser, jwtSecret, { expiresIn: 7200 });
            let authState = {
                IsSignedIn: true,
                Token: authToken,
                User: matchedUser
            }
            return Promise.resolve(authState)
        }
        catch (err) {
            console.log(err);
            return Promise.reject(err)
        }
    }

    static async findUserByCredentials(credentials) {
        // find user record by email
        let foundUser = await User.find({ Email: credentials.Email }).limit(1)
        if (!foundUser || foundUser.length < 1) {
            throw ({ message: "No User registration under those credentials" });
        }
        // validate input password
        let passwordOk = await foundUser[0].matchPasswords(credentials.Password);
        if (passwordOk === true) {
            // if password validated remove password key and return the found user 
            let validUser = foundUser[0]._doc
            delete validUser.Password
            return validUser;
        } else {
            throw ({ message: "Incorrect credentials" })
        }
    }

    static verifyToken(req, res, next) {
        const authToken = req.headers.authorization;
        if (authToken == null || authToken == '') resHandler.error(res, 400, "No authentication token given", null);
        else {
            AuthController.validateAndDecodeToken(authToken)
                .then(decoded => {
                    if (decoded) {
                        // if there's no further route - return verified
                        if (req.path == '/') resHandler.success(res, 200, 'verified', null);
                        // if there's a further route - handle further route
                        else return next();
                    }
                })
                .catch(err => {
                    console.log(err)
                    return resHandler.error(res, 401, 'Failed to verify auth token validity', err, true);
                })
        }
    };

    static validateAndDecodeToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, jwtSecret, function (err, decodedToken) {
                if (err) {
                    return reject(err);
                }
                return resolve(decodedToken);
            });
        })
    }
}

module.exports = AuthController;