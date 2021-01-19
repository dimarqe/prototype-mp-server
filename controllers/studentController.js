const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordGenerator = require('generate-password');

const StudentModel = require('../models/studentModel');

const studentController = {
    signUp:
        async (req, res, next) => {
            //Validates data sent in request body
            await body('studentID', 'Invalid ID#, must be integer').isInt().trim().escape().run(req);
            await body('firstName', 'Invalid first name, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);
            await body('lastName', 'Invalid last name, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);
            await body('emailAddress', 'Invalid email address').isEmail().trim().escape().run(req);
            await body('telNumber', 'Invalid phone number, 15 number limit').isLength({ min: 7 }, { max: 15 }).trim().escape().run(req);
            await body('streetAddress', 'Invalid street address, 50 character limit').isLength({ min: 1 }, { max: 50 }).trim().escape().run(req);
            await body('district', 'Invalid district, 20 character limit').isLength({ min: 1 }, { max: 20 }).trim().escape().run(req);

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

            const newStudent = new StudentModel({
                studentID: req.body.studentID,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                emailAddress: req.body.emailAddress,
                accessCode: passwordHash,
                telNumber: req.body.telNumber,
                streetAddress: req.body.streetAddress,
                district: req.body.district
            });

            newStudent.save(newStudent, (err, doc) => {
                if (err) {
                    return next(err);
                }
                else {
                    return res.status(201).json({
                        "error": false,
                        "message": "Account successfully created",
                        "data": {
                            "email": newStudent.emailAddress,
                            "password": password
                        }
                    });
                }
            });
        }
    ,
    login:
        async (req, res, next) => {
            await body('studentID', 'Invalid ID#, must be integer').isInt().trim().escape().run(req);
            await body('password', 'Invalid password, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);

            const reqErrors = validationResult(req);

            if (!reqErrors.isEmpty()) {
                return res.status(400).json({
                    "error": true,
                    "message": reqErrors.array(),
                    "data": null
                });
            }

            StudentModel.findByEmail(req.body.studentID, (err, doc) => {
                if (err) {
                    return next(err);
                }
                else if (!doc || doc.length == 0) {
                    return res.status(400).json({
                        "error": true,
                        "message": "Student ID# not assigned to an account",
                        "data": null
                    })
                }
                else {
                    bcrypt.compare(req.body.password, doc.accessCode, (err, result) => {
                        if (err) {
                            return next(err);
                        }
                        else if (result == true) {
                            const accessToken = jwt.sign({ "ID": doc.studentID }, process.env.ACCESS_TOKEN, {expiresIn:"1d"});
                            doc.accessCode = undefined;
                            
                            return res.status(200).json({
                                "error":false,
                                "message": "User successfully logged in",
                                "data": {
                                    "token": accessToken,
                                    "user": doc
                                }
                            })
                        }
                        return res.status(400).json({
                            "error":true,
                            "message": "Incorrect login credentials",
                            "data": null
                        });
                    });
                }
            });
        }
    ,
    updatePassword:
        async (req, res, next)=>{
            await body('password', 'Invalid password, 30 character limit').isLength({ min: 1 }, { max: 30 }).trim().escape().run(req);

            const reqErrors = validationResult(req);

            if (!reqErrors.isEmpty()) {
                return res.status(400).json({
                    "error": true,
                    "message": reqErrors.array(),
                    "data": null
                });
            }

            if(req.user.ID){
                try {    
                    //hashes password before saving to db
                    var passwordHash = await bcrypt.hash(req.body.password, 10);
                } catch (error) {
                    return next(error);
                }

                StudentModel.updatePassword(req.user.ID, passwordHash, (err, doc)=>{
                    if(err){
                        return next(err);
                    }
                    else{
                        return res.status(200).json({
                            "error": false,
                            "message": "Password successfully updated",
                            "data": null
                        });
                    }
                });
            }
            else{
                return res.status(400).json({
                    "error":true,
                    "message": "Request missing ID#",
                    "data": null
                });
            }
        }
    ,
}

module.exports = studentController;