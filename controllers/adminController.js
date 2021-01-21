const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AdminModel = require('../models/adminModel');

const adminController = {
    login:
        async (req, res, next) => {
            await body('adminID', 'Invalid ID#, must be integer').isInt().trim().escape().run(req);
            await body('password', 'Invalid password, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);

            const reqErrors = validationResult(req);

            if (!reqErrors.isEmpty()) {
                return res.status(400).json({
                    "error": true,
                    "message": reqErrors.array(),
                    "data": null
                });
            }

            AdminModel.findByID(req.body.adminID, (err, doc) => {
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
                                "accessLevel": "admin",
                                "ID": doc.adminID
                            }, process.env.ACCESS_TOKEN, { expiresIn: "1d" });


                            return res.status(200).json({
                                "error": false,
                                "message": "User successfully logged in",
                                "data": {
                                    "token": accessToken
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
}


module.exports = adminController;