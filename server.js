//Module imports
const dotenv = require('dotenv').config({ path: './config/.env' });
const express = require('express');

//Route imports
const studentRoute = require('./routes/studentRoute');


//App and port initialization
const app = express();
const port = process.env.PORT || 3000;

//Base connection route
app.get('/', (req, res, next) => {
    return res.status(200).json({
        "message": "...Welcome",
        "data": null
    });
});

app.use(studentRoute);

//middleware that catches and returns an error for all undefined routes
app.use('*', (req, res, next) => {
    return res.status(404).json({
        "error":true,
        "message": "Undefined route",
        "data": null
    });
});

//error handling middleware
app.use((err, req, res, next) => {
    console.log(err);

    if (!res.headersSent) {
        return res.status(err.status || 500).json({
            "error": true,
            "message": err.message,
            "data": null
        })
    }
});

app.listen(port, () => {
    console.log("Just touch down on " + port);
});


