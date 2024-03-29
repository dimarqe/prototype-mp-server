const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordGenerator = require('generate-password');
const crypto = require('crypto-js');

const DriverModel = require('../models/driverModel');

const driverController = {
    //GET REQUESTS

    getDriver:
        async (req, res, next) => {
            if (req.user.ID && req.user.accessLevel == "driver") {
                StudentModel.findByID(req.user.ID, (err, doc) => {
                    if (err) {
                        return next(err);
                    }
                    else if (!doc || doc.length == 0) {
                        return res.status(404).json({
                            "error": true,
                            "message": "Account not found",
                            "data": null
                        });
                    }
                    else {
                        doc.TRN = undefined;
                        doc.accessCode = undefined;

                        return res.status(200).json({
                            "error": false,
                            "message": "Account successfully retrieved",
                            "data": doc
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,

    //POST REQUESTS

    signUp:
        async (req, res, next) => {
            if (req.user.ID && req.user.accessLevel == "admin") {
                //Validates data sent in request body
                //if we get approval sort out the encryption
                await body('TRN', 'Invalid TRN, must be integer').isInt().isLength({min:7}, {max:7}).trim().escape().run(req);
                await body('firstName', 'Invalid first name, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);
                await body('lastName', 'Invalid last name, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);
                await body('emailAddress', 'Invalid email address').isEmail().trim().escape().run(req);
                await body('telNumber', 'Invalid phone number, 15 number limit').isLength({ min: 7 }, { max: 15 }).trim().escape().run(req);
                await body('licensePlateNumber', 'Invalid plate #, 10 character limit').isLength({ min: 1 }, { max: 10 }).trim().escape().run(req);
                await body('vehicleCapacity', 'Invalid vehicle capacity, must be integer').isInt({ min: 1 }, { max: 127 }).trim().escape().run(req);
  
                const reqErrors = validationResult(req);

                //returns error information if invalid data contained in request body
                if (!reqErrors.isEmpty()) {
                    return res.status(400).json({
                        "error": true,
                        "message": reqErrors.array(),
                        "data": null
                    });
                }

                try {
                    var encryptedTRN = crypto.AES.encrypt(req.body.TRN, process.env.CRYPTO_KEY).toString();

                    //generates random password string
                    var password = passwordGenerator.generate({
                        length: 8,
                        numbers: true
                    });

                    //hashes password before saving to db
                    var passwordHash = await bcrypt.hash(password, 10);
                } catch (error) {
                    return next(error);
                }

                const newDriver = new DriverModel({
                    TRN : encryptedTRN,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    emailAddress: req.body.emailAddress,
                    accessCode: passwordHash,
                    telNumber: req.body.telNumber,
                    licensePlateNumber : req.body.licensePlateNumber,
                    vehicleCapacity: req.body.vehicleCapacity
                });

                DriverModel.save(newDriver, (err, doc) => {
                    if (err) {
                        return next(err);
                    }
                    else {
                        return res.status(201).json({
                            "error": false,
                            "message": "Account successfully created",
                            "data": {
                                "email": newDriver.emailAddress,
                                "password": password
                            }
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,
    login:
        async (req, res, next) => {
            await body('emailAddress', 'Invalid email address').isEmail().trim().escape().run(req);
            await body('password', 'Invalid password, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);

            const reqErrors = validationResult(req);

            if (!reqErrors.isEmpty()) {
                return res.status(400).json({
                    "error": true,
                    "message": reqErrors.array(),
                    "data": null
                });
            }

            DriverModel.findByEmail(req.body.emailAddress, (err, doc) => {
                if (err) {
                    return next(err);
                }
                else if (!doc || doc.length == 0) {
                    return res.status(404).json({
                        "error": true,
                        "message": "Incorrect login credentials",
                        "data": null
                    });
                }
                else {
                    bcrypt.compare(req.body.password, doc.accessCode, (err, result) => {
                        if (err) {
                            return next(err);
                        }
                        else if (result == true) {
                            const accessToken = jwt.sign({
                                "accessLevel": "driver",
                                "ID": doc.driverID
                            }, process.env.ACCESS_TOKEN, { expiresIn: "1d" });
                            
                            doc.TRN = undefined;
                            doc.accessCode = undefined;

                            return res.status(200).json({
                                "error": false,
                                "message": "User successfully logged in",
                                "data": {
                                    "token": accessToken,
                                    "user": doc
                                }
                            })
                        }
                        return res.status(404).json({
                            "error": true,
                            "message": "Incorrect login credentials",
                            "data": null
                        });
                    });
                }
            });
        }
    ,
    /////
    //PATCH REQUESTS

    updatePassword:
        async (req, res, next) => {
            if (req.user.ID && req.user.accessLevel == "driver") {
                await body('password', 'Invalid password, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);

                const reqErrors = validationResult(req);

                if (!reqErrors.isEmpty()) {
                    return res.status(400).json({
                        "error": true,
                        "message": reqErrors.array(),
                        "data": null
                    });
                }

                try {
                    //hashes password before saving to db
                    var passwordHash = await bcrypt.hash(req.body.password, 10);
                } catch (error) {
                    return next(error);
                }

                DriverModel.updatePassword(req.user.ID, passwordHash, (err, doc) => {
                    if (err) {
                        return next(err);
                    }
                    else if (doc.changedRows >= 1) {
                        return res.status(200).json({
                            "error": false,
                            "message": "Password successfully updated",
                            "data": null
                        });
                    }
                    else {
                        return res.status(500).json({
                            "error": true,
                            "message": "Password could not be updated",
                            "data": null
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,
    updatePhoneNumber:
        async (req, res, next) => {
            if (req.user.ID && req.user.accessLevel == "driver") {
                await body('phoneNumber', 'Invalid phone number, 15 number limit').isLength({ min: 1 }, { max: 15 }).trim().escape().run(req);

                const reqErrors = validationResult(req);

                if (!reqErrors.isEmpty()) {
                    return res.status(400).json({
                        "error": true,
                        "message": reqErrors.array(),
                        "data": null
                    });
                }

                DriverModel.updatePhoneNumber(req.user.ID, req.body.phoneNumber, (err, doc) => {
                    if (err) {
                        return next(err);
                    }
                    else if (doc.changedRows >= 1) {
                        return res.status(200).json({
                            "error": false,
                            "message": "Phone number successfully updated",
                            "data": null
                        });
                    }
                    else {
                        return res.status(500).json({
                            "error": true,
                            "message": "Phone number could not be updated",
                            "data": null
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,
    updateEmailAddress:
        async (req, res, next) => {
            if (req.user.ID && req.user.accessLevel == "driver") {
                await body('emailAddress', 'Invalid email address').isEmail().trim().escape().run(req);

                const reqErrors = validationResult(req);

                if (!reqErrors.isEmpty()) {
                    return res.status(400).json({
                        "error": true,
                        "message": reqErrors.array(),
                        "data": null
                    });
                }

                DriverModel.updateEmailAddress(req.user.ID, req.body.emailAddress, (err, doc) => {
                    if (err) {
                        return next(err);
                    }
                    else if (doc.changedRows >= 1) {
                        return res.status(200).json({
                            "error": false,
                            "message": "Email address successfully updated",
                            "data": null
                        });
                    }
                    else {
                        return res.status(500).json({
                            "error": true,
                            "message": "Email address could not be updated",
                            "data": null
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,

    //DELETE REQUESTS
    deleteAccount:
        (req, res, next)=>{
            if(req.user.ID && req.user.accessLevel == "driver"){
                DriverModel.delete(req.user.ID, (err, doc)=>{
                    if(err){
                        return next(err);
                    }
                    else if (doc.affectedRows >= 1) {
                        return res.status(200).json({
                            "error": false,
                            "message": "Account successfully deleted",
                            "data": null
                        });
                    }
                    else {
                        return res.status(500).json({
                            "error": true,
                            "message": "Error deleting account",
                            "data": null
                        });
                    }
                });
            }
            else {
                return res.status(403).json({
                    "error": true,
                    "message": "Invalid access token",
                    "data": null
                });
            }
        }
    ,
}

module.exports = driverController;